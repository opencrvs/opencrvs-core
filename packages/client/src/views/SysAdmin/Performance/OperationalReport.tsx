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
import { DateRangePicker } from '@client/components/DateRangePicker'
import { DeclarationStatusWindow } from '@client/components/interface/DeclarationStatusWindow'
import {
  NOTIFICATION_TYPE,
  ToastNotification
} from '@client/components/interface/ToastNotification'
import { Query } from '@client/components/Query'
import { Event } from '@client/forms'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/performance'
import { messages as statusMessages } from '@client/i18n/messages/views/registrarHome'
import {
  goToOperationalReport,
  goToPerformanceHome,
  goToRegistrationRates,
  goToWorkflowStatus
} from '@client/navigation'
import { ILocation } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { getToken } from '@client/utils/authUtils'
import { SYS_ADMIN_ROLES } from '@client/utils/constants'
import { generateLocations } from '@client/utils/locationUtils'
import { IUserDetails } from '@client/utils/userUtils'
import { PerformanceSelect } from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { FETCH_STATUS_WISE_REGISTRATION_COUNT } from '@client/views/SysAdmin/Performance/queries'
import {
  IStatusMapping,
  StatusWiseDeclarationCountView
} from '@client/views/SysAdmin/Performance/reports/operational/StatusWiseDeclarationCountView'
import {
  ActionContainer,
  FilterContainer
} from '@client/views/SysAdmin/Performance/utils'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import {
  ICON_ALIGNMENT,
  LinkButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { colors } from '@opencrvs/components/lib/colors'
import { Activity } from '@opencrvs/components/lib/icons'
import { ISearchLocation, Spinner } from '@opencrvs/components/lib/interface'
import { ITheme } from '@opencrvs/components/lib/theme'

import {
  GQLRegistrationCountResult,
  GQLTotalMetricsResult
} from '@opencrvs/gateway/src/graphql/schema'
import { ApolloError } from 'apollo-client'
import { parse } from 'query-string'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { withTheme } from 'styled-components'
import { PERFORMANCE_METRICS } from './metricsQuery'

import format from '@client/utils/date-formatting'

import { CompletenessReport } from './CompletenessReport'
import { RegistrationsReport } from './RegistrationsReport'
import { CorrectionsReport } from './CorrectionsReport'

interface IConnectProps {
  locations: { [key: string]: ILocation }
  offices: { [key: string]: ILocation }
}
interface IDispatchProps {
  goToPerformanceHome: typeof goToPerformanceHome
  goToOperationalReport: typeof goToOperationalReport
  goToRegistrationRates: typeof goToRegistrationRates
  goToWorkflowStatus: typeof goToWorkflowStatus
}

interface IMetricsQueryResult {
  getTotalMetrics: GQLTotalMetricsResult
}
interface IStatusQueryResult {
  fetchRegistrationCountByStatus: GQLRegistrationCountResult
}

export enum OPERATIONAL_REPORT_SECTION {
  OPERATIONAL = 'OPERATIONAL',
  REPORTS = 'REPORTS'
}

interface ISearchParams {
  sectionId: OPERATIONAL_REPORT_SECTION
  locationId: string
  timeStart: string
  timeEnd: string
}

type Props = WrappedComponentProps &
  RouteComponentProps & { userDetails: IUserDetails | null } & IConnectProps &
  IDispatchProps & { theme: ITheme }

interface State {
  sectionId: OPERATIONAL_REPORT_SECTION
  selectedLocation: ISearchLocation
  timeStart: Date
  timeEnd: Date
  selectedEvent: 'BIRTH' | 'DEATH'
  expandStatusWindow: boolean
  statusWindowWidth: number
  mainWindowLeftMargin: number
  mainWindowRightMargin: number
}

const Header = styled.h2`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h1};
  margin: 0;
`

const HeaderContainer = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;

  & > :first-child {
    margin-right: 24px;
  }

  & > :nth-child(2) {
    position: relative;
    bottom: 2px;
  }
`

const Container = styled.div`
  margin-bottom: 160px;
`

const StatusTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h4}
  margin-left: 8px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.bold16}
  }
`

export const StatusMapping: IStatusMapping = {
  IN_PROGRESS: {
    labelDescriptor: statusMessages.inProgress,
    color: colors.purple
  },
  DECLARED: {
    labelDescriptor: statusMessages.readyForReview,
    color: colors.orange
  },
  REJECTED: {
    labelDescriptor: statusMessages.sentForUpdates,
    color: colors.red
  },
  VALIDATED: {
    labelDescriptor: statusMessages.sentForApprovals,
    color: colors.grey300
  },
  WAITING_VALIDATION: {
    labelDescriptor: statusMessages.sentForExternalValidation,
    color: colors.grey500
  },
  REGISTERED: {
    labelDescriptor: statusMessages.readyToPrint,
    color: colors.green
  },
  CERTIFIED: {
    labelDescriptor: statusMessages.certified,
    color: colors.blue
  },
  REQUESTED_CORRECTION: {
    labelDescriptor: statusMessages.requestedCorrection,
    color: colors.blue
  },
  ARCHIVED: {
    labelDescriptor: statusMessages.archived,
    color: colors.blue
  }
}

class OperationalReportComponent extends React.Component<Props, State> {
  static transformPropsToState(props: Props, state?: State) {
    const {
      location: { search },
      locations,
      offices
    } = props
    const { timeStart, timeEnd, locationId, sectionId } = parse(
      search
    ) as unknown as ISearchParams
    const searchableLocations = generateLocations(
      { ...locations, ...offices },
      props.intl
    )
    const selectedLocation = searchableLocations.find(
      ({ id }) => id === locationId
    ) as ISearchLocation

    return {
      sectionId,
      selectedLocation,
      selectedEvent: 'BIRTH' as const,
      timeStart: new Date(timeStart),
      timeEnd: new Date(timeEnd),
      expandStatusWindow: state ? state.expandStatusWindow : false,
      statusWindowWidth: state ? state.statusWindowWidth : 0,
      mainWindowLeftMargin: state ? state.mainWindowLeftMargin : 0,
      mainWindowRightMargin: state ? state.mainWindowRightMargin : 0
    }
  }

  constructor(props: Props) {
    super(props)
    window.__localeId__ = this.props.intl.locale

    this.state = OperationalReportComponent.transformPropsToState(
      props,
      undefined
    )
  }

  isOfficeSelected() {
    return !!this.props.offices[this.state.selectedLocation.id]
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    return OperationalReportComponent.transformPropsToState(props, state)
  }

  downloadMonthlyData = (monthStart: Date, monthEnd: Date, event: string) => {
    const metricsURL = `${
      window.config.API_GATEWAY_URL
    }export/monthlyPerformanceMetrics?locationId=${
      this.state.selectedLocation.id
    }&timeStart=${monthStart.toISOString()}&timeEnd=${monthEnd.toISOString()}&event=${event}`
    fetch(metricsURL, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then((resp) => resp.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${format(monthStart, 'MMMM_yyyy')}_export.zip`
        a.click()
        window.URL.revokeObjectURL(url)
      })
  }

  onChangeLocation = () => {
    this.props.goToPerformanceHome({
      selectedLocation: this.state.selectedLocation
    })
  }

  onClickRegistrationRatesDetails = (event: Event, title: string) => {
    const { selectedLocation, timeStart, timeEnd } = this.state
    this.props.goToRegistrationRates(
      event,
      title,
      selectedLocation.id,
      timeStart,
      timeEnd
    )
  }

  statusButtonClickHandler = () => {
    this.setState({
      ...this.state,
      expandStatusWindow: true,
      statusWindowWidth: 450,
      mainWindowLeftMargin: 10,
      mainWindowRightMargin: 460
    })
  }

  statusWindowCrossClickHandler = () => {
    this.setState({
      ...this.state,
      expandStatusWindow: false,
      statusWindowWidth: 0,
      mainWindowLeftMargin: 0,
      mainWindowRightMargin: 0
    })
  }

  getStatusWindowTitle = () => {
    const { intl, theme } = this.props
    return (
      <StatusTitleContainer>
        <Activity stroke={theme.colors.copy} />{' '}
        <Title>{intl.formatMessage(buttonMessages.status)}</Title>
      </StatusTitleContainer>
    )
  }

  onClickStatusDetails = (status?: keyof IStatusMapping) => {
    const { selectedLocation, sectionId, timeStart, timeEnd } = this.state
    const { id: locationId } = selectedLocation
    this.props.goToWorkflowStatus(
      sectionId,
      locationId,
      timeStart,
      timeEnd,
      status
    )
  }
  render() {
    const { intl, userDetails } = this.props

    const {
      selectedLocation,
      sectionId,
      timeStart,
      timeEnd,
      selectedEvent,
      expandStatusWindow,
      statusWindowWidth,
      mainWindowLeftMargin,
      mainWindowRightMargin
    } = this.state

    const role = userDetails && userDetails.role

    const { displayLabel: title, id: locationId } = selectedLocation
    return (
      <SysAdminContentWrapper
        marginLeft={mainWindowLeftMargin}
        marginRight={mainWindowRightMargin}
      >
        <Container>
          <HeaderContainer>
            <Header id="header-location-name">{title}</Header>
            {role && !SYS_ADMIN_ROLES.includes(role) && (
              <LinkButton
                id="change-location-link"
                onClick={this.onChangeLocation}
              >
                {intl.formatMessage(buttonMessages.change)}
              </LinkButton>
            )}
          </HeaderContainer>
          <ActionContainer>
            <FilterContainer id="operational-report-view">
              <PerformanceSelect
                onChange={(option) => {
                  this.props.goToOperationalReport(
                    selectedLocation.id,
                    option.value as OPERATIONAL_REPORT_SECTION,
                    timeStart,
                    timeEnd
                  )
                }}
                id="operational-select"
                value={sectionId || OPERATIONAL_REPORT_SECTION.OPERATIONAL}
                options={[
                  {
                    label: intl.formatMessage(messages.operational),
                    value: OPERATIONAL_REPORT_SECTION.OPERATIONAL
                  },
                  {
                    label: intl.formatMessage(messages.reports),
                    value: OPERATIONAL_REPORT_SECTION.REPORTS
                  }
                ]}
              />
              <DateRangePicker
                startDate={timeStart}
                endDate={timeEnd}
                onDatesChange={({ startDate, endDate }) => {
                  this.props.goToOperationalReport(
                    selectedLocation.id,
                    sectionId,
                    startDate,
                    endDate
                  )
                }}
              />
            </FilterContainer>
            {!expandStatusWindow && (
              <TertiaryButton
                id="btn-status"
                align={ICON_ALIGNMENT.LEFT}
                icon={() => <Activity />}
                onClick={this.statusButtonClickHandler}
              >
                {intl.formatMessage(buttonMessages.status)}
              </TertiaryButton>
            )}
          </ActionContainer>
          {sectionId === OPERATIONAL_REPORT_SECTION.OPERATIONAL && (
            <Query
              query={PERFORMANCE_METRICS}
              variables={{
                timeStart: timeStart.toISOString(),
                timeEnd: timeEnd.toISOString(),
                locationId,
                event: selectedEvent
              }}
              fetchPolicy="no-cache"
            >
              {({
                loading,
                error,
                data
              }: {
                loading: boolean
                error?: ApolloError
                data?: IMetricsQueryResult
              }) => {
                if (error) {
                  return (
                    <>
                      <ToastNotification type={NOTIFICATION_TYPE.ERROR} />
                    </>
                  )
                }

                if (loading) {
                  return <Spinner id="performance-home-loading" />
                }

                return (
                  <>
                    <CompletenessReport
                      data={data!.getTotalMetrics}
                      selectedEvent={selectedEvent}
                    />
                    <RegistrationsReport
                      data={data!.getTotalMetrics}
                      selectedEvent={selectedEvent}
                    />
                    <CorrectionsReport
                      timeStart={timeStart}
                      timeEnd={timeEnd}
                      locationId={locationId}
                      selectedEvent={selectedEvent}
                    />
                  </>
                )
              }}
            </Query>
          )}
        </Container>
        {expandStatusWindow && (
          <DeclarationStatusWindow
            width={statusWindowWidth}
            crossClickHandler={this.statusWindowCrossClickHandler}
            title={this.getStatusWindowTitle()}
          >
            <Query
              query={FETCH_STATUS_WISE_REGISTRATION_COUNT}
              variables={{
                locationId,
                status: [
                  'IN_PROGRESS',
                  'DECLARED',
                  'REJECTED',
                  'VALIDATED',
                  'WAITING_VALIDATION',
                  'REGISTERED'
                ]
              }}
            >
              {({
                loading,
                error,
                data
              }: {
                loading: boolean
                error?: ApolloError
                data?: IStatusQueryResult
              }) => {
                if (error) {
                  return (
                    <>
                      <StatusWiseDeclarationCountView
                        loading={true}
                        locationId={locationId}
                        onClickStatusDetails={this.onClickStatusDetails}
                      />
                      <ToastNotification type={NOTIFICATION_TYPE.ERROR} />
                    </>
                  )
                }
                return (
                  <StatusWiseDeclarationCountView
                    loading={loading}
                    locationId={locationId}
                    data={data && data.fetchRegistrationCountByStatus}
                    statusMapping={StatusMapping}
                    onClickStatusDetails={this.onClickStatusDetails}
                  />
                )
              }}
            </Query>
          </DeclarationStatusWindow>
        )}
      </SysAdminContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  const offlineCountryConfiguration = getOfflineData(state)
  return {
    locations: offlineCountryConfiguration.locations,
    offices: offlineCountryConfiguration.offices,
    userDetails: getUserDetails(state)
  }
}

export const OperationalReport = connect(mapStateToProps, {
  goToPerformanceHome,
  goToOperationalReport,
  goToRegistrationRates,
  goToWorkflowStatus
})(withTheme(injectIntl(OperationalReportComponent)))
