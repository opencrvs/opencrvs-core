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
import React, { useState, useMemo, PropsWithChildren, useCallback } from 'react'
import { useIntl } from 'react-intl'
import { orderBy } from 'lodash'
import { useTheme } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  EventIndex,
  EventConfig,
  TranslationConfig,
  WorkqueueActionType
} from '@opencrvs/commons/client'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import {
  SORT_ORDER,
  WorkqueueHeader,
  WorkqueueList,
  WorkqueueRow
} from '@opencrvs/components/lib/Workqueue'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { WQContentWrapper } from '@client/v2-events/features/workqueues/components/ContentWrapper'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useOnlineStatus } from '@client/utils'
import { useCurrentBackTo } from '@client/v2-events/features/events/useEventFormNavigation'
import { deserializeSearchParams, serializeSearchParams } from '../utils'
import { useEventTitle } from '../../useEvents/useEventTitle'
import {
  enrichEventsForWorkueue,
  COLUMNS,
  createSortFunction,
  getNoResultsText,
  processEventsToRows,
  workqueueHeaderMessages
} from './utils'

const WithTestId = styled.div.attrs({ 'data-testid': 'search-result' })``
export const SearchResultComponent = ({
  queryData: events,
  eventConfigs,
  limit = 10,
  offset = 0,
  title: contentTitle,
  tabBarContent,
  action,
  emptyMessage,
  totalResults,
  paginationVisibleOffline,
  dateColumnLabel
}: PropsWithChildren<{
  eventConfigs: EventConfig[]
  queryData: EventIndex[]
  limit?: number
  offset?: number
  title: string
  totalResults: number
  tabBarContent?: React.ReactNode
  action?: { type: WorkqueueActionType }
  emptyMessage?: TranslationConfig
  paginationVisibleOffline?: boolean
  /** Header label of the date column. Defaults to "Sent" */
  dateColumnLabel?: TranslationConfig
}>) => {
  const { slug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const intl = useIntl()

  const navigate = useNavigate()
  const { width: windowWidth } = useWindowSize()
  const theme = useTheme()

  const isOnline = useOnlineStatus()
  const params = deserializeSearchParams(location.search) as Record<
    string,
    string
  >

  const setOffset = (newOffset: number) => {
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
  const { getDisplayableDrafts } = useDrafts()
  const { getEventTitle } = useEventTitle()

  const outbox = getOutbox()
  const drafts = getDisplayableDrafts()

  const [sortedCol, setSortedCol] = useState<
    (typeof COLUMNS)[keyof typeof COLUMNS]
  >(COLUMNS.LAST_UPDATED)

  const [sortOrder, setSortOrder] = useState<
    (typeof SORT_ORDER)[keyof typeof SORT_ORDER]
  >(SORT_ORDER.DESCENDING)

  const getSortFunction = useCallback(
    (column: string) =>
      createSortFunction(
        sortedCol,
        sortOrder,
        setSortedCol,
        setSortOrder
      )(column),
    [sortedCol, sortOrder]
  )

  const isWideScreen = windowWidth > theme.grid.breakpoints.lg

  const rows = useMemo(() => {
    const enrichedEvents = enrichEventsForWorkueue({
      getEventTitle,
      events,
      eventConfigs,
      drafts,
      outbox
    })

    const orderedEvents = orderBy(
      enrichedEvents,
      // @ts-expect-error --- default columns have non-matching keys like 'NONE' that will never be found.
      (item) => item.enrichedEvent[sortedCol] ?? '',
      sortOrder
    )

    return processEventsToRows({
      enrichedEvents: orderedEvents,
      eventConfigs,
      outbox,
      action,
      isWideScreen,
      isOnline,
      intl
    })
  }, [
    events,
    eventConfigs,
    drafts,
    outbox,
    action,
    getEventTitle,
    isWideScreen,
    isOnline,
    intl,
    sortedCol,
    sortOrder
  ])

  const backTo = useCurrentBackTo()
  const hasFlags = rows.some((row) => Boolean(row.flagsCell))

  const currentPageNumber = Math.floor(offset / limit) + 1
  const totalPages = totalResults ? Math.ceil(totalResults / limit) : 0

  const isShowPagination = totalPages > 1

  const noResultText = getNoResultsText({
    title: contentTitle,
    intl,
    slug,
    searchTerm: params.term
  })

  const handleSort = (column: (typeof COLUMNS)[keyof typeof COLUMNS]) =>
    getSortFunction(column)?.(column)

  return (
    <WithTestId>
      <WQContentWrapper
        error={false}
        isMobileSize={windowWidth < theme.grid.breakpoints.lg}
        isShowPagination={isShowPagination}
        noContent={totalResults === 0}
        noResultText={
          emptyMessage ? intl.formatMessage(emptyMessage) : noResultText
        }
        paginationId={currentPageNumber}
        paginationVisibleOffline={paginationVisibleOffline}
        tabBarContent={tabBarContent}
        title={contentTitle}
        totalPages={totalPages}
        onPageChange={(page) => setOffset((page - 1) * limit)}
      >
        <WorkqueueList>
          {rows.length > 0 && (
            <WorkqueueHeader
              flags={
                hasFlags
                  ? { label: intl.formatMessage(workqueueHeaderMessages.flags) }
                  : undefined
              }
              record={{
                label: intl.formatMessage(workqueueHeaderMessages.record),
                isSorted: sortedCol === COLUMNS.NAME,
                onSort: () => handleSort(COLUMNS.NAME)
              }}
              sent={{
                label: intl.formatMessage(
                  dateColumnLabel ?? workqueueHeaderMessages.sent
                ),
                isSorted: sortedCol === COLUMNS.LAST_UPDATED,
                onSort: () => handleSort(COLUMNS.LAST_UPDATED)
              }}
              sortOrder={sortOrder}
            />
          )}
          {rows.map((row, index) => (
            <WorkqueueRow
              key={row.id}
              actions={
                row.actions.length > 0
                  ? row.actions.map((rowAction) =>
                      /* `ListItemAction-${index}` matches the id the previous
                       * ListItemAction wrapper assigned, which action
                       * components use to derive their test ids */
                      React.cloneElement(
                        rowAction.actionComponent() as React.ReactElement,
                        { id: `ListItemAction-${index}` }
                      )
                    )
                  : undefined
              }
              flags={row.flagsCell}
              id={`row_${index}`}
              meta={row.meta}
              name={row.title}
              sent={row.sent}
              showFlagsColumn={hasFlags}
              onClick={
                row.rowClickable
                  ? () =>
                      navigate(
                        ROUTES.V2.EVENTS.EVENT.buildPath(
                          { eventId: row.id },
                          { backTo }
                        )
                      )
                  : undefined
              }
            />
          ))}
        </WorkqueueList>
      </WQContentWrapper>
    </WithTestId>
  )
}
