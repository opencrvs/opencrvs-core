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
import { goToTeamUserList, goToReviewUserDetails } from '@client/navigation'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Query } from '@client/components/Query'
import {
  GET_USER,
  FETCH_TIME_LOGGED_METRICS_FOR_PRACTITIONER
} from '@client/user/queries'
import {
  SysAdminContentWrapper,
  SysAdminPageVariant
} from '@client/views/SysAdmin/SysAdminContentWrapper'
import {
  GQLQuery,
  GQLTimeLoggedMetrics,
  GQLUser,
  GQLHumanName
} from '@opencrvs/gateway/src/graphql/schema'
import { createNamesMap } from '@client/utils/data-formatting'
import {
  Avatar,
  VerticalThreeDots,
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
import { userMessages } from '@client/i18n/messages'
import { LANG_EN } from '@client/utils/constants'
import {
  ISearchLocation,
  ToggleMenu,
  ListTable,
  ColumnContentAlignment,
  LoadingGrey
} from '@opencrvs/components/lib/interface'

import { Status } from '@client/views/SysAdmin/Team/user/UserList'
import { messages as sysMessages } from '@client/i18n/messages/views/sysAdmin'
import { getScope } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import {
  NOTIFICATION_TYPE,
  ToastNotification
} from '@client/components/interface/ToastNotification'
import { DateRangePicker } from '@client/components/DateRangePicker'
import { ITheme } from '@opencrvs/components/lib/theme'
import { IColumn } from '@opencrvs/components/lib/interface/GridTable/types'

import { getUserAuditDescription } from '@client/views/SysAdmin/Team/utils'

const DEFAULT_LIST_SIZE = 10

const ContentWrapper = styled.div`
  margin: 40px auto 0;
  color: ${({ theme }) => theme.colors.copy};
`

const UserAvatar = styled(Avatar)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const NameHolder = styled.div`
  ${({ theme }) => theme.fonts.h2Style};
  margin: 20px auto 30px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const InformationHolder = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column;
  }
  margin-bottom: 14px;
`

const InformationTitle = styled.div<{ paddingRight?: number }>`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  ${({ paddingRight }) => {
    return `padding-right: ${paddingRight ? paddingRight : 0}px`
  }}
`
const InformationValue = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
`

const InformationCaption = styled.div`
  ${({ theme }) => theme.fonts.captionStyle};
`

const LoadingTitle = styled.span<{ width: number; marginRight: number }>`
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  height: 24px;
  width: ${({ width }) => `${width}px`};
  margin-right: ${({ marginRight }) => `${marginRight}px`};
`

const LoadingValue = styled(LoadingGrey)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
const AuditDescTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const HeaderMenuHolder = styled.div`
  display: flex;
  justify-content: space-between;

  & > :first-child {
    margin: 4px 8px 0px 0px;
  }
`

const RecentActionsHolder = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid ${({ theme }) => theme.colors.dividerDark};
`

const SectionTitle = styled.div`
  ${({ theme }) => theme.fonts.h4Style};
  margin-bottom: 10px;
`

const AuditListHolder = styled.div`
  margin-top: 30px;
`

const StatusIcon = styled.div`
  margin-top: 4px;
`

interface ISearchParams {
  userId: string
}

interface IBaseProp {
  theme: ITheme
  viewOnlyMode: boolean
}

interface IDispatchProps {
  goToTeamUserList: typeof goToTeamUserList
  goToReviewUserDetails: typeof goToReviewUserDetails
}

type Props = WrappedComponentProps &
  RouteComponentProps<ISearchParams> &
  IDispatchProps &
  IBaseProp

type State = {
  timeStart: moment.Moment
  timeEnd: moment.Moment
  viewportWidth: number
}

interface IUserData {
  id?: string
  primaryOffice?: ISearchLocation
  name?: string
  role?: string
  type?: string
  number?: string
  status?: string
  username?: string
  practitionerId?: string
  locationId?: string
  startDate?: string
}

class UserProfileComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    moment.locale(props.intl.locale)
    this.state = {
      timeStart: moment().subtract(1, 'months'),
      timeEnd: moment(),
      viewportWidth: 0
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

  getMenuItems(userId: string, status: string) {
    return [
      {
        label: this.props.intl.formatMessage(sysMessages.menuOptionEditDetails),
        handler: () => this.props.goToReviewUserDetails(userId)
      }
    ]
  }

  setDateRangePickerValues(startDate: Date, endDate: Date) {
    this.setState({
      timeStart: moment(startDate),
      timeEnd: moment(endDate)
    })
  }

  updateViewPort() {
    this.setState({ viewportWidth: window.innerWidth })
  }

  transformUserQueryResult(userData?: GQLUser) {
    if (!userData) {
      return {}
    }
    const locale = this.props.intl.locale
    return {
      id: userData.id,
      primaryOffice: {
        id: (userData.primaryOffice && userData.primaryOffice.id) || '',
        searchableText: '',
        displayLabel:
          (userData.primaryOffice &&
            (locale === LANG_EN
              ? userData.primaryOffice.name
              : (userData.primaryOffice.alias &&
                  userData.primaryOffice.alias.join(' ')) ||
                '')) ||
          ''
      },
      name: createNamesMap(userData.name as GQLHumanName[])[locale],
      role: userData.role,
      type: userData.type,
      number: userData.mobile,
      status: userData.status,
      username: userData.username,
      practitionerId: userData.practitionerId,
      locationId:
        (userData.catchmentArea &&
          userData.catchmentArea[0] &&
          userData.catchmentArea[0].id) ||
        '0',
      startDate:
        (userData.creationDate &&
          moment(new Date(Number(userData.creationDate))).format(
            'MMMM DD, YYYY'
          )) ||
        ''
    }
  }
  getLoadingUserProfileView(hasError?: boolean) {
    return (
      <SysAdminContentWrapper
        id="user-profile-loading"
        type={SysAdminPageVariant.SUBPAGE_CENTERED}
        backActionHandler={() => window.history.back()}
        loadingHeader={true}
      >
        <UserAvatar />
        <NameHolder>
          <LoadingGrey width={20} />
        </NameHolder>
        <InformationHolder>
          <LoadingTitle width={160} marginRight={70} />
          <LoadingValue width={15} />
        </InformationHolder>
        <InformationHolder>
          <LoadingTitle width={118} marginRight={113} />
          <LoadingValue width={15} />
        </InformationHolder>
        <InformationHolder>
          <LoadingTitle width={157} marginRight={74} />
          <LoadingValue width={15} />
        </InformationHolder>
        <InformationHolder>
          <LoadingTitle width={122} marginRight={110} />
          <LoadingValue width={15} />
        </InformationHolder>
        <InformationHolder>
          <LoadingTitle width={120} marginRight={112} />
          <LoadingValue width={15} />
        </InformationHolder>
        <RecentActionsHolder>
          <SectionTitle>
            <LoadingGrey width={5} />
          </SectionTitle>
          <LoadingGrey width={10} />
          {this.getLoadingUserAuditView(hasError)}
        </RecentActionsHolder>
      </SysAdminContentWrapper>
    )
  }

  getAuditColumns() {
    const { theme, intl } = this.props
    let columns: IColumn[] = []
    if (this.state.viewportWidth <= theme.grid.breakpoints.md) {
      columns = [
        {
          label: '',
          width: 10,
          key: 'statusIcon',
          alignment: ColumnContentAlignment.CENTER
        },
        {
          label: intl.formatMessage(messages.auditActionColumnTitle),
          width: 70,
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
          alignment: ColumnContentAlignment.RIGHT
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
          icon: <ArrowDownBlue />,
          alignment: ColumnContentAlignment.RIGHT
        }
      ]
    }
    return columns
  }

  getWorkflowStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <StatusIcon>
            <StatusProgress />
          </StatusIcon>
        )
      case 'DECLARED':
        return (
          <StatusIcon>
            <StatusOrange />
          </StatusIcon>
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

  getAuditData(data: GQLQuery, user: IUserData) {
    if (
      !data ||
      !data.fetchTimeLoggedMetricsByPractitioner ||
      !data.fetchTimeLoggedMetricsByPractitioner
    ) {
      return []
    }
    return data.fetchTimeLoggedMetricsByPractitioner.map(
      (timeLoggedMetrics: GQLTimeLoggedMetrics | null) => {
        if (timeLoggedMetrics === null) {
          return {}
        }
        const actionDescriptor = getUserAuditDescription(
          timeLoggedMetrics.status,
          user.role || ''
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
          trackingId: (
            <LinkButton textDecoration={'none'}>
              {timeLoggedMetrics.trackingId}
            </LinkButton>
          ),
          eventType: timeLoggedMetrics.eventType,
          auditTime: moment(timeLoggedMetrics.time).format(
            'MMMM DD, YYYY hh:mm A'
          )
        }
      }
    )
  }

  getLoadingUserAuditView(hasError?: boolean) {
    return (
      <>
        <ListTable
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
    const { intl, viewOnlyMode, match } = this.props
    const { timeStart, timeEnd } = this.state

    return (
      <>
        <Query
          query={GET_USER}
          variables={{
            userId: match.params.userId
          }}
          fetchPolicy={'no-cache'}
        >
          {({ data, loading, error }) => {
            if (error) {
              return this.getLoadingUserProfileView(true)
            } else if (loading) {
              return this.getLoadingUserProfileView()
            } else {
              const user = this.transformUserQueryResult(data && data.getUser)
              return (
                <SysAdminContentWrapper
                  id="user-profile"
                  type={SysAdminPageVariant.SUBPAGE_CENTERED}
                  backActionHandler={() => window.history.back()}
                  headerTitle={user.name}
                  menuComponent={
                    <HeaderMenuHolder>
                      <Status status={user.status || 'pending'} />
                      <ToggleMenu
                        id={`sub-page-header-munu-button`}
                        toggleButton={<VerticalThreeDots />}
                        menuItems={this.getMenuItems(
                          user.id as string,
                          user.status as string
                        )}
                        hide={viewOnlyMode}
                      />
                    </HeaderMenuHolder>
                  }
                >
                  <ContentWrapper>
                    <UserAvatar />
                    <NameHolder>{user.name}</NameHolder>
                    <InformationHolder>
                      <InformationTitle paddingRight={70}>
                        {intl.formatMessage(messages.assignedOffice)}
                      </InformationTitle>
                      <InformationValue>
                        <LinkButton
                          textDecoration={'none'}
                          onClick={() =>
                            this.props.goToTeamUserList(
                              user.primaryOffice as ISearchLocation
                            )
                          }
                        >
                          {user.primaryOffice &&
                            user.primaryOffice.displayLabel}
                        </LinkButton>
                      </InformationValue>
                    </InformationHolder>
                    <InformationHolder>
                      <InformationTitle paddingRight={113}>
                        {intl.formatMessage(messages.roleType)}
                      </InformationTitle>
                      <InformationValue>
                        {intl.formatMessage(userMessages[user.role as string])}{' '}
                        /{' '}
                        {intl.formatMessage(userMessages[user.type as string])}
                      </InformationValue>
                    </InformationHolder>
                    <InformationHolder>
                      <InformationTitle paddingRight={74}>
                        {intl.formatMessage(messages.phoneNumber)}
                      </InformationTitle>
                      <InformationValue>{user.number}</InformationValue>
                    </InformationHolder>
                    <InformationHolder>
                      <InformationTitle paddingRight={110}>
                        {intl.formatMessage(messages.userName)}
                      </InformationTitle>
                      <InformationValue>{user.username}</InformationValue>
                    </InformationHolder>
                    <InformationHolder>
                      <InformationTitle paddingRight={112}>
                        {intl.formatMessage(messages.startDate)}
                      </InformationTitle>
                      <InformationValue>{user.startDate}</InformationValue>
                    </InformationHolder>
                    <RecentActionsHolder>
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
                            practitionerId: user.practitionerId,
                            locationId: user.locationId
                          }}
                          fetchPolicy={'no-cache'}
                        >
                          {({ data, loading, error }) => {
                            if (error) {
                              return this.getLoadingUserAuditView(true)
                            } else if (loading) {
                              return this.getLoadingUserAuditView()
                            } else {
                              return (
                                <ListTable
                                  columns={this.getAuditColumns()}
                                  content={this.getAuditData(data, user)}
                                  noResultText="No audits to display"
                                  hideBoxShadow={true}
                                  hideTableHeader={
                                    this.state.viewportWidth <=
                                    this.props.theme.grid.breakpoints.md
                                  }
                                />
                              )
                            }
                          }}
                        </Query>
                      </AuditListHolder>
                    </RecentActionsHolder>
                  </ContentWrapper>
                </SysAdminContentWrapper>
              )
            }
          }}
        </Query>
      </>
    )
  }
}

export const UserProfile = connect(
  (state: IStoreState) => {
    const scope = getScope(state)
    return {
      viewOnlyMode: (scope && !scope.includes('sysadmin')) || false
    }
  },
  {
    goToTeamUserList,
    goToReviewUserDetails
  }
)(withTheme(injectIntl(UserProfileComponent)))
