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
import { orderBy } from 'lodash'
import { defineMessages, useIntl } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import styled, { useTheme } from 'styled-components'

import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'

import { Link, useNavigate } from 'react-router-dom'
import {
  applyDraftsToEventIndex,
  defaultColumns,
  EventConfig,
  EventIndex,
  getOrThrow,
  RootWorkqueueConfig,
  workqueues,
  WorkQueueColumnConfig
} from '@opencrvs/commons/client'
import { useWindowSize } from '@opencrvs/components/lib/hooks'
import {
  ColumnContentAlignment,
  SORT_ORDER,
  Workqueue as WorkqueueComponent
} from '@opencrvs/components/lib/Workqueue'
import { Pagination, Link as TextButton } from '@opencrvs/components'
import { FloatingActionButton } from '@opencrvs/components/lib/buttons'
import { PlusTransparentWhite } from '@opencrvs/components/lib/icons'
import {
  IconWithName,
  IconWithNameEvent
} from '@client/v2-events/components/IconWithName'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'

import { formattedDuration } from '@client/utils/date-formatting'
import { ROUTES } from '@client/v2-events/routes'
import { flattenEventIndex } from '@client/v2-events/utils'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { WQContentWrapper } from './components/ContentWrapper'

const messages = defineMessages({
  empty: {
    defaultMessage: 'Empty message',
    description: 'Label for workqueue tooltip',
    id: 'v2.regHome.issued'
  }
})

/**
 * Based on packages/client/src/views/OfficeHome/requiresUpdate/RequiresUpdate.tsx and others in the same directory.
 * Ideally we could use a single component for a workqueue.
 */

const ToolTipContainer = styled.span`
  text-align: center;
`

const FabContainer = styled.div`
  position: fixed;
  right: 40px;
  bottom: 55px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
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

/**
 * A Workqueue that displays a table of events based on search criteria.
 */
function Workqueue({
  events,
  workqueueConfig,
  limit,
  offset,
  eventConfigs
}: {
  events: EventIndex[]
  workqueueConfig: RootWorkqueueConfig
  limit: number
  offset: number
  eventConfigs: EventConfig[]
}) {
  const [currentPageNumber, setCurrentPageNumber] = React.useState(1)
  const intl = useIntl()
  const flattenedIntl = useIntlFormatMessageWithFlattenedParams()
  const theme = useTheme()
  const { getOutbox } = useEvents()
  const { getRemoteDrafts } = useDrafts()
  const outbox = getOutbox()
  const drafts = getRemoteDrafts()
  const navigate = useNavigate()
  const { width } = useWindowSize()

  const validEvents = orderBy(
    events.filter((event) => eventConfigs.some((e) => e.id === event.type)),
    ['updatedAt'],
    ['desc']
  )

  if (validEvents.length !== events.length) {
    // eslint-disable-next-line
    console.log('Fields without proper configuration found. Ignoring them')
  }

  const workqueue = validEvents
    .slice((currentPageNumber - 1) * limit, currentPageNumber * limit)
    .filter((event) => eventConfigs.some((e) => e.id === event.type))
    /*
     * Apply pending drafts to the event index.
     * This is necessary to show the most up to date information in the workqueue.
     */
    .map((event) =>
      applyDraftsToEventIndex(
        event,
        drafts.filter((d) => d.eventId === event.id)
      )
    )
    .map((event) => {
      /** We already filtered invalid events, this should never happen. */
      const eventConfig = getOrThrow(
        eventConfigs.find((e) => e.id === event.type),
        `Could not find event config for ${event.id}`
      )

      const isInOutbox = outbox.some(
        (outboxEvent) => outboxEvent.id === event.id
      )
      const isInDrafts = drafts
        .filter((draft) => draft.createdAt > event.updatedAt)
        .some((draft) => draft.eventId === event.id)

      const getEventStatus = () => {
        if (isInOutbox) {
          return 'OUTBOX'
        }
        if (isInDrafts) {
          return 'DRAFT'
        }

        return event.status
      }

      const titleColumnId = workqueueConfig.columns[0].id

      const title = flattenedIntl.formatMessage(
        eventConfig.title,
        flattenEventIndex(event)
      )

      const TitleColumn =
        width > theme.grid.breakpoints.lg ? (
          <IconWithName name={title} status={getEventStatus()} />
        ) : (
          <IconWithNameEvent
            event={intl.formatMessage(eventConfig.label)}
            name={title}
            status={getEventStatus()}
          />
        )

      return {
        ...flattenEventIndex(event),
        event: intl.formatMessage(eventConfig.label),
        createdAt: formattedDuration(new Date(event.createdAt)),
        modifiedAt: formattedDuration(new Date(event.updatedAt)),

        status: intl.formatMessage(
          {
            id: 'v2.events.status',
            defaultMessage:
              '{status, select, OUTBOX {Syncing..} CREATED {Draft} VALIDATED {Validated} DRAFT {Draft} DECLARED {Declared} REGISTERED {Registered} CERTIFIED {Certified} REJECTED {Requires update} ARCHIVED {Archived} MARKED_AS_DUPLICATE {Marked as a duplicate} NOTIFIED {In progress} other {Unknown}}'
          },
          {
            status: getEventStatus()
          }
        ),
        [titleColumnId]: isInOutbox ? (
          TitleColumn
        ) : (
          <TextButton
            onClick={() => {
              return navigate(
                ROUTES.V2.EVENTS.OVERVIEW.buildPath({
                  eventId: event.id
                })
              )
            }}
          >
            {TitleColumn}
          </TextButton>
        )
      }
    })

  const [sortedCol, setSortedCol] = useState('modifiedAt')
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

  function getDefaultColumns(): Array<Column> {
    return workqueueConfig.defaultColumns.map(
      (column: string): Column => ({
        label:
          column in defaultColumns
            ? intl.formatMessage(
                defaultColumns[column as keyof typeof defaultColumns].label
              )
            : '',
        width: 25,
        key: column,
        sortFunction: onColumnClick,
        isSorted: sortedCol === column
      })
    )
  }

  // @TODO: separate types for action button vs other columns
  function getColumns(): Array<Column> {
    const configuredColumns: Array<Column> = workqueueConfig.columns.map(
      (column: WorkQueueColumnConfig) => ({
        label: intl.formatMessage(column.label),
        width: 35,
        key: column.id,
        sortFunction: onColumnClick,
        isSorted: sortedCol === column.id
      })
    )

    const allColumns = configuredColumns.concat(getDefaultColumns())

    if (width > theme.grid.breakpoints.lg) {
      return allColumns
    } else {
      return allColumns.slice(0, 1)
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
      title={intl.formatMessage(workqueueConfig.title)}
      totalPages={totalPages}
    >
      <ReactTooltip id="validateTooltip">
        <ToolTipContainer>
          {intl.formatMessage(messages.empty)}
        </ToolTipContainer>
      </ReactTooltip>
      <WorkqueueComponent
        columns={getColumns()}
        content={orderBy(workqueue, sortedCol, sortOrder)}
        hideLastBorder={!isShowPagination}
        loading={false} // @TODO: Handle these on top level
        sortOrder={sortOrder}
      />
      {validEvents.length > limit && (
        <Pagination
          currentPage={currentPageNumber}
          totalPages={Math.ceil(validEvents.length / limit)}
          onPageChange={(page) => setCurrentPageNumber(page)}
        />
      )}
      <FabContainer>
        <Link to={ROUTES.V2.EVENTS.CREATE.path}>
          <FloatingActionButton
            icon={() => <PlusTransparentWhite />}
            id="new_event_declaration"
          />
        </Link>
      </FabContainer>
    </WQContentWrapper>
  )
}

export function WorkqueueContainer() {
  // @TODO: We need to revisit on how the workqueue id is passed.
  // We'll follow up during 'workqueue' feature.
  const workqueueId = 'all'
  const { getEvents } = useEvents()
  const [searchParams] = useTypedSearchParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)

  const [events] = getEvents.useSuspenseQuery()

  const eventConfigs = useEventConfigurations()

  const workqueueConfig =
    workqueueId in workqueues
      ? workqueues[workqueueId as keyof typeof workqueues]
      : null

  if (!workqueueConfig) {
    return null
  }

  return (
    <Workqueue
      events={events}
      workqueueConfig={workqueueConfig}
      {...searchParams}
      eventConfigs={eventConfigs}
    />
  )
}

interface Column {
  label?: string
  width: number
  key: string
  sortFunction?: (columnName: string) => void
  isActionColumn?: boolean
  isSorted?: boolean
  alignment?: ColumnContentAlignment
}
