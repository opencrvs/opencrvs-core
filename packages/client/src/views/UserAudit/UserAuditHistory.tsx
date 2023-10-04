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
import * as React from 'react'
import Bowser from 'bowser'
import { goToDeclarationRecordAudit } from '@client/navigation'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { Query } from '@client/components/Query'
import { GET_USER_AUDIT_LOG } from '@client/user/queries'
import { connect } from 'react-redux'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import {
  GQLUserAuditLogItemWithComposition,
  GQLUserAuditLogResultItem,
  GQLUserAuditLogResultSet
} from '@opencrvs/gateway/src/graphql/schema'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import { LoadingGrey } from '@opencrvs/components/lib/ListTable'
import { Table } from '@opencrvs/components/lib/Table'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { DateRangePicker } from '@client/components/DateRangePicker'
import { ITheme } from '@opencrvs/components/lib/theme'
import { ColumnContentAlignment } from '@opencrvs/components/lib/Workqueue'
import { getUserAuditDescription } from '@client/views/SysAdmin/Team/utils'
import { orderBy } from 'lodash'
import { SORT_ORDER } from '@client/views/SysAdmin/Performance/reports/completenessRates/CompletenessDataTable'
import subMonths from 'date-fns/subMonths'
import {
  IOnlineStatusProps,
  withOnlineStatus
} from '@client/views/OfficeHome/LoadingIndicator'
import {
  GetUserAuditLogQuery,
  UserAuditLogResultItem
} from '@client/utils/gateway'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import format from '@client/utils/date-formatting'
import { Link } from '@opencrvs/components'
import { Text } from '@opencrvs/components/lib/Text'

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

const SectionTitle = styled.div`
  ${({ theme }) => theme.fonts.h2};
  margin-bottom: 10px;
`

const AuditContent = styled.div`
  color: ${({ theme }) => theme.colors.grey600};
`

const BoldContent = styled.div`
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.bold14};
`
interface IBaseProp {
  practitionerId: string
  practitionerName: string | null | undefined
  loggedInUserRole: string | null | undefined
}

interface DispatchProps {
  goToDeclarationRecordAudit: typeof goToDeclarationRecordAudit
}

type Props = WrappedComponentProps &
  IBaseProp &
  IOnlineStatusProps &
  DispatchProps & {
    theme: ITheme
  }

enum SORTED_COLUMN {
  ACTION = 'actionDescriptionString',
  EVENT = 'eventType',
  RECORD = 'trackingIdString',
  DATE = 'auditTimeValue',
  DEVICE = 'deviceIpAddress'
}

const ADMIN_ACTIONS = ['DEACTIVATE', 'REACTIVATE', 'EDIT_USER', 'CREATE_USER']

type State = {
  timeStart: Date
  timeEnd: Date
  viewportWidth: number
  sortOrder: SORT_ORDER
  sortedColumn: SORTED_COLUMN
  currentPageNumber: number
  showModal: boolean
  actionDetailsData: UserAuditLogResultItem | null
}

const isUserAuditItemWithDeclarationDetials = (
  item: GQLUserAuditLogResultItem
): item is GQLUserAuditLogItemWithComposition => {
  return (item as any).data
}

class UserAuditHistoryComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    window.__localeId__ = props.intl.locale
    this.state = {
      timeStart: subMonths(new Date(Date.now()), 1),
      timeEnd: new Date(Date.now()),
      viewportWidth: 0,
      currentPageNumber: 1,
      sortOrder: SORT_ORDER.DESCENDING,
      sortedColumn: SORTED_COLUMN.DATE,
      showModal: false,
      actionDetailsData: null
    }
    this.updateViewPort = this.updateViewPort.bind(this)
  }

  componentDidMount() {
    this.updateViewPort()
    window.addEventListener('resize', this.updateViewPort)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateViewPort)
  }

  setDateRangePickerValues(startDate: Date, endDate: Date) {
    this.setState({
      timeStart: startDate,
      timeEnd: endDate
    })
  }

  toggleSortOrder(columnName: SORTED_COLUMN) {
    this.setState({
      sortedColumn: columnName,
      sortOrder:
        this.state.sortOrder === SORT_ORDER.DESCENDING
          ? SORT_ORDER.ASCENDING
          : SORT_ORDER.DESCENDING
    })
  }

  setCurrentPage = (currentPage: number) => {
    this.setState({ currentPageNumber: currentPage })
  }

  updateViewPort() {
    this.setState({ viewportWidth: window.innerWidth })
  }

  getAuditColumns() {
    const { intl } = this.props
    return [
      {
        label: intl.formatMessage(messages.auditActionColumnTitle),
        width: 25,
        isSortable: true,
        icon: <ArrowDownBlue />,
        key: 'actionDescription',
        sortFunction: () => this.toggleSortOrder(SORTED_COLUMN.ACTION)
      },
      {
        label: intl.formatMessage(messages.auditTrackingIDColumnTitle),
        width: 25,
        isSortable: true,
        icon: <ArrowDownBlue />,
        key: 'trackingId',
        sortFunction: () => this.toggleSortOrder(SORTED_COLUMN.RECORD)
      },
      {
        label: intl.formatMessage(messages.auditDeviceIpAddressColumnTitle),
        width: 25,
        isSortable: true,
        icon: <ArrowDownBlue />,
        key: 'deviceIpAddress',
        alignment: ColumnContentAlignment.LEFT,
        sortFunction: () => this.toggleSortOrder(SORTED_COLUMN.DEVICE)
      },
      {
        label: intl.formatMessage(messages.auditDateColumnTitle),
        width: 25,
        key: 'auditTime',
        isSortable: true,
        isSorted: true,
        icon: <ArrowDownBlue />,
        alignment: ColumnContentAlignment.RIGHT,
        sortFunction: () => this.toggleSortOrder(SORTED_COLUMN.DATE)
      }
    ]
  }

  toggleActionDetails = (actionItem: UserAuditLogResultItem | null) => {
    this.setState({
      actionDetailsData: actionItem,
      showModal: !this.state.showModal
    })
  }

  getIpAdress(auditLog: UserAuditLogResultItem) {
    const device = Bowser.getParser(auditLog.userAgent).getResult()

    return (
      [
        device.platform.vendor,
        device.os.name,
        device.browser ? `(${device.browser.name})` : ''
      ]
        .filter(Boolean)
        .join(' ') +
      ' • ' +
      auditLog.ipAddress
    )
  }

  getActionMessage(auditLog: UserAuditLogResultItem) {
    const actionDescriptor = getUserAuditDescription(auditLog.action)
    return actionDescriptor
      ? this.props.intl.formatMessage(actionDescriptor)
      : ''
  }

  getAuditData(data: GQLUserAuditLogResultSet) {
    const auditList = data.results.map((userAuditItem) => {
      if (userAuditItem === null) {
        return {}
      }
      const actionMessage = this.getActionMessage(userAuditItem)

      const isSystemAdmin =
        this.props.loggedInUserRole === 'NATIONAL_SYSTEM_ADMIN' ||
        this.props.loggedInUserRole === 'LOCAL_SYSTEM_ADMIN'

      return {
        actionDescription:
          isSystemAdmin &&
          isUserAuditItemWithDeclarationDetials(userAuditItem) === undefined ? (
            <Link
              font="bold14"
              onClick={() => {
                this.toggleActionDetails(userAuditItem)
              }}
            >
              {actionMessage}
            </Link>
          ) : !isSystemAdmin &&
            !ADMIN_ACTIONS.includes(userAuditItem.action) ? (
            <Link
              font="bold14"
              onClick={() => {
                this.toggleActionDetails(userAuditItem)
              }}
            >
              {actionMessage}
            </Link>
          ) : (
            <BoldContent>{actionMessage}</BoldContent>
          ),

        actionDescriptionWithAuditTime:
          isSystemAdmin &&
          isUserAuditItemWithDeclarationDetials(userAuditItem) === undefined ? (
            <Link
              onClick={() => {
                this.toggleActionDetails(userAuditItem)
              }}
            >
              {actionMessage}
            </Link>
          ) : !isSystemAdmin ? (
            <Link
              onClick={() => {
                this.toggleActionDetails(userAuditItem)
              }}
            >
              {actionMessage}
            </Link>
          ) : (
            <BoldContent>{actionMessage}</BoldContent>
          ),
        trackingId:
          isUserAuditItemWithDeclarationDetials(userAuditItem) &&
          !isSystemAdmin ? (
            <Link
              font="bold14"
              onClick={() =>
                this.props.goToDeclarationRecordAudit(
                  'printTab',
                  userAuditItem.data.compositionId as string
                )
              }
            >
              {userAuditItem.data.trackingId}
            </Link>
          ) : isUserAuditItemWithDeclarationDetials(userAuditItem) ? (
            <AuditContent>{userAuditItem.data.trackingId}</AuditContent>
          ) : null,

        deviceIpAddress: this.getIpAdress(userAuditItem),
        trackingIdString: isUserAuditItemWithDeclarationDetials(userAuditItem)
          ? userAuditItem.data.trackingId
          : null,
        auditTime: format(
          new Date(userAuditItem.time),
          'MMMM dd, yyyy hh:mm a'
        ),
        auditTimeValue: new Date(userAuditItem.time)
      }
    })
    return (
      (auditList &&
        orderBy(
          auditList,
          [this.state.sortedColumn],
          [this.state.sortOrder]
        )) ||
      []
    )
  }

  getLoadingView() {
    return (
      <>
        <SectionTitle>
          <LoadingGrey width={5} />
        </SectionTitle>
        <LoadingGrey width={10} />
        {this.getLoadingAuditListView()}
      </>
    )
  }

  getLoadingAuditListView(hasError?: boolean) {
    return (
      <>
        <Table
          id="loading-audit-list"
          isLoading={true}
          columns={this.getAuditColumns()}
          content={[]}
          noResultText={this.props.intl.formatMessage(messages.noAuditFound)}
          hideTableHeader={
            this.state.viewportWidth <= this.props.theme.grid.breakpoints.md
          }
        />
        {hasError && <GenericErrorToast />}
      </>
    )
  }

  render() {
    const { intl, practitionerId, theme } = this.props
    const { timeStart, timeEnd, currentPageNumber } = this.state
    const recordCount = DEFAULT_LIST_SIZE

    return (
      <RecentActionsHolder id="user-audit-list">
        <>
          <>
            <HistoryHeader>
              <Text variant="h3" element="h3" color="copy">
                {intl.formatMessage(messages.auditSectionTitle)}
              </Text>
              <DateRangePicker
                startDate={timeStart}
                endDate={timeEnd}
                onDatesChange={({ startDate, endDate }) => {
                  this.setDateRangePickerValues(startDate, endDate)
                }}
              />
            </HistoryHeader>
            <>
              <Query<GetUserAuditLogQuery>
                query={GET_USER_AUDIT_LOG}
                variables={{
                  practitionerId: practitionerId,
                  count: recordCount,
                  skip: DEFAULT_LIST_SIZE * (currentPageNumber - 1),
                  timeStart: timeStart,
                  timeEnd: timeEnd
                }}
                fetchPolicy={'no-cache'}
              >
                {({ data, loading, error }) => {
                  if (error || !data || !data.getUserAuditLog) {
                    return this.getLoadingAuditListView(error ? true : false)
                  } else {
                    const totalItems = Number(
                      (data &&
                        data.getUserAuditLog &&
                        data.getUserAuditLog.total) ||
                        0
                    )

                    return (
                      <TableDiv>
                        <Table
                          columns={this.getAuditColumns()}
                          content={this.getAuditData(data.getUserAuditLog)}
                          noResultText={intl.formatMessage(
                            messages.noAuditFound
                          )}
                          fixedWidth={1088}
                          isLoading={loading}
                          hideTableHeader={
                            this.state.viewportWidth <=
                            theme.grid.breakpoints.md
                          }
                          pageSize={DEFAULT_LIST_SIZE}
                        />
                        <Pagination
                          currentPage={this.state.currentPageNumber}
                          totalPages={Math.ceil(totalItems / DEFAULT_LIST_SIZE)}
                          onPageChange={(page: any) =>
                            this.setState({ currentPageNumber: page })
                          }
                        />

                        {this.state.actionDetailsData && (
                          <ResponsiveModal
                            actions={[]}
                            handleClose={() => this.toggleActionDetails(null)}
                            show={this.state.showModal}
                            responsive={true}
                            title={this.getActionMessage(
                              this.state.actionDetailsData
                            )}
                            width={1024}
                            autoHeight={true}
                          >
                            <>
                              <AuditContent>
                                {this.props.practitionerName} -{' '}
                                {format(
                                  new Date(this.state.actionDetailsData.time),
                                  'MMMM dd, yyyy hh:mm a'
                                )}{' '}
                                {' | '}
                                {this.getIpAdress(this.state.actionDetailsData)}
                              </AuditContent>
                            </>
                          </ResponsiveModal>
                        )}
                      </TableDiv>
                    )
                  }
                }}
              </Query>
            </>
          </>
        </>
      </RecentActionsHolder>
    )
  }
}

export const UserAuditHistory = connect(null, {
  goToDeclarationRecordAudit
})(withTheme(injectIntl(withOnlineStatus(UserAuditHistoryComponent))))
