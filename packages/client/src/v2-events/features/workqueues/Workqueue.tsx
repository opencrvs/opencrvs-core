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

import { get, mapKeys, orderBy } from 'lodash'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import styled, { useTheme } from 'styled-components'

import { Link } from 'react-router-dom'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'

import { WorkqueueConfig } from '@opencrvs/commons'
import { EventIndex } from '@opencrvs/commons/client'
import { useWindowSize } from '@opencrvs/components/lib/hooks'
import {
  ColumnContentAlignment,
  SORT_ORDER,
  Workqueue as WorkqueueComponent
} from '@opencrvs/components/lib/Workqueue'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { messages } from '@client/v2-events/messages'
import { ROUTES } from '@client/v2-events/routes'
import { WQContentWrapper } from './components/ContentWrapper'

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

function changeSortedColumn(
  columnName: string,
  presentSortedCol: string,
  presentSortOrder: SORT_ORDER
) {
  const initialSortOrder = SORT_ORDER.ASCENDING
  const isInitialSortOrder = presentSortOrder === initialSortOrder
  const isSameColumn = columnName === presentSortedCol

  function toggle() {
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

export function WorkqueueIndex() {
  const { getEvents, getOutbox } = useEvents()
  const [searchParams] = useTypedSearchParams(ROUTES.V2.WORKQUEUE)

  const [config] = useEventConfigurations()

  const workqueueConfig =
    config.workqueues.find((workqueue) => workqueue.id === searchParams.id) ??
    config.workqueues[0]

  // eslint-disable-next-line
  if (!workqueueConfig) {
    return null
  }

  const events = getEvents.useQuery()
  const outbox = getOutbox()

  const eventsWithoutOutbox =
    events.data?.filter(
      (event) => !outbox.find((outboxEvent) => outboxEvent.id === event.id)
    ) || []

  return (
    <Workqueue
      config={workqueueConfig}
      events={eventsWithoutOutbox.concat(outbox)}
      {...searchParams}
    />
  )
}

/**
 * A Workqueue that displays a table of events based on search criteria.
 */
function Workqueue({
  events,
  config,
  limit,
  offset
}: {
  events: EventIndex[]
  config: WorkqueueConfig
  limit: number
  offset: number
}) {
  const intl = useIntl()
  const theme = useTheme()
  const { getOutbox, getDrafts } = useEvents()
  const outbox = getOutbox()
  const drafts = getDrafts()
  const statuses = config.filters.flatMap((filter) => filter.status)

  const workqueue = events
    .filter((event) => statuses.length === 0 || statuses.includes(event.status))
    .map((event) =>
      mapKeys(event, (_, key) => (key === 'data' ? key : `${key}`))
    )
    .map((event) => {
      const { data, ...rest } = event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...rest, ...mapKeys(data as any, (_, key) => `${key}`) }
    })
    .map((event) => {
      const isInOutbox = outbox.some(
        (outboxEvent) => outboxEvent.id === event.id
      )
      const isInDrafts = drafts.some((draft) => draft.id === event.id)

      const getEventStatus = () => {
        if (isInOutbox) {
          return 'OUTBOX'
        }
        if (isInDrafts) {
          return 'DRAFT'
        }
        return event.status
      }

      return {
        ...event,
        // eslint-disable-next-line
        createdAt: intl.formatDate(new Date(event.createdAt)),
        // eslint-disable-next-line
        modifiedAt: intl.formatDate(new Date(event.modifiedAt)),

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

        [config.fields[0].id]: isInOutbox ? (
          <IconWithName
            name={get(event, config.fields[0].id) ?? 'N/A'}
            status={'OUTBOX'}
          />
        ) : (
          <NondecoratedLink
            to={ROUTES.V2.EVENTS.OVERVIEW.buildPath({
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

  function onColumnClick(columnName: string) {
    const { newSortedCol, newSortOrder } = changeSortedColumn(
      columnName,
      sortedCol,
      sortOrder
    )
    setSortedCol(newSortedCol)
    setSortOrder(newSortOrder)
  }

  function getDefaultColumns(): Array<{
    label?: string
    width: number
    key: string
    sortFunction?: (columnName: string) => void
    isActionColumn?: boolean
    isSorted?: boolean
    alignment?: ColumnContentAlignment
  }> {
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
  function getColumns(): Array<{
    label?: string
    width: number
    key: string
    sortFunction?: (columnName: string) => void
    isActionColumn?: boolean
    isSorted?: boolean
    alignment?: ColumnContentAlignment
  }> {
    if (width > theme.grid.breakpoints.lg) {
      return config.fields.map((field, i) => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        label: intl.formatMessage(field.label!),
        width: 35,
        key: field.id,
        sortFunction: onColumnClick,
        isSorted: sortedCol === field.id
      }))
    } else {
      return config.fields
        .map((field, i) => ({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
      error={false}
      isMobileSize={width < theme.grid.breakpoints.lg}
      isShowPagination={isShowPagination}
      loading={false} // @TODO: Handle these on top level
      noContent={workqueue.length === 0}
      noResultText={'No results'}
      paginationId={Math.round(offset / limit)}
      title={intl.formatMessage(config.title)}
      totalPages={totalPages}
    >
      <ReactTooltip id="validateTooltip">
        <ToolTipContainer>
          {intl.formatMessage(messages.empty)}
        </ToolTipContainer>
      </ReactTooltip>
      <WorkqueueComponent
        columns={getColumns().concat(getDefaultColumns())}
        content={orderBy(workqueue, sortedCol, sortOrder)}
        hideLastBorder={!isShowPagination}
        loading={false} // @TODO: Handle these on top level
        sortOrder={sortOrder}
      />
    </WQContentWrapper>
  )
}
