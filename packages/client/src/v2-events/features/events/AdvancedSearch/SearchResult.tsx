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
import { useTheme } from 'styled-components'
import { ErrorText } from '@opencrvs/components/lib'
import {
  EventSearchIndex,
  FieldConfig,
  FieldValue,
  validateFieldInput
} from '@opencrvs/commons/client'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import { Workqueue, IColumn } from '@opencrvs/components/lib/Workqueue'
import { ITheme } from '@opencrvs/components/lib/theme'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { getAllUniqueFields } from '@client/v2-events/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { WQContentWrapper } from '@client/v2-events/features/workqueues/components/ContentWrapper'
import { LoadingIndicator } from '@client/v2-events/components/LoadingIndicator'
import { IconWithName } from '@client/v2-events/components/IconWithName'

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

const ColumnContentAlignment = {
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center'
} as const

function validateEventSearchParams(
  fields: FieldConfig[],
  values: Record<string, any>
): Record<string, FieldValue> {
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

  if (errors) {
    console.log(errors)
  }

  return values as Record<string, FieldValue>
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
  noResultFor: {
    id: 'v2.search.noResultFor',
    defaultMessage: 'No results for ”{param}”',
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
  const { search } = useEvents()
  const { width: windowWidth } = useWindowSize()
  const theme = useTheme()

  const [sortedCol, setSortedCol] = useState<
    (typeof COLUMNS)[keyof typeof COLUMNS]
  >(COLUMNS.NONE)
  const [sortOrder, setSortOrder] = useState<
    (typeof SORT_ORDER)[keyof typeof SORT_ORDER]
  >(SORT_ORDER.ASCENDING)

  const searchParams = parse(window.location.search)
  const { eventType } = useTypedParams(ROUTES.V2.SEARCH_RESULT)

  const { eventConfiguration } = useEventConfiguration(eventType)
  const allFields = getAllUniqueFields(eventConfiguration)

  validateEventSearchParams(allFields, searchParams)

  const {
    data: queryData,
    isLoading,
    error
  } = search({
    ...searchParams,
    type: eventType
  })

  const total = queryData?.length || 0
  const searchText = 'searchText'

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCol(newSortedCol)
    setSortOrder(newSortOrder)
  }

  const transformData = (data: EventSearchIndex[]) => {
    return data.map((doc) => {
      // @todo get the name from the event data
      const Name =
        doc.data?.['applicant.firstname'] +
        ' ' +
        doc.data?.['applicant.surname']
      const event = intl.formatMessage(eventConfiguration.label)
      const dateOfEvent = new Date(doc.createdAt).toLocaleDateString()

      return {
        iconWithName: <IconWithName name={Name} />,
        event,
        dateOfEvent
      }
    })
  }

  const getContentTableColumns = () => {
    if (windowWidth > theme.grid.breakpoints.lg) {
      return [
        {
          width: 35,
          label: intl.formatMessage(messages.name),
          key: COLUMNS.ICON_WITH_NAME,
          isSorted: sortedCol === COLUMNS.NAME,
          sortFunction: onColumnClick
        },
        {
          label: intl.formatMessage(messages.event),
          width: 20,
          key: COLUMNS.EVENT
        },
        {
          label: intl.formatMessage(messages.eventDate),
          width: 20,
          key: COLUMNS.DATE_OF_EVENT,
          isSorted: sortedCol === COLUMNS.DATE_OF_EVENT,
          sortFunction: onColumnClick
        },
        {
          width: 25,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ] as IColumn[]
    } else {
      return [
        {
          label: intl.formatMessage(messages.name),
          width: 70,
          key: COLUMNS.ICON_WITH_NAME_EVENT
        },
        {
          width: 30,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ] as IColumn[]
    }
  }

  let content
  if (isLoading) {
    content = (
      <div id="advanced-search_loader">
        <LoadingIndicator loading={true} />
      </div>
    )
  } else if (error) {
    content = (
      <ErrorText id="advanced-search-result-error-text">
        {intl.formatMessage(messages.queryError)}
      </ErrorText>
    )
  } else if (queryData && total > 0) {
    content = (
      <Workqueue
        columns={getContentTableColumns()}
        content={transformData(queryData)}
        hideLastBorder={true}
        noResultText={intl.formatMessage(messages.noResults)}
      />
    )
  }
  return (
    <div>
      <WQContentWrapper
        isMobileSize={false}
        noContent={total < 1 && !isLoading}
        noResultText={intl.formatMessage(messages.noResultFor, {
          param: searchText
        })}
        title={`${intl.formatMessage(messages.searchResult)} ${
          isLoading ? '' : ' (' + total + ')'
        }`}
      >
        {content}
      </WQContentWrapper>
    </div>
  )
}
