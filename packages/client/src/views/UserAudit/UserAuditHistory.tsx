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
import { messages } from '@client/i18n/messages/views/userSetup'
import styled, { withTheme } from 'styled-components'
import React, { useState } from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { useQuery } from '@tanstack/react-query'

import { Pagination } from '@opencrvs/components/lib/Pagination'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import { Table } from '@opencrvs/components/lib/Table'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { DateRangePicker } from '@client/components/DateRangePicker'
import { ITheme } from '@opencrvs/components/lib/theme'
import { ColumnContentAlignment } from '@opencrvs/components/lib/Workqueue'
import { getUserAuditDescription } from '@client/views/SysAdmin/Team/utils'
import { orderBy } from 'lodash'

import subMonths from 'date-fns/subMonths'

import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import format from '@client/utils/date-formatting'
import { Text } from '@opencrvs/components/lib/Text'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import { useTRPC } from '@client/v2-events/trpc'
import { Link } from '@opencrvs/components'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@client/v2-events/routes'
import { getAcceptedScopesByType, UUID } from '@opencrvs/commons/client'
import { useSelector } from 'react-redux'
import { getScope } from '@client/profile/profileSelectors'

const DEFAULT_LIST_SIZE = 10

const TableDiv = styled.div`
  overflow: auto;
`

const HistoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const RecentActionsHolder = styled.div`
  margin-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey200};
`

const AuditContent = styled.div`
  color: ${({ theme }) => theme.colors.grey600};
`

const BoldContent = styled.div`
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.bold14};
`

type AuditEntry = {
  id: string
  clientId: string
  operation: string
  requestData: Record<string, unknown> | null
  responseSummary: Record<string, unknown> | null
  createdAt: string
}

interface IBaseProp {
  userId: string
  userName: string | null | undefined
}

type Props = WrappedComponentProps &
  IBaseProp & {
    theme: ITheme
  }

enum SORTED_COLUMN {
  ACTION = 'actionDescriptionString',
  RECORD = 'trackingId',
  DATE = 'auditTimeValue'
}

enum SORT_ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc'
}

type State = {
  timeStart: Date
  timeEnd: Date
  viewportWidth: number
  sortOrder: SORT_ORDER
  sortedColumn: SORTED_COLUMN
  currentPageNumber: number
  showModal: boolean
  actionDetailsData: AuditEntry | null
}

function UserAuditHistoryComponent(props: Props) {
  const scopes = useSelector(getScope) ?? []
  const hasRecordRead =
    getAcceptedScopesByType({
      acceptedScopes: ['record.read'],
      scopes
    }).length > 0

  const [state, setState] = useState<State>({
    timeStart: subMonths(new Date(Date.now()), 1),
    timeEnd: new Date(Date.now()),
    viewportWidth: useWindowSize().width,
    currentPageNumber: 1,
    sortOrder: SORT_ORDER.DESCENDING,
    sortedColumn: SORTED_COLUMN.DATE,
    showModal: false,
    actionDetailsData: null
  })

  const navigate = useNavigate()
  const trpc = useTRPC()
  const { data, isLoading, isError } = useQuery(
    trpc.user.audit.list.queryOptions({
      userId: props.userId,
      timeStart: state.timeStart.toISOString(),
      timeEnd: state.timeEnd.toISOString(),
      skip: (state.currentPageNumber - 1) * DEFAULT_LIST_SIZE,
      count: DEFAULT_LIST_SIZE
    })
  )

  function setDateRangePickerValues(startDate: Date, endDate: Date) {
    setState((prevState) => ({
      ...prevState,
      timeStart: startDate,
      timeEnd: endDate,
      currentPageNumber: 1
    }))
  }

  function toggleSortOrder(columnName: SORTED_COLUMN) {
    setState((prevState) => ({
      ...prevState,
      sortedColumn: columnName,
      sortOrder:
        prevState.sortOrder === SORT_ORDER.DESCENDING
          ? SORT_ORDER.ASCENDING
          : SORT_ORDER.DESCENDING
    }))
  }

  function getAuditColumns() {
    const { intl } = props
    return [
      {
        label: intl.formatMessage(messages.auditActionColumnTitle),
        width: 40,
        isSortable: true,
        icon: <ArrowDownBlue />,
        key: 'actionDescription',
        sortFunction: () => toggleSortOrder(SORTED_COLUMN.ACTION)
      },
      {
        label: intl.formatMessage(messages.auditTrackingIDColumnTitle),
        width: 30,
        isSortable: true,
        icon: <ArrowDownBlue />,
        key: 'trackingId',
        sortFunction: () => toggleSortOrder(SORTED_COLUMN.RECORD)
      },
      {
        label: intl.formatMessage(messages.auditDateColumnTitle),
        width: 30,
        key: 'auditTime',
        isSortable: true,
        isSorted: true,
        icon: <ArrowDownBlue />,
        alignment: ColumnContentAlignment.RIGHT,
        sortFunction: () => toggleSortOrder(SORTED_COLUMN.DATE)
      }
    ]
  }

  const toggleActionDetails = (actionItem: AuditEntry | null) => {
    setState((prevState) => ({
      ...prevState,
      actionDetailsData: actionItem,
      showModal: !state.showModal
    }))
  }

  function getTrackingId(entry: AuditEntry): string {
    const trackingId =
      (entry.responseSummary?.trackingId as string | undefined) ??
      (entry.requestData?.transactionId as string | undefined)
    return trackingId || '-'
  }

  function getEventId(entry: AuditEntry): string | undefined {
    return (
      (entry.responseSummary?.eventId as string | undefined) ??
      (entry.requestData?.eventId as string | undefined)
    )
  }

  function getActionMessage(entry: AuditEntry) {
    const actionDescriptor = getUserAuditDescription(entry.operation)
    return actionDescriptor
      ? props.intl.formatMessage(actionDescriptor)
      : entry.operation
  }

  function getAuditData(results: AuditEntry[]) {
    return orderBy(
      results.map((entry) => ({
        actionDescription: (
          <Link font="bold14" onClick={() => toggleActionDetails(entry)}>
            {getActionMessage(entry)}
          </Link>
        ),
        actionDescriptionString: getActionMessage(entry),
        trackingId: (() => {
          const trackingId = getTrackingId(entry)
          const eventId = UUID.safeParse(getEventId(entry))?.data
          if (trackingId === '-' || !eventId) return trackingId
          if (!hasRecordRead) return trackingId
          return (
            <Link
              font="bold14"
              onClick={() =>
                navigate(ROUTES.V2.EVENTS.EVENT.RECORD.buildPath({ eventId }))
              }
            >
              {trackingId}
            </Link>
          )
        })(),
        auditTime: format(new Date(entry.createdAt), 'MMMM dd, yyyy hh:mm a'),
        auditTimeValue: new Date(entry.createdAt)
      })),
      [state.sortedColumn],
      [state.sortOrder]
    )
  }

  function getLoadingAuditListView(hasError?: boolean) {
    return (
      <>
        <Table
          id="loading-audit-list"
          isLoading={true}
          columns={getAuditColumns()}
          content={[]}
          noResultText={props.intl.formatMessage(messages.noAuditFound)}
          hideTableHeader={
            state.viewportWidth <= props.theme.grid.breakpoints.md
          }
        />
        {hasError && <GenericErrorToast />}
      </>
    )
  }

  const { intl, theme } = props
  const { timeStart, timeEnd, currentPageNumber } = state

  return (
    <RecentActionsHolder id="user-audit-list">
      <HistoryHeader>
        <Text variant="h3" element="h3" color="copy">
          {intl.formatMessage(messages.auditSectionTitle)}
        </Text>
        <DateRangePicker
          startDate={timeStart}
          endDate={timeEnd}
          onDatesChange={({ startDate, endDate }) => {
            setDateRangePickerValues(startDate, endDate)
          }}
        />
      </HistoryHeader>
      {isError || !data ? (
        getLoadingAuditListView(isError)
      ) : (
        <TableDiv>
          <Table
            columns={getAuditColumns()}
            content={getAuditData(data.results as AuditEntry[])}
            noResultText={intl.formatMessage(messages.noAuditFound)}
            fixedWidth={1088}
            isLoading={isLoading}
            hideTableHeader={state.viewportWidth <= theme.grid.breakpoints.md}
            pageSize={DEFAULT_LIST_SIZE}
          />
          <Pagination
            currentPage={currentPageNumber}
            totalPages={Math.ceil(data.total / DEFAULT_LIST_SIZE)}
            onPageChange={(page: number) =>
              setState((prevState) => ({
                ...prevState,
                currentPageNumber: page
              }))
            }
          />
          {state.actionDetailsData && (
            <ResponsiveModal
              actions={[]}
              handleClose={() => toggleActionDetails(null)}
              show={state.showModal}
              responsive={true}
              title={getActionMessage(state.actionDetailsData)}
              width={1024}
              autoHeight={true}
            >
              <AuditContent>
                {props.userName} -{' '}
                {format(
                  new Date(state.actionDetailsData.createdAt),
                  'MMMM dd, yyyy hh:mm a'
                )}
              </AuditContent>
            </ResponsiveModal>
          )}
        </TableDiv>
      )}
    </RecentActionsHolder>
  )
}

export const UserAuditHistory = withTheme(injectIntl(UserAuditHistoryComponent))
