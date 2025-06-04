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
import { orderBy } from 'lodash'
import styled from 'styled-components'
import {
  EventIndex,
  EventConfig,
  defaultWorkqueueColumns,
  WorkqueueColumn,
  deepDropNulls,
  applyDraftsToEventIndex,
  EventState
} from '@opencrvs/commons/client'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import {
  ColumnContentAlignment,
  SORT_ORDER,
  Workqueue
} from '@opencrvs/components/lib/Workqueue'
import { Link as TextButton } from '@opencrvs/components'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { WQContentWrapper } from '@client/v2-events/features/workqueues/components/ContentWrapper'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { formattedDuration } from '@client/utils/date-formatting'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { SearchCriteriaPanel } from '@client/v2-events/features/events/AdvancedSearch/SearchCriteriaPanel'
import { useEventTitle } from '../useEvents/useEventTitle'

const WithTestId = styled.div.attrs({
  'data-testid': 'search-result'
})``

const COLUMNS = {
  ICON_WITH_NAME: 'iconWithName',
  ICON_WITH_NAME_EVENT: 'iconWithNameEvent',
  EVENT: 'type',
  DATE_OF_EVENT: 'dateOfEvent',
  SENT_FOR_REVIEW: 'sentForReview',
  SENT_FOR_UPDATES: 'sentForUpdates',
  SENT_FOR_APPROVAL: 'sentForApproval',
  SENT_FOR_VALIDATION: 'sentForValidation',
  REGISTERED: 'registered',
  LAST_UPDATED: 'updatedAt',
  ACTIONS: 'actions',
  NOTIFICATION_SENT: 'notificationSent',
  NAME: 'title',
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

const searchResultMessages = {
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
  eventStatus: {
    id: `v2.events.status`,
    defaultMessage:
      '{status, select, OUTBOX {Syncing..} CREATED {Draft} VALIDATED {Validated} DRAFT {Draft} DECLARED {Declared} REGISTERED {Registered} CERTIFIED {Certified} REJECTED {Requires update} ARCHIVED {Archived} MARKED_AS_DUPLICATE {Marked as a duplicate} NOTIFIED {In progress} other {Unknown}}'
  }
}

const messages = defineMessages(searchResultMessages)

interface Props {
  columns: WorkqueueColumn[]
  eventConfig: EventConfig
  searchParams: EventState
  queryData: EventIndex[]
}

const ExtendedEventStatuses = {
  OUTBOX: 'OUTBOX',
  DRAFT: 'DRAFT'
} as const

export const SearchResultComponent = ({
  columns,
  queryData,
  eventConfigs,
  limit = 10,
  offset = 0,
  title: contentTitle,
  tabBarContent
}: {
  columns: WorkqueueColumn[]
  eventConfigs: EventConfig[]
  queryData: EventIndex[]
  limit?: number
  offset?: number
  title: string
  tabBarContent?: React.ReactNode
}) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const { width: windowWidth } = useWindowSize()
  const theme = useTheme()
  const { getEventTitle } = useEventTitle()
  const [currentPageNumber, setCurrentPageNumber] = React.useState(1)

  const { getOutbox } = useEvents()
  const { getRemoteDrafts } = useDrafts()
  const outbox = getOutbox()
  const drafts = getRemoteDrafts()

  const [sortedCol, setSortedCol] = useState<
    (typeof COLUMNS)[keyof typeof COLUMNS]
  >(COLUMNS.LAST_UPDATED)
  const [sortOrder, setSortOrder] = useState<
    (typeof SORT_ORDER)[keyof typeof SORT_ORDER]
  >(SORT_ORDER.DESCENDING)

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCol(newSortedCol)
    setSortOrder(newSortOrder)
  }

  const mapEventsToWorkqueueRows = (
    eventData: (EventIndex & {
      title: string | null
      useFallbackTitle: boolean
    })[]
  ) => {
    return eventData
      .map((event) => {
        const eventConfig = eventConfigs.find(({ id }) => id === event.type)
        if (!eventConfig) {
          throw new Error(
            'Event configuration not found for event:' + event.type
          )
        }

        return {
          label: eventConfig.label,
          ...event
        }
      })
      .map((doc) => {
        const isInOutbox = outbox.some(
          (outboxEvent) => outboxEvent.id === doc.id
        )
        const isInDrafts = drafts.some((draft) => draft.id === doc.id)

        const getEventStatus = () => {
          if (isInOutbox) {
            return ExtendedEventStatuses.OUTBOX
          }
          if (isInDrafts) {
            return ExtendedEventStatuses.DRAFT
          }
          return doc.status
        }

        const status = getEventStatus()
        return {
          ...doc,
          type: intl.formatMessage(doc.label),
          createdAt: formattedDuration(new Date(doc.createdAt)),
          updatedAt: formattedDuration(new Date(doc.updatedAt)),
          status: intl.formatMessage(messages.eventStatus, {
            status
          }),
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
  const paginatedData = queryData.slice(
    limit * (currentPageNumber - 1),
    limit * currentPageNumber
  )

  const dataWithDraft = paginatedData
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

  const dataWithTitle = dataWithDraft.map((event) => {
    const eventConfig = eventConfigs.find(({ id }) => id === event.type)
    if (!eventConfig) {
      throw new Error('Event configuration not found for event:' + event.type)
    }
    const { useFallbackTitle, title } = getEventTitle(eventConfig, event)

    return { ...event, title, useFallbackTitle }
  })

  const sortedResult = orderBy(dataWithTitle, sortedCol, sortOrder)

  const allResults = mapEventsToWorkqueueRows(sortedResult)

  const totalPages = queryData.length ? Math.ceil(queryData.length / limit) : 0

  const isShowPagination = totalPages > 1

  return (
    <WithTestId>
      <WQContentWrapper
        error={false}
        isMobileSize={windowWidth < theme.grid.breakpoints.lg}
        isShowPagination={isShowPagination}
        noContent={queryData.length === 0}
        noResultText={intl.formatMessage(messages.noResult)}
        paginationId={currentPageNumber}
        tabBarContent={tabBarContent}
        title={contentTitle}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPageNumber(page)}
      >
        <Workqueue
          columns={[...getDefaultColumns(), ...getColumns()]}
          content={allResults}
          hideLastBorder={!isShowPagination}
          sortOrder={sortOrder}
        />
      </WQContentWrapper>
    </WithTestId>
  )
}
export const SearchResult = ({
  columns,
  eventConfig,
  searchParams,
  queryData
}: Props) => {
  const intl = useIntl()
  const total = queryData.length

  return (
    <SearchResultComponent
      columns={columns}
      eventConfigs={[eventConfig]}
      queryData={queryData}
      tabBarContent={
        <SearchCriteriaPanel
          eventConfig={eventConfig}
          searchParams={searchParams}
        />
      }
      title={`${intl.formatMessage(messages.searchResult)} ${
        ' (' + total + ')'
      }`}
    />
  )
}
