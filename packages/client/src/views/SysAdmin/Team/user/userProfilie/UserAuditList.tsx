/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { messages } from '@client/i18n/messages/views/userSetup'
import { withTheme } from '@client/styledComponents'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { Query } from '@client/components/Query'
import { FETCH_TIME_LOGGED_METRICS_FOR_PRACTITIONER } from '@client/user/queries'
import {
  GQLQuery,
  GQLTimeLoggedMetrics
} from '@opencrvs/gateway/src/graphql/schema'
import {
  ArrowDownBlue,
  StatusCollected,
  StatusGray,
  StatusGreen,
  StatusOrange,
  StatusProgress,
  StatusRejected,
  StatusWaitingValidation
} from '@opencrvs/components/lib/icons'
import styled from 'styled-components'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import moment from 'moment'
import {
  LoadingGrey,
  ColumnContentAlignment,
  TableView
} from '@opencrvs/components/lib/interface'
import {
  NOTIFICATION_TYPE,
  ToastNotification
} from '@client/components/interface/ToastNotification'
import { DateRangePicker } from '@client/components/DateRangePicker'
import { ITheme } from '@opencrvs/components/lib/theme'
import { IColumn } from '@opencrvs/components/lib/interface/GridTable/types'
import { getUserAuditDescription } from '@client/views/SysAdmin/Team/utils'
import { constantsMessages } from '@client/i18n/messages/constants'
import {
  IUserData,
  InformationTitle
} from '@client/views/SysAdmin/Team/user/userProfilie/UserProfile'
import { orderBy } from 'lodash'
import { SORT_ORDER } from '@client/views/SysAdmin/Performance/reports/registrationRates/WithinTargetDaysTable'

const DEFAULT_LIST_SIZE = 10

const InformationCaption = styled.div`
  ${({ theme }) => theme.fonts.reg12};
  padding-bottom: 5px;
`

const AuditDescTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  & > :first-child {
    padding-top: 5px;
  }
`

const RecentActionsHolder = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-top: 24px;
    padding-top: 24px;
  }
  border-top: 1px solid ${({ theme }) => theme.colors.dividerDark};
`

const SectionTitle = styled.div`
  ${({ theme }) => theme.fonts.h2};
  margin-bottom: 10px;
`

const AuditListHolder = styled.div`
  margin-top: 30px;
`

const StatusIcon = styled.div`
  margin-top: 4px;
`

const AdjustedStatusIcon = styled.div`
  margin-left: 3px;
`

interface IBaseProp {
  theme: ITheme
  user?: IUserData
  isLoading?: boolean
}

type Props = WrappedComponentProps & IBaseProp

type State = {
  timeStart: moment.Moment
  timeEnd: moment.Moment
  viewportWidth: number
  auditTimeSortOrder: SORT_ORDER
  currentPageNumber: number
}

class UserAuditListComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    moment.locale(props.intl.locale)
    this.state = {
      timeStart: moment().subtract(1, 'months'),
      timeEnd: moment(),
      viewportWidth: 0,
      currentPageNumber: 1,
      auditTimeSortOrder: SORT_ORDER.DESCENDING
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
      timeStart: moment(startDate),
      timeEnd: moment(endDate)
    })
  }

  toggleAuditListSortOrder() {
    this.setState({
      auditTimeSortOrder:
        this.state.auditTimeSortOrder === SORT_ORDER.DESCENDING
          ? SORT_ORDER.ASCENDING
          : SORT_ORDER.DESCENDING
    })
  }

  setCurrentPage(currentPage: number) {
    this.setState({ currentPageNumber: currentPage })
  }

  updateViewPort() {
    this.setState({ viewportWidth: window.innerWidth })
  }

  getAuditColumns() {
    const { theme, intl } = this.props
    let columns: IColumn[] = []
    if (this.state.viewportWidth <= theme.grid.breakpoints.md) {
      columns = [
        {
          label: '',
          width: 12,
          key: 'statusIcon',
          alignment: ColumnContentAlignment.CENTER
        },
        {
          label: intl.formatMessage(messages.auditActionColumnTitle),
          width: 68,
          key: 'actionDescriptionWithAuditTime'
        },
        {
          label: intl.formatMessage(messages.auditTrackingIDColumnTitle),
          width: 20,
          key: 'trackingId',
          alignment: ColumnContentAlignment.RIGHT
        }
      ]
    } else {
      columns = [
        {
          label: intl.formatMessage(messages.auditActionColumnTitle),
          width: 43,
          key: 'actionDescription'
        },
        {
          label: '',
          width: 5,
          key: 'statusIcon',
          alignment: ColumnContentAlignment.CENTER
        },
        {
          label: intl.formatMessage(messages.auditTrackingIDColumnTitle),
          width: 15,
          key: 'trackingId'
        },
        {
          label: intl.formatMessage(messages.auditEventTypeColumnTitle),
          width: 15,
          key: 'eventType'
        },
        {
          label: intl.formatMessage(messages.auditDateColumnTitle),
          width: 22,
          key: 'auditTime',
          isSortable: true,
          isSorted: true,
          icon: <ArrowDownBlue />,
          alignment: ColumnContentAlignment.RIGHT,
          sortFunction: () => this.toggleAuditListSortOrder()
        }
      ]
    }
    return columns
  }

  getWorkflowStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <StatusProgress />
      case 'DECLARED':
        return (
          <AdjustedStatusIcon>
            <StatusOrange />
          </AdjustedStatusIcon>
        )
      case 'VALIDATED':
        return (
          <StatusIcon>
            <StatusGray />
          </StatusIcon>
        )
      case 'WAITING_VALIDATION':
        return (
          <StatusIcon>
            <StatusWaitingValidation />
          </StatusIcon>
        )
      case 'REGISTERED':
        return (
          <StatusIcon>
            <StatusGreen />
          </StatusIcon>
        )
      case 'REJECTED':
        return (
          <StatusIcon>
            <StatusRejected />
          </StatusIcon>
        )
      case 'CERTIFIED':
        return (
          <StatusIcon>
            <StatusCollected />
          </StatusIcon>
        )
      default:
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
        )
    }
  }

  getAuditData(data: GQLQuery, user?: IUserData) {
    if (
      !user ||
      !data ||
      !data.fetchTimeLoggedMetricsByPractitioner ||
      !data.fetchTimeLoggedMetricsByPractitioner.results
    ) {
      return []
    }
    const auditList = data.fetchTimeLoggedMetricsByPractitioner.results.map(
      (timeLoggedMetrics: GQLTimeLoggedMetrics | null) => {
        if (timeLoggedMetrics === null) {
          return {}
        }
        const actionDescriptor = getUserAuditDescription(
          timeLoggedMetrics.status
        )
        return {
          actionDescription: (
            <InformationTitle>
              {(actionDescriptor &&
                this.props.intl.formatMessage(actionDescriptor)) ||
                ''}
            </InformationTitle>
          ),
          actionDescriptionWithAuditTime: (
            <AuditDescTimeContainer>
              <InformationTitle>
                {(actionDescriptor &&
                  this.props.intl.formatMessage(actionDescriptor)) ||
                  ''}
              </InformationTitle>
              <InformationCaption>
                {moment(timeLoggedMetrics.time).format('MMMM DD, YYYY hh:mm A')}
              </InformationCaption>
            </AuditDescTimeContainer>
          ),
          statusIcon: this.getWorkflowStatusIcon(timeLoggedMetrics.status),
          trackingId: (timeLoggedMetrics.trackingId && (
            <LinkButton textDecoration={'none'}>
              {timeLoggedMetrics.trackingId}
            </LinkButton>
          )) || <></>,
          eventType: this.props.intl.formatMessage(
            constantsMessages[timeLoggedMetrics.eventType.toLowerCase()]
          ),
          auditTime: moment(timeLoggedMetrics.time).format(
            'MMMM DD, YYYY hh:mm A'
          )
        }
      }
    )
    return (
      (auditList &&
        orderBy(auditList, ['auditTime'], [this.state.auditTimeSortOrder])) ||
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
        <TableView
          id="loading-audit-list"
          isLoading={true}
          columns={this.getAuditColumns()}
          content={[]}
          noResultText={this.props.intl.formatMessage(messages.noAuditFound)}
          hideBoxShadow={true}
          hideTableHeader={
            this.state.viewportWidth <= this.props.theme.grid.breakpoints.md
          }
        />
        {hasError && <ToastNotification type={NOTIFICATION_TYPE.ERROR} />}
      </>
    )
  }

  render() {
    const { intl, user, theme, isLoading } = this.props
    const { timeStart, timeEnd } = this.state
    const recordCount = DEFAULT_LIST_SIZE * this.state.currentPageNumber

    return (
      <RecentActionsHolder id="user-audit-list">
        {isLoading && this.getLoadingView()}
        {!isLoading && (
          <>
            <SectionTitle>
              {intl.formatMessage(messages.auditSectionTitle)}
            </SectionTitle>
            <DateRangePicker
              startDate={timeStart.toDate()}
              endDate={timeEnd.toDate()}
              onDatesChange={({ startDate, endDate }) => {
                this.setDateRangePickerValues(startDate, endDate)
              }}
            />
            <AuditListHolder>
              <Query
                query={FETCH_TIME_LOGGED_METRICS_FOR_PRACTITIONER}
                variables={{
                  timeStart: timeStart.toISOString(),
                  timeEnd: timeEnd.toISOString(),
                  practitionerId: user && user.practitionerId,
                  locationId: user && user.locationId,
                  count: recordCount
                }}
                fetchPolicy={'no-cache'}
              >
                {({ data, loading, error }) => {
                  if (error) {
                    return this.getLoadingAuditListView(true)
                  } else {
                    const totalItems =
                      (data &&
                        data.fetchTimeLoggedMetricsByPractitioner &&
                        data.fetchTimeLoggedMetricsByPractitioner.totalItems) ||
                      0

                    return (
                      <TableView
                        columns={this.getAuditColumns()}
                        content={this.getAuditData(data, user)}
                        noResultText={intl.formatMessage(messages.noAuditFound)}
                        isLoading={loading}
                        hideBoxShadow={true}
                        hideTableHeader={
                          this.state.viewportWidth <= theme.grid.breakpoints.md
                        }
                        currentPage={this.state.currentPageNumber}
                        pageSize={recordCount}
                        totalItems={totalItems}
                        onPageChange={(currentPage: number) => {
                          this.setCurrentPage(currentPage)
                        }}
                        loadMoreText={intl.formatMessage(
                          messages.showMoreAuditList,
                          {
                            pageSize: DEFAULT_LIST_SIZE,
                            totalItems: totalItems
                          }
                        )}
                      />
                    )
                  }
                }}
              </Query>
            </AuditListHolder>
          </>
        )}
      </RecentActionsHolder>
    )
  }
}

export const UserAuditList = withTheme(injectIntl(UserAuditListComponent))
