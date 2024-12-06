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
  Workqueue as WorkqueueComponent,
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
} from '@client/v2-events/messages'
import styled, { useTheme } from 'styled-components'
import orderBy from 'lodash-es/orderBy'
import { WQContentWrapper } from './components/ContentWrapper'
import { useWindowSize } from '@opencrvs/components/lib/hooks'
import { useEvents } from '@client/v2-events/features/events/useEvents'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import { ROUTES } from '@client/v2-events/routes'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { Link } from 'react-router-dom'
import { EventIndex, EventStatus } from '@events/schema/EventIndex'

/**
 * Based on packages/client/src/views/OfficeHome/requiresUpdate/RequiresUpdate.tsx and others in the same directory.
 * Ideally we could use a single component for a workqueue.
 */

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
  const { getEvents } = useEvents()
  const [searchParams] = useTypedSearchParams(ROUTES.V2.EVENTS.VIEW)

  const events = getEvents.useQuery()

  return <Workqueue events={events.data ?? []} {...searchParams} />
}

/**
 * A Workqueue that displays a table of events based on search criteria.
 */
export const Workqueue = ({
  events,
  status,
  limit,
  offset
}: {
  events: EventIndex[]
  status: EventStatus
  limit: number
  offset: number
}) => {
  const intl = useIntl()
  const theme = useTheme()

  const workqueue = events
    .filter((event) => event.status === status)
    .map((event) => ({
      assignedTo: event.assignedTo,
      type: event.type,
      createdAt: new Date(event.createdAt).toLocaleDateString(),
      modifiedAt: new Date(event.modifiedAt).toLocaleString(),
      id: (
        <Link to={ROUTES.V2.EVENTS.EVENT.buildPath({ eventId: event.id })}>
          <IconWithName name={event.id} status={event.status} />
        </Link>
      )
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
    key: keyof (typeof workqueue)[number] | string
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
          key: 'id',
          sortFunction: onColumnClick,
          isSorted: sortedCol === 'id'
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

  const totalPages = workqueue.length ? Math.round(workqueue.length / limit) : 0

  const isShowPagination = totalPages >= 1

  return (
    <WQContentWrapper
      title={intl.formatMessage(navigationMessages[status])}
      isMobileSize={width < theme.grid.breakpoints.lg ? true : false}
      isShowPagination={isShowPagination}
      paginationId={Math.round(offset / limit)}
      totalPages={totalPages}
      onPageChange={() => {}}
      loading={false} // @TODO: Handle these on top level
      error={false}
      noResultText={intl.formatMessage(wqMessages[status])}
      noContent={workqueue.length === 0}
    >
      <ReactTooltip id="validateTooltip">
        <ToolTipContainer>
          {intl.formatMessage(messages.empty)}
        </ToolTipContainer>
      </ReactTooltip>
      <WorkqueueComponent
        content={orderBy(workqueue, sortedCol, sortOrder)}
        columns={getColumns()}
        loading={false} // @TODO: Handle these on top level
        sortOrder={sortOrder}
        hideLastBorder={!isShowPagination}
      />
    </WQContentWrapper>
  )
}
