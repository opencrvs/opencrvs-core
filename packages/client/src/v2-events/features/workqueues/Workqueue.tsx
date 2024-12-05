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

import {
  Workqueue,
  COLUMNS,
  SORT_ORDER,
  ColumnContentAlignment
} from '@opencrvs/components/lib/Workqueue'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import {
  constantsMessages,
  wqMessages,
  messages,
  navigationMessages
} from './messages'
import styled, { useTheme } from 'styled-components'
import orderBy from 'lodash-es/orderBy'
import { WQContentWrapper } from './ContentWrapper'
import { useWindowSize } from '@opencrvs/components/lib/hooks'
import { useEvents } from '@client/v2-events/features/events/useEvents'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import { ROUTES } from '@client/v2-events/routes'

const ToolTipContainer = styled.span`
  text-align: center;
`

const changeSortedColumn = (
  columnName: string,
  presentSortedCol: string,
  presentSortOrder: SORT_ORDER
) => {
  const initialSortOrder = SORT_ORDER.ASCENDING
  const isInitialSortOrder = presentSortOrder === initialSortOrder
  const isSameColumn = columnName === presentSortedCol

  const toggle = () => {
    if (isSameColumn) {
      return isInitialSortOrder ? SORT_ORDER.DESCENDING : SORT_ORDER.ASCENDING
    }

    return initialSortOrder
  }

  return {
    newSortedCol: columnName,
    newSortOrder: toggle()
  }
}

export const WorkqueueIndex = () => {
  const intl = useIntl()
  const theme = useTheme()
  const { getEvents } = useEvents()
  const [searchParams] = useTypedSearchParams(ROUTES.V2.EVENTS.VIEW)

  const events = getEvents.useQuery()

  const statusEvents = (
    events.data?.filter((event) => event.status === searchParams.status) ?? []
  ).map((event) => ({
    assignedTo: event.assignedTo,
    type: event.type,
    createdAt: new Date(event.createdAt).toLocaleDateString(),
    modifiedAt: new Date(event.modifiedAt).toLocaleString(),
    id: event.id
  }))

  const { width } = useWindowSize()
  const [sortedCol, setSortedCol] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState(SORT_ORDER.DESCENDING)

  const onColumnClick = (columnName: string) => {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCol(newSortedCol)
    setSortOrder(newSortOrder)
  }

  // @TODO: separate types for action button vs other columns
  const getColumns = (): Array<{
    label?: string
    width: number
    // @TODO: Format payload and include contents of data somehow.
    key: keyof (typeof statusEvents)[number] | string
    sortFunction?: (columnName: string) => void
    isActionColumn?: boolean
    isSorted?: boolean
    alignment?: ColumnContentAlignment
  }> => {
    if (width > theme.grid.breakpoints.lg) {
      return [
        {
          label: intl.formatMessage(constantsMessages.name),
          width: 30,
          key: 'assignedTo',
          sortFunction: onColumnClick,
          isSorted: sortedCol === 'assignedTo'
        },
        {
          label: intl.formatMessage(constantsMessages.event),
          width: 16,
          key: 'type',
          sortFunction: onColumnClick,
          isSorted: sortedCol === 'type'
        },
        {
          label: intl.formatMessage(constantsMessages.eventDate),
          width: 18,
          key: 'createdAt',
          sortFunction: onColumnClick,
          isSorted: sortedCol === 'createdAt'
        },
        {
          label: intl.formatMessage(constantsMessages.sentForReview),
          width: 18,
          key: 'modifiedAt',
          sortFunction: onColumnClick,
          isSorted: sortedCol === 'modifiedAt'
        },
        {
          width: 18,
          key: COLUMNS.ACTIONS,
          isActionColumn: true,
          alignment: ColumnContentAlignment.RIGHT
        }
      ]
    } else {
      return [
        {
          label: intl.formatMessage(constantsMessages.name),
          width: 70,
          key: 'assignedTo',
          sortFunction: onColumnClick,
          isSorted: sortedCol === 'assignedTo'
        },
        {
          width: 30,
          alignment: ColumnContentAlignment.RIGHT,
          key: COLUMNS.ACTIONS,
          isActionColumn: true
        }
      ]
    }
  }

  const totalPages = statusEvents.length
    ? Math.ceil(statusEvents.length / searchParams.limit)
    : 0

  const isShowPagination = totalPages > 0
  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages[searchParams.status])}
      isMobileSize={width < theme.grid.breakpoints.lg ? true : false}
      isShowPagination={isShowPagination}
      paginationId={Math.floor(searchParams.offset / searchParams.limit)}
      totalPages={totalPages}
      onPageChange={() => {}}
      loading={events.isLoading}
      error={!!events.error}
      noResultText={intl.formatMessage(wqMessages[searchParams.status])}
      noContent={statusEvents.length === 0}
    >
      <ReactTooltip id="validateTooltip">
        <ToolTipContainer>
          {intl.formatMessage(messages.empty)}
        </ToolTipContainer>
      </ReactTooltip>
      <Workqueue
        content={orderBy(statusEvents, sortedCol, sortOrder)}
        columns={getColumns()}
        loading={events.isLoading}
        sortOrder={sortOrder}
        hideLastBorder={!isShowPagination}
      />
    </WQContentWrapper>
  )
}
