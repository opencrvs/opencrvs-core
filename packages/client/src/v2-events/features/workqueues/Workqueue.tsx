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
  SORT_ORDER,
  ColumnContentAlignment
} from '@opencrvs/components/lib/Workqueue'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { WorkqueueConfig } from '@opencrvs/commons'
import { messages } from '@client/v2-events/messages'
import styled, { useTheme } from 'styled-components'
import orderBy from 'lodash-es/orderBy'
import { WQContentWrapper } from './components/ContentWrapper'
import { useWindowSize } from '@opencrvs/components/lib/hooks'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import { ROUTES } from '@client/v2-events/routes'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { Link } from 'react-router-dom'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import mapKeys from 'lodash-es/mapKeys'
import get from 'lodash-es/get'
import { EventIndex, getCurrentEventState } from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'

/**
 * Based on packages/client/src/views/OfficeHome/requiresUpdate/RequiresUpdate.tsx and others in the same directory.
 * Ideally we could use a single component for a workqueue.
 */

const ToolTipContainer = styled.span`
  text-align: center;
`

const NondecoratedLink = styled(Link)`
  text-decoration: none;
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
  const { getEvents, getOutbox } = useEvents()
  const [searchParams] = useTypedSearchParams(ROUTES.V2.WORKQUEUE)

  const [config] = useEventConfigurations()

  const workqueueConfig =
    config.workqueues.find((workqueue) => workqueue.id === searchParams.id) ??
    config.workqueues[0]

  if (!workqueueConfig) {
    return null
  }

  const events = getEvents.useQuery()
  const outbox = getOutbox().map(getCurrentEventState)

  const eventsWithoutOutbox =
    events.data?.filter(
      (event) => !outbox.find((outboxEvent) => outboxEvent.id === event.id)
    ) || []

  return (
    <Workqueue
      events={eventsWithoutOutbox.concat(outbox)}
      config={workqueueConfig}
      {...searchParams}
    />
  )
}

/**
 * A Workqueue that displays a table of events based on search criteria.
 */

type EventWithSyncStatus = EventIndex & { inOutbox?: boolean }

export const Workqueue = ({
  events,
  config,
  limit,
  offset
}: {
  events: EventWithSyncStatus[]
  config: WorkqueueConfig
  limit: number
  offset: number
}) => {
  const intl = useIntl()
  const theme = useTheme()
  const { getOutbox } = useEvents()
  const outbox = getOutbox()

  const statuses = config.filters.flatMap((filter) => filter.status)

  const workqueue = events
    .filter((event) => statuses.length === 0 || statuses.includes(event.status))
    .map((event) =>
      mapKeys(event, (value, key) => (key === 'data' ? key : `${key}`))
    )
    .map((event) => {
      const { data, ...rest } = event
      return { ...rest, ...mapKeys(data as any, (value, key) => `${key}`) }
    })
    .map((event) => {
      const isInOutbox = outbox.find(
        (outboxEvent) => outboxEvent.id === event.id
      )
      return {
        ...event,
        createdAt: intl.formatDate(new Date(event.createdAt)),
        modifiedAt: intl.formatDate(new Date(event.modifiedAt)),

        status: intl.formatMessage(
          {
            id: `events.status`,
            defaultMessage:
              '{status, select, OUTBOX {Syncing..} CREATED {Draft} DRAFT {Draft} DECLARED {Declared} REGISTERED {Registered} other {Unknown}}'
          },
          { status: isInOutbox ? 'OUTBOX' : event.status }
        ),

        [config.fields[0].id]: isInOutbox ? (
          <IconWithName
            name={get(event, config.fields[0].id) ?? 'N/A'}
            status={isInOutbox ? 'OUTBOX' : event.status}
          />
        ) : (
          <NondecoratedLink
            to={ROUTES.V2.EVENTS.EVENT.buildPath({
              eventId: event.id
            })}
          >
            <IconWithName
              name={get(event, config.fields[0].id) ?? 'N/A'}
              status={event.status}
            />
          </NondecoratedLink>
        )
      }
    })

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

  const getDefaultColumns = (): Array<{
    label?: string
    width: number
    key: string
    sortFunction?: (columnName: string) => void
    isActionColumn?: boolean
    isSorted?: boolean
    alignment?: ColumnContentAlignment
  }> => {
    return [
      {
        label: intl.formatMessage({
          id: 'events.workqueues.status',
          defaultMessage: 'Status'
        }),
        width: 25,
        key: 'status',
        sortFunction: onColumnClick,
        isSorted: sortedCol === 'status'
      },
      {
        label: intl.formatMessage({
          id: 'events.workqueues.createdAt',
          defaultMessage: 'Created'
        }),
        width: 25,
        key: 'createdAt',
        sortFunction: onColumnClick,
        isSorted: sortedCol === 'createdAt'
      },
      {
        label: intl.formatMessage({
          id: 'events.workqueues.modifiedAt',
          defaultMessage: 'Modified'
        }),
        width: 25,
        key: 'modifiedAt',
        sortFunction: onColumnClick,
        isSorted: sortedCol === 'modifiedAt'
      }
    ]
  }
  // @TODO: separate types for action button vs other columns
  const getColumns = (): Array<{
    label?: string
    width: number
    key: string
    sortFunction?: (columnName: string) => void
    isActionColumn?: boolean
    isSorted?: boolean
    alignment?: ColumnContentAlignment
  }> => {
    if (width > theme.grid.breakpoints.lg) {
      return config.fields.map((field, i) => ({
        label: intl.formatMessage(field.label!),
        width: 35,
        key: field.id,
        sortFunction: onColumnClick,
        isSorted: sortedCol === field.id
      }))
    } else {
      return config.fields
        .map((field, i) => ({
          label: intl.formatMessage(field.label!),
          width: 35,
          key: field.id,
          sortFunction: onColumnClick,
          isSorted: sortedCol === field.id
        }))
        .slice(0, 2)
    }
  }

  const totalPages = workqueue.length ? Math.round(workqueue.length / limit) : 0

  const isShowPagination = totalPages >= 1

  return (
    <WQContentWrapper
      title={intl.formatMessage(config.title)}
      isMobileSize={width < theme.grid.breakpoints.lg ? true : false}
      isShowPagination={isShowPagination}
      paginationId={Math.round(offset / limit)}
      totalPages={totalPages}
      onPageChange={() => {}}
      loading={false} // @TODO: Handle these on top level
      error={false}
      noResultText={'No results'}
      noContent={workqueue.length === 0}
    >
      <ReactTooltip id="validateTooltip">
        <ToolTipContainer>
          {intl.formatMessage(messages.empty)}
        </ToolTipContainer>
      </ReactTooltip>
      <WorkqueueComponent
        content={orderBy(workqueue, sortedCol, sortOrder)}
        columns={getColumns().concat(getDefaultColumns())}
        loading={false} // @TODO: Handle these on top level
        sortOrder={sortOrder}
        hideLastBorder={!isShowPagination}
      />
    </WQContentWrapper>
  )
}