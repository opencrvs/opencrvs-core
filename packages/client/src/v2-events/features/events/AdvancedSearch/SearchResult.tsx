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
import { defineMessages, useIntl } from 'react-intl'
import { useTheme } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import {
  EventIndex,
  EventConfig,
  defaultWorkqueueColumns,
  WorkqueueColumn,
  deepDropNulls,
  applyDraftsToEventIndex
} from '@opencrvs/commons/client'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import {
  ColumnContentAlignment,
  Workqueue
} from '@opencrvs/components/lib/Workqueue'
import { Link as TextButton } from '@opencrvs/components'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { WQContentWrapper } from '@client/v2-events/features/workqueues/components/ContentWrapper'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { formattedDuration } from '@client/utils/date-formatting'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useEventTitle } from '../useEvents/useEventTitle'
import { SearchModifierComponent } from './SearchModifier'

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

interface Column {
  label?: string
  width: number
  key: string
  sortFunction?: (columnName: string) => void
  isActionColumn?: boolean
  isSorted?: boolean
  alignment?: ColumnContentAlignment
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

export const searchResultMessages = {
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
  }
}

const messages = defineMessages(searchResultMessages)

interface Props {
  columns: WorkqueueColumn[]
  eventConfigs: EventConfig[]
  searchParams: Record<string, string>
  queryData: EventIndex[]
}

export const SearchResultComponent = ({
  columns,
  queryData,
  eventConfigs
}: {
  columns: WorkqueueColumn[]
  eventConfigs: EventConfig[]
  queryData: EventIndex[]
}) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const { width: windowWidth } = useWindowSize()
  const theme = useTheme()
  const { getEventTitle } = useEventTitle()

  const { getOutbox } = useEvents()
  const { getRemoteDrafts } = useDrafts()
  const outbox = getOutbox()
  const drafts = getRemoteDrafts()

  const [sortedCol, setSortedCol] = useState<
    (typeof COLUMNS)[keyof typeof COLUMNS]
  >(COLUMNS.NONE)
  const [sortOrder, setSortOrder] = useState<
    (typeof SORT_ORDER)[keyof typeof SORT_ORDER]
  >(SORT_ORDER.ASCENDING)

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCol(newSortedCol)
    setSortOrder(newSortOrder)
  }

  const transformData = (eventData: EventIndex[]) => {
    return (
      eventData
        /*
         * Apply pending drafts to the event index.
         * This is necessary to show the most up to date information in the workqueue.
         */
        .map((event) =>
          deepDropNulls(
            applyDraftsToEventIndex(
              event,
              drafts.filter((d) => d.eventId === event.id)
            )
          )
        )
        .map((event) => {
          const eventConfig = eventConfigs.find(({ id }) => id === event.type)
          if (!eventConfig) {
            throw new Error(
              'Event configuration not found for event:' + event.type
            )
          }
          const { useFallbackTitle, title } = getEventTitle(eventConfig, event)
          const { declaration, ...rest } = event

          return {
            ...rest,
            useFallbackTitle,
            title,
            label: eventConfig.label,
            ...declaration
          }
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

          const status = doc.status

          return {
            ...doc,
            type: intl.formatMessage(doc.label),
            createdAt: formattedDuration(new Date(doc.createdAt)),
            updatedAt: formattedDuration(new Date(doc.updatedAt)),
            status: intl.formatMessage(
              {
                id: `v2.events.status`,
                defaultMessage:
                  '{status, select, OUTBOX {Syncing..} CREATED {Draft} VALIDATED {Validated} DRAFT {Draft} DECLARED {Declared} REGISTERED {Registered} CERTIFIED {Certified} REJECTED {Requires update} ARCHIVED {Archived} MARKED_AS_DUPLICATE {Marked as a duplicate} NOTIFIED {In progress} other {Unknown}}'
              },
              {
                status: getEventStatus()
              }
            ),
            title: isInOutbox ? (
              <IconWithName name={doc.title} status={status} />
            ) : (
              <TextButton
                color={doc.useFallbackTitle ? 'red' : 'primary'}
                onClick={() => {
                  return navigate(
                    ROUTES.V2.EVENTS.OVERVIEW.buildPath({
                      eventId: doc.id
                    })
                  )
                }}
              >
                <IconWithName name={doc.title} status={status} />
              </TextButton>
            )
          }
        })
    )
  }

  function getDefaultColumns(): Array<Column> {
    return defaultWorkqueueColumns.map(
      ({ label, value }): Column => ({
        label: intl.formatMessage(label),
        width: 25,
        key: value.$event,
        sortFunction: onColumnClick,
        isSorted: sortedCol === value.$event
      })
    )
  }

  // @todo: update when workqueue actions buttons are updated
  // @TODO: separate types for action button vs other columns
  function getColumns(): Array<Column> {
    if (windowWidth > theme.grid.breakpoints.lg) {
      return columns.map(({ label, value }) => ({
        label: intl.formatMessage(label),
        width: 35,
        key: value.$event,
        sortFunction: onColumnClick,
        isSorted: sortedCol === value.$event
      }))
    } else {
      return columns
        .map(({ label, value }) => ({
          label: intl.formatMessage(label),
          width: 35,
          key: value.$event,
          sortFunction: onColumnClick,
          isSorted: sortedCol === value.$event
        }))
        .slice(0, 2)
    }
  }
  return (
    <Workqueue
      columns={[...getDefaultColumns(), ...getColumns()]}
      content={transformData(queryData)}
      hideLastBorder={true}
    />
  )
}

export const SearchResult = ({
  columns,
  eventConfigs,
  searchParams,
  queryData
}: Props) => {
  const intl = useIntl()
  const total = queryData.length
  const noResultText = intl.formatMessage(messages.noResult)

  return (
    <WQContentWrapper
      isMobileSize={false}
      noContent={total < 1}
      noResultText={noResultText}
      tabBarContent={
        <SearchModifierComponent
          eventType={eventConfigs[0].id}
          searchParams={searchParams}
        />
      }
      title={`${intl.formatMessage(messages.searchResult)} ${
        ' (' + total + ')'
      }`}
    >
      <SearchResultComponent
        columns={columns}
        eventConfigs={eventConfigs}
        queryData={queryData}
      />
    </WQContentWrapper>
  )
}
