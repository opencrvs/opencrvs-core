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
import React, { useState, PropsWithChildren } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useTheme } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { orderBy, first } from 'lodash'
import styled from 'styled-components'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  EventIndex,
  EventConfig,
  defaultWorkqueueColumns,
  WorkqueueColumn,
  deepDropNulls,
  applyDraftToEventIndex,
  WorkqueueActionsWithDefault,
  isMetaAction,
  TranslationConfig
} from '@opencrvs/commons/client'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import {
  ColumnContentAlignment,
  SORT_ORDER,
  Workqueue
} from '@opencrvs/components/lib/Workqueue'
import { Button, Link as TextButton } from '@opencrvs/components'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { WQContentWrapper } from '@client/v2-events/features/workqueues/components/ContentWrapper'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { formattedDuration } from '@client/utils/date-formatting'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { DownloadButton } from '@client/v2-events/components/DownloadButton'
import { useOnlineStatus } from '@client/utils'
import { CoreWorkqueues } from '@client/v2-events/utils'
import { useEventTitle } from '../useEvents/useEventTitle'
import {
  useAction,
  useActionMenuItems
} from '../../workqueues/EventOverview/components/useActionMenuItems'
import { deserializeSearchParams, serializeSearchParams } from './utils'

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

const messages = defineMessages({
  noRecord: {
    id: 'v2.search.noRecord',
    defaultMessage:
      'No records {slug, select, draft {in my draft} outbox {require processing} other {{title}}}',
    description: 'The no record text'
  },
  noResult: {
    id: 'v2.search.noResult',
    defaultMessage: 'No results',
    description: 'The no result text'
  },
  noResultsOutbox: {
    defaultMessage: 'No records require processing',
    description: 'Text to display if there is no items in outbox',
    id: 'v2.constants.noResultsOutbox'
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
  },
  waitingForAction: {
    id: `v2.events.outbox.waitingForAction`,
    defaultMessage:
      'Waiting to {action, select, DECLARE {send} REGISTER {register} VALIDATE {send for approval} NOTIFY {send} REJECT {send for updates} ARCHIVE {archive} PRINT_CERTIFICATE {certify} REQUEST_CORRECTION {request correction} APPROVE_CORRECTION {approve correction} REJECT_CORRECTION {reject correction} ASSIGN {assign} UNASSIGN {unassign} other {action}}'
  },
  processingAction: {
    id: `v2.events.outbox.processingAction`,
    defaultMessage:
      '{action, select, DECLARE {Sending} REGISTER {Registering} VALIDATE {Sending for approval} NOTIFY {Sending} REJECT {Sending for updates} ARCHIVE {Archiving} PRINT_CERTIFICATE {Certifying} REQUEST_CORRECTION {Requesting correction} APPROVE_CORRECTION {Approving correction} REJECT_CORRECTION {Rejecting correction} ASSIGN {Assigning} UNASSIGN {Unassigning} other {Processing action}}'
  }
})

const ExtendedEventStatuses = {
  OUTBOX: 'OUTBOX',
  DRAFT: 'DRAFT'
} as const

function ActionComponent({
  event,
  actionType
}: {
  event: EventIndex
  actionType: WorkqueueActionsWithDefault
}) {
  const { slug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)

  const { config: configs } = useAction(event)
  const actionMenuItems = useActionMenuItems(event)

  const intl = useIntl()

  const config =
    actionType === 'DEFAULT'
      ? actionMenuItems.find(({ type }) => !isMetaAction(type))
      : configs[actionType]

  if (!config) {
    return null
  }

  return (
    <Button
      disabled={'disabled' in config && Boolean(config.disabled)}
      type="primary"
      onClick={async () => config.onClick(slug)}
    >
      {intl.formatMessage(config.label)}
    </Button>
  )
}

export const SearchResultComponent = ({
  columns,
  queryData,
  eventConfigs,
  limit = 10,
  offset = 0,
  title: contentTitle,
  tabBarContent,
  actions = [],
  emptyMessage
}: PropsWithChildren<{
  columns: WorkqueueColumn[]
  eventConfigs: EventConfig[]
  queryData: EventIndex[]
  limit?: number
  offset?: number
  title: string
  tabBarContent?: React.ReactNode
  actions?: WorkqueueActionsWithDefault[]
  emptyMessage?: TranslationConfig
}>) => {
  const { slug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const intl = useIntl()
  const navigate = useNavigate()
  const { width: windowWidth } = useWindowSize()
  const theme = useTheme()
  const { getEventTitle } = useEventTitle()
  const isOnline = useOnlineStatus()

  const setOffset = (newOffset: number) => {
    const params = deserializeSearchParams(location.search)
    params.offset = String(newOffset)
    navigate(
      {
        pathname: slug
          ? ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug })
          : location.pathname,
        search: serializeSearchParams(params)
      },
      { replace: true }
    )
  }
  const { getOutbox } = useEvents()
  const { getAllRemoteDrafts } = useDrafts()
  const outbox = getOutbox()
  const drafts = getAllRemoteDrafts()

  const [sortedCol, setSortedCol] = useState<
    (typeof COLUMNS)[keyof typeof COLUMNS]
  >(COLUMNS.LAST_UPDATED)
  const [sortOrder, setSortOrder] = useState<
    (typeof SORT_ORDER)[keyof typeof SORT_ORDER]
  >(SORT_ORDER.DESCENDING)

  const getSortFunction = (column: string) => {
    if (
      !Object.values(COLUMNS).includes(
        column as (typeof COLUMNS)[keyof typeof COLUMNS]
      )
    ) {
      return undefined
    }
    return (columnName: string) => {
      const { newSortedCol, newSortOrder } = changeSortedColumn(
        columnName,
        sortedCol,
        sortOrder
      )
      setSortedCol(newSortedCol)
      setSortOrder(newSortOrder)
    }
  }

  const mapEventsToWorkqueueRows = (
    eventData: (EventIndex & {
      title: string | null
      useFallbackTitle: boolean
      meta?: Record<string, unknown>
    })[]
  ) => {
    return eventData.map(({ meta, ...event }) => {
      const actionConfigs = actions
        .map((actionType) => ({
          actionComponent: (
            <ActionComponent actionType={actionType} event={event} />
          )
        }))
        .concat({
          actionComponent: (
            <DownloadButton
              key={`DownloadButton-${event.id}`}
              event={event}
              isDraft={slug === CoreWorkqueues.DRAFT}
            />
          )
        })

      const eventConfig = eventConfigs.find(({ id }) => id === event.type)
      if (!eventConfig) {
        throw new Error('Event configuration not found for event:' + event.type)
      }

      const isInOutbox = outbox.some(
        (outboxEvent) => outboxEvent.id === event.id
      )

      const isInDrafts = drafts.some((draft) => draft.eventId === event.id)

      const getEventStatus = () => {
        if (isInOutbox) {
          return ExtendedEventStatuses.OUTBOX
        }

        if (isInDrafts) {
          return ExtendedEventStatuses.DRAFT
        }

        return event.status
      }

      const status = getEventStatus()
      return {
        ...event,
        actions: actionConfigs,
        label: eventConfig.label,
        type: intl.formatMessage(eventConfig.label),
        createdAt: formattedDuration(new Date(event.createdAt)),
        updatedAt: formattedDuration(new Date(event.updatedAt)),
        status: intl.formatMessage(messages.eventStatus, {
          status
        }),
        title:
          isInOutbox && !isInDrafts ? (
            <IconWithName
              flags={event.flags}
              name={event.title}
              status={status}
            />
          ) : (
            <TextButton
              color={event.useFallbackTitle ? 'red' : 'primary'}
              onClick={() => {
                return navigate(
                  ROUTES.V2.EVENTS.OVERVIEW.buildPath({
                    eventId: event.id
                  })
                )
              }}
            >
              <IconWithName
                flags={event.flags}
                name={event.title}
                status={status}
              />
            </TextButton>
          ),
        outbox: intl.formatMessage(
          isOnline ? messages.processingAction : messages.waitingForAction,
          {
            action: typeof meta?.actionType === 'string' ? meta.actionType : ''
          }
        )
      }
    })
  }

  function getDefaultColumns(): Array<Column> {
    return defaultWorkqueueColumns.map(
      ({ label, value }): Column => ({
        label: intl.formatMessage(label),
        width: value.$event === 'title' ? 35 : 15,
        key: value.$event,
        sortFunction: getSortFunction(value.$event),
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
        width: value.$event === 'outbox' ? 35 : 15,
        key: value.$event,
        sortFunction: getSortFunction(value.$event),
        isSorted: sortedCol === value.$event
      }))
    } else {
      return columns
        .map(({ label, value }) => ({
          label: intl.formatMessage(label),
          width: 15,
          key: value.$event,
          sortFunction: getSortFunction(value.$event),
          isSorted: sortedCol === value.$event
        }))
        .slice(0, 2)
    }
  }

  const dataWithDraft = queryData
    /*
     * Apply pending drafts to the event index.
     * This is necessary to show the most up to date information in the workqueue.
     */
    .map((event) => {
      const eventConfig = eventConfigs.find(({ id }) => id === event.type)
      if (!eventConfig) {
        throw new Error('Event configuration not found for event:' + event.type)
      }

      return deepDropNulls(
        applyDraftToEventIndex(
          event,
          // there should be only one draft per event
          first(drafts.filter((d) => d.eventId === event.id)),
          eventConfig
        )
      )
    })

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

  const currentPageNumber = Math.floor(offset / limit) + 1

  const paginatedData = allResults.slice(
    limit * (currentPageNumber - 1),
    limit * currentPageNumber
  )

  const totalPages = queryData.length ? Math.ceil(queryData.length / limit) : 0

  const isShowPagination = totalPages > 1

  const noResultText = slug
    ? intl.formatMessage(messages.noRecord, {
        slug,
        title: contentTitle.toLowerCase()
      })
    : intl.formatMessage(messages.noResult)

  return (
    <WithTestId>
      <WQContentWrapper
        error={false}
        isMobileSize={windowWidth < theme.grid.breakpoints.lg}
        isShowPagination={isShowPagination}
        noContent={queryData.length === 0}
        noResultText={
          emptyMessage ? intl.formatMessage(emptyMessage) : noResultText
        }
        paginationId={currentPageNumber}
        tabBarContent={tabBarContent}
        title={contentTitle}
        totalPages={totalPages}
        onPageChange={(page) => setOffset((page - 1) * limit)}
      >
        <Workqueue
          columns={[
            ...getDefaultColumns(),
            ...getColumns(),
            {
              width: 20,
              key: COLUMNS.ACTIONS,
              isActionColumn: true,
              alignment: ColumnContentAlignment.RIGHT
            }
          ]}
          content={paginatedData}
          hideLastBorder={!isShowPagination}
          sortOrder={sortOrder}
        />
      </WQContentWrapper>
    </WithTestId>
  )
}
