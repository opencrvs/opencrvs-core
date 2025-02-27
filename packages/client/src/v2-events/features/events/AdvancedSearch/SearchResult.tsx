/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import React, { useState } from 'react'
import { parse } from 'query-string'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { defineMessages, useIntl } from 'react-intl'
import styled, { useTheme } from 'styled-components'
import { Link } from 'react-router-dom'
import { mapKeys } from 'lodash'
import { ErrorText } from '@opencrvs/components/lib'
import {
  EventSearchIndex,
  FieldConfig,
  FieldValue,
  getAllFields,
  validateFieldInput,
  workqueues,
  defaultColumns,
  getOrThrow
} from '@opencrvs/commons/client'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import {
  Workqueue,
  ColumnContentAlignment
} from '@opencrvs/components/lib/Workqueue'
import { ITheme } from '@opencrvs/components/lib/theme'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { getAllUniqueFields } from '@client/v2-events/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { WQContentWrapper } from '@client/v2-events/features/workqueues/components/ContentWrapper'
import { LoadingIndicator } from '@client/v2-events/components/LoadingIndicator'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { setEmptyValuesForFields } from '@client/v2-events/components/forms/utils'
import { formattedDuration } from '@client/utils/date-formatting'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/features/workqueues/utils'
import { WorkqueueLayout } from '@client/v2-events/layouts/workqueues'

const SORT_ORDER = {
  ASCENDING: 'asc',
  DESCENDING: 'desc'
} as const

const COLUMNS = {
  ICON_WITH_NAME: 'iconWithName',
  ICON_WITH_NAME_EVENT: 'iconWithNameEvent',
  EVENT: 'event',
  DATE_OF_EVENT: 'dateOfEvent',
  SENT_FOR_REVIEW: 'sentForReview',
  SENT_FOR_UPDATES: 'sentForUpdates',
  SENT_FOR_APPROVAL: 'sentForApproval',
  SENT_FOR_VALIDATION: 'sentForValidation',
  REGISTERED: 'registered',
  LAST_UPDATED: 'lastUpdated',
  ACTIONS: 'actions',
  NOTIFICATION_SENT: 'notificationSent',
  NAME: 'name',
  TRACKING_ID: 'trackingId',
  REGISTRATION_NO: 'registrationNumber',
  NONE: 'none'
} as const

const NondecoratedLink = styled(Link)`
  text-decoration: none;
  color: 'primary';
`

interface Column {
  label?: string
  width: number
  key: string
  sortFunction?: (columnName: string) => void
  isActionColumn?: boolean
  isSorted?: boolean
  alignment?: ColumnContentAlignment
}

function validateEventSearchParams(
  fields: FieldConfig[],
  values: Record<string, any>
) {
  const errors = fields.reduce(
    (
      errorResults: { message: string; id: string; value: FieldValue }[],
      field: FieldConfig
    ) => {
      const fieldErrors = validateFieldInput({
        field: { ...field, required: false },
        value: values[field.id]
      })

      if (fieldErrors.length === 0) {
        return errorResults
      }

      // For backend, use the default message without translations.
      const errormessageWithId = fieldErrors.map((error) => ({
        message: error.message.defaultMessage,
        id: field.id,
        value: values[field.id]
      }))

      return [...errorResults, ...errormessageWithId]
    },
    []
  )

  return errors
}

function changeSortedColumn(
  columnName: string,
  presentSortedCol: (typeof COLUMNS)[keyof typeof COLUMNS],
  presentSortOrder: (typeof SORT_ORDER)[keyof typeof SORT_ORDER]
) {
  let newSortedCol: (typeof COLUMNS)[keyof typeof COLUMNS]
  let newSortOrder: (typeof SORT_ORDER)[keyof typeof SORT_ORDER] =
    SORT_ORDER.ASCENDING

  switch (columnName) {
    case COLUMNS.ICON_WITH_NAME:
      newSortedCol = COLUMNS.NAME
      break
    case COLUMNS.NAME:
      newSortedCol = COLUMNS.NAME
      break
    case COLUMNS.EVENT:
      newSortedCol = COLUMNS.EVENT
      break
    case COLUMNS.DATE_OF_EVENT:
      newSortedCol = COLUMNS.DATE_OF_EVENT
      break
    case COLUMNS.SENT_FOR_REVIEW:
      newSortedCol = COLUMNS.SENT_FOR_REVIEW
      break
    case COLUMNS.SENT_FOR_UPDATES:
      newSortedCol = COLUMNS.SENT_FOR_UPDATES
      break
    case COLUMNS.SENT_FOR_APPROVAL:
      newSortedCol = COLUMNS.SENT_FOR_APPROVAL
      break
    case COLUMNS.REGISTERED:
      newSortedCol = COLUMNS.REGISTERED
      break
    case COLUMNS.SENT_FOR_VALIDATION:
      newSortedCol = COLUMNS.SENT_FOR_VALIDATION
      break
    case COLUMNS.NOTIFICATION_SENT:
      newSortedCol = COLUMNS.NOTIFICATION_SENT
      break
    case COLUMNS.LAST_UPDATED:
      newSortedCol = COLUMNS.LAST_UPDATED
      break
    case COLUMNS.TRACKING_ID:
      newSortedCol = COLUMNS.TRACKING_ID
      break
    case COLUMNS.REGISTRATION_NO:
      newSortedCol = COLUMNS.REGISTRATION_NO
      break
    default:
      newSortedCol = COLUMNS.NONE
  }

  if (newSortedCol === presentSortedCol) {
    if (presentSortOrder === SORT_ORDER.ASCENDING) {
      newSortOrder = SORT_ORDER.DESCENDING
    } else {
      newSortOrder = SORT_ORDER.ASCENDING
      newSortedCol = COLUMNS.NONE
    }
  }

  return {
    newSortedCol: newSortedCol,
    newSortOrder: newSortOrder
  }
}

const messagesToDefine = {
  noResult: {
    id: 'v2.search.noResult',
    defaultMessage: 'No results',
    description: 'The no result text'
  },
  searchResult: {
    defaultMessage: 'Search results',
    description:
      'The label for search result header in advancedSearchResult page',
    id: 'v2.advancedSearchResult.table.searchResult'
  },
  name: {
    defaultMessage: 'Name',
    description: 'Name label',
    id: 'v2.onstants.name'
  },
  event: {
    defaultMessage: 'Event',
    description: 'Label for Event of event in work queue list item',
    id: 'v2.constants.event'
  },
  eventDate: {
    defaultMessage: 'Date of event',
    description: 'Label for event date in list item',
    id: 'v2.constants.eventDate'
  },
  noResults: {
    defaultMessage: 'No result',
    description:
      'Text to display if the search return no results for the current filters',
    id: 'v2.constants.noResults'
  },
  queryError: {
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails',
    id: 'v2.error.search'
  }
}

const messages = defineMessages(messagesToDefine)

interface IProps {
  theme: ITheme
}

export const SearchResult = (props: IProps) => {
  const intl = useIntl()
  const { search, getOutbox, getDrafts } = useEvents()
  const flattenedIntl = useIntlFormatMessageWithFlattenedParams()
  const { width: windowWidth } = useWindowSize()
  const theme = useTheme()
  const { eventType } = useTypedParams(ROUTES.V2.SEARCH_RESULT)
  const { eventConfiguration } = useEventConfiguration(eventType)

  const [sortedCol, setSortedCol] = useState<
    (typeof COLUMNS)[keyof typeof COLUMNS]
  >(COLUMNS.NONE)
  const [sortOrder, setSortOrder] = useState<
    (typeof SORT_ORDER)[keyof typeof SORT_ORDER]
  >(SORT_ORDER.ASCENDING)

  const searchParams = parse(window.location.search)

  const allFields = getAllUniqueFields(eventConfiguration)
  const outbox = getOutbox()
  const drafts = getDrafts()

  const fieldValueErrors = validateEventSearchParams(allFields, searchParams)

  const {
    data: queryData,
    isLoading,
    error
  } = search({
    ...searchParams,
    type: eventType
  })

  const total = queryData?.length || 0
  const workqueueId = 'all'
  const workqueueConfig =
    workqueueId in workqueues
      ? workqueues[workqueueId as keyof typeof workqueues]
      : null

  if (!workqueueConfig) {
    return null
  }

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCol(newSortedCol)
    setSortOrder(newSortOrder)
  }

  const transformData = (eventData: EventSearchIndex[]) => {
    return eventData
      .map((event) => {
        const { data, ...rest } = event
        return { ...rest, ...mapKeys(data, (_, key) => `${key}`) }
      })
      .map((doc) => {
        const isInOutbox = outbox.some(
          (outboxEvent) => outboxEvent.id === doc.id
        )
        const isInDrafts = drafts.some((draft) => draft.id === doc.id)

        const getEventStatus = () => {
          if (isInOutbox) {
            return 'OUTBOX'
          }
          if (isInDrafts) {
            return 'DRAFT'
          }
          return doc.status
        }

        const eventWorkqueue = getOrThrow(
          eventConfiguration.workqueues.find(
            (wq) => wq.id === workqueueConfig.id
          ),
          `Could not find workqueue config for ${workqueueConfig.id}`
        )

        const allPropertiesWithEmptyValues = setEmptyValuesForFields(
          getAllFields(eventConfiguration)
        )

        const fieldsWithPopulatedValues: Record<string, string> =
          eventWorkqueue.fields.reduce(
            (acc, field) => ({
              ...acc,
              [field.column]: flattenedIntl.formatMessage(field.label, {
                ...allPropertiesWithEmptyValues,
                ...doc
              })
            }),
            {}
          )
        const titleColumnId = workqueueConfig.columns[0].id
        const status = doc.status

        return {
          ...fieldsWithPopulatedValues,
          ...doc,
          event: intl.formatMessage(eventConfiguration.label),
          createdAt: formattedDuration(new Date(doc.createdAt)),
          modifiedAt: formattedDuration(new Date(doc.modifiedAt)),
          status: intl.formatMessage(
            {
              id: `events.status`,
              defaultMessage:
                '{status, select, OUTBOX {Syncing..} CREATED {Draft} VALIDATED {Validated} DRAFT {Draft} DECLARED {Declared} REGISTERED {Registered} other {Unknown}}'
            },
            {
              status: getEventStatus()
            }
          ),
          [titleColumnId]: (
            <NondecoratedLink
              to={ROUTES.V2.EVENTS.OVERVIEW.buildPath({
                eventId: doc.id
              })}
            >
              <IconWithName
                name={fieldsWithPopulatedValues[titleColumnId]}
                status={status}
              />
            </NondecoratedLink>
          )
        }
      })
  }

  function getDefaultColumns(): Array<Column> {
    return (
      (workqueueConfig &&
        workqueueConfig.defaultColumns.map(
          (column): Column => ({
            label:
              column in defaultColumns
                ? intl.formatMessage(
                    defaultColumns[column as keyof typeof defaultColumns].label
                  )
                : '',
            width: 25,
            key: column,
            sortFunction: onColumnClick,
            isSorted: sortedCol === column
          })
        )) ??
      []
    )
  }

  // @todo: update when workqueue actions buttons are updated
  // @TODO: separate types for action button vs other columns
  function getColumns(): Array<Column> {
    if (windowWidth > theme.grid.breakpoints.lg) {
      return (
        (workqueueConfig &&
          workqueueConfig.columns.map((column) => ({
            label: intl.formatMessage(column.label),
            width: 35,
            key: column.id,
            sortFunction: onColumnClick,
            isSorted: sortedCol === column.id
          }))) ??
        []
      )
    } else {
      return (
        (workqueueConfig &&
          workqueueConfig.columns
            .map((column) => ({
              label: intl.formatMessage(column.label),
              width: 35,
              key: column.id,
              sortFunction: onColumnClick,
              isSorted: sortedCol === column.id
            }))
            .slice(0, 2)) ??
        []
      )
    }
  }

  let content
  let noResultText = intl.formatMessage(messages.noResult)
  if (isLoading) {
    content = (
      <div id="advanced-search_loader">
        <LoadingIndicator loading={true} />
      </div>
    )
  } else if (error || fieldValueErrors.length > 0) {
    noResultText = ''
    content = (
      <ErrorText id="advanced-search-result-error-text">
        {intl.formatMessage(messages.queryError)}
      </ErrorText>
    )
  } else if (queryData && total > 0) {
    content = (
      <Workqueue
        columns={getColumns().concat(getDefaultColumns())}
        content={transformData(queryData)}
        hideLastBorder={true}
        noResultText={intl.formatMessage(messages.noResults)}
      />
    )
  }
  return (
    <div>
      <WorkqueueLayout>
        <WQContentWrapper
          isMobileSize={false}
          noContent={total < 1 && !isLoading}
          noResultText={noResultText}
          title={`${intl.formatMessage(messages.searchResult)} ${
            isLoading ? '' : ' (' + total + ')'
          }`}
        >
          {content}
        </WQContentWrapper>
      </WorkqueueLayout>
    </div>
  )
}
