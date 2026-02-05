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
import React, {
  useState,
  useMemo,
  PropsWithChildren,
  useRef,
  useEffect
} from 'react'
import { useIntl } from 'react-intl'
import { orderBy } from 'lodash'
import { useTheme } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  EventIndex,
  EventConfig,
  WorkqueueColumn,
  CtaActionType,
  TranslationConfig
} from '@opencrvs/commons/client'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import {
  ColumnContentAlignment,
  SORT_ORDER,
  Workqueue
} from '@opencrvs/components/lib/Workqueue'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { WQContentWrapper } from '@client/v2-events/features/workqueues/components/ContentWrapper'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useOnlineStatus } from '@client/utils'
import { deserializeSearchParams, serializeSearchParams } from '../utils'
import {
  COLUMNS,
  createSortFunction,
  getColumns,
  getDefaultColumns,
  getNoResultsText,
  processEventsToRows
} from './utils'

const WithTestId = styled.div.attrs({ 'data-testid': 'search-result' })``

export const SearchResultComponent = ({
  columns,
  queryData: events,
  eventConfigs,
  limit = 10,
  offset = 0,
  title: contentTitle,
  tabBarContent,
  actions = [],
  emptyMessage,
  totalResults
}: PropsWithChildren<{
  columns: WorkqueueColumn[]
  eventConfigs: EventConfig[]
  queryData: EventIndex[]
  limit?: number
  offset?: number
  title: string
  totalResults: number
  tabBarContent?: React.ReactNode
  actions?: CtaActionType[]
  emptyMessage?: TranslationConfig
}>) => {
  console.log('SearchResultComponent rendering')
  const { slug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const intl = useIntl()

  const navigate = useNavigate()
  const { width: windowWidth } = useWindowSize()
  const theme = useTheme()

  // Add this to track re-renders
  const renderCount = useRef(0)
  renderCount.current += 1
  console.log(`SearchResultComponent render #${renderCount.current}`)

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
  const { getAllRemoteDrafts } = useDrafts()
  const outbox = getOutbox()
  const drafts = getAllRemoteDrafts()

  const [sortedCol, setSortedCol] = useState<
    (typeof COLUMNS)[keyof typeof COLUMNS]
  >(COLUMNS.LAST_UPDATED)

  const [sortOrder, setSortOrder] = useState<
    (typeof SORT_ORDER)[keyof typeof SORT_ORDER]
  >(SORT_ORDER.DESCENDING)

  const getSortFunction = createSortFunction(
    sortedCol,
    sortOrder,
    setSortedCol,
    setSortOrder
  )

  const isWideScreen = windowWidth > theme.grid.breakpoints.lg

  const rows = useMemo(() => {
    return orderBy(
      processEventsToRows({
        events,
        eventConfigs,
        drafts,
        outbox,
        actions,
        redirectParam: slug || '',
        isWideScreen,
        isOnline,
        formatMessage: intl.formatMessage
      }),
      sortedCol,
      sortOrder
    )
  }, [
    events,
    eventConfigs,
    drafts,
    outbox,
    actions,
    slug,
    isWideScreen,
    isOnline,
    intl.formatMessage,
    sortedCol,
    sortOrder
  ])

  const currentPageNumber = Math.floor(offset / limit) + 1
  const totalPages = totalResults ? Math.ceil(totalResults / limit) : 0

  const isShowPagination = totalPages > 1

  const noResultText = getNoResultsText({
    title: contentTitle,
    intl,
    slug,
    searchTerm: params.term
  })

  const responsiveColumns = useMemo(() => {
    if (isWideScreen) {
      return [
        ...getDefaultColumns(intl, sortedCol, getSortFunction),
        ...getColumns({
          isWideScreen,
          intl,
          columns,
          sortedCol,
          getSortFunction
        }),
        {
          width: 20,
          key: COLUMNS.ACTIONS,
          isActionColumn: true,
          alignment: ColumnContentAlignment.RIGHT
        }
      ]
    }

    return [
      {
        ...getDefaultColumns(intl, sortedCol, getSortFunction)[0],
        width: 70
      },
      {
        width: 30,
        key: COLUMNS.ACTIONS,
        isActionColumn: true,
        alignment: ColumnContentAlignment.RIGHT
      }
    ]
  }, [isWideScreen, intl, columns, sortedCol, getSortFunction])

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
        tabBarContent={tabBarContent}
        title={contentTitle}
        totalPages={totalPages}
        onPageChange={(page) => setOffset((page - 1) * limit)}
      >
        <Workqueue
          columns={responsiveColumns}
          content={rows}
          hideLastBorder={!isShowPagination}
          sortOrder={sortOrder}
        />
      </WQContentWrapper>
    </WithTestId>
  )
}
