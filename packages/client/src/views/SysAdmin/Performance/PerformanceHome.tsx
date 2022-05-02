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
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { messages } from '@client/i18n/messages/views/performance'
import { ILocation } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { generateLocations } from '@client/utils/locationUtils'
import {
  Box,
  ISearchLocation,
  ResponsiveModal,
  Spinner
} from '@opencrvs/components/lib/interface'
import * as React from 'react'
import { parse } from 'query-string'
import { ITheme } from '@opencrvs/components/lib/theme'
import { injectIntl, WrappedComponentProps, IntlShape } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import styled, { withTheme } from 'styled-components'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { DateRangePicker } from '@client/components/DateRangePicker'
import subYears from 'date-fns/subYears'
import { PerformanceSelect } from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { Event } from '@client/forms'
import { LocationPicker } from '@client/components/LocationPicker'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'
import { Query } from '@client/components/Query'
import { PERFORMANCE_METRICS, PERFORMANCE_STATS } from './metricsQuery'
import { ApolloError } from 'apollo-client'
import {
  ToastNotification,
  NOTIFICATION_TYPE
} from '@client/components/interface/ToastNotification'
import { CompletenessReport } from '@client/views/SysAdmin/Performance/CompletenessReport'
import { RegistrationsReport } from '@client/views/SysAdmin/Performance/RegistrationsReport'
import { GQLTotalMetricsResult } from '@opencrvs/gateway/src/graphql/schema'
import { GET_TOTAL_PAYMENTS } from '@client/views/SysAdmin/Performance/queries'
import { PaymentsAmountComponent } from '@client/views/SysAdmin/Performance/PaymentsAmountComponent'
import { CertificationRateComponent } from '@client/views/SysAdmin/Performance/CertificationRateComponent'
import {
  certificationRatesDummyData,
  StatusMapping,
  getAdditionalLocations,
  CompletenessRateTime,
  isCountry,
  NATIONAL_ADMINISTRATIVE_LEVEL
} from '@client/views/SysAdmin/Performance/utils'
import { constantsMessages } from '@client/i18n/messages/constants'
import { CorrectionsReport } from '@client/views/SysAdmin/Performance/CorrectionsReport'
import { PerformanceStats } from './PerformanceStats'
import { SubHeader } from './utils'
import { AppSources } from './ApplicationSourcesComp'

import { LocationStatsView } from './LocationStatsView'
import {
  IStatusMapping,
  StatusWiseDeclarationCountView
} from './reports/operational/StatusWiseDeclarationCountView'
import { goToWorkflowStatus, goToCompletenessRates } from '@client/navigation'

const Layout = styled.div`
  display: flex;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
    flex-direction: column;
  }
  gap: 16px;
`
const LayoutLeft = styled.div`
  flex-grow: 1;

  & > div {
    flex-grow: 1;
    @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
      width: auto;
      max-width: 720px;
      margin-bottom: 0;
    }
    @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
      max-width: none;
      margin-bottom: 24px;
    }
  }

  .performance-block {
    &:not(:last-child) {
      margin-bottom: 40px;
    }
  }
`
const LayoutRight = styled.div`
  margin: 24px auto;
  width: 360px;
  display: flex;
  gap: 16px;
  flex-direction: column;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.xl}px) {
    width: 100%;
    max-width: 720px;
    margin-top: 0;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const ResponsiveModalContent = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
`

const LocationStats = styled(Box)`
  margin: 0 auto;
  width: 100%;
  height: auto;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    border: 0;
    padding: 0;
  }
`
const RegistrationStatus = styled(Box)`
  width: 100%;
  height: auto;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    border: 0;
    padding: 0;
  }
`

const Devider = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  margin-bottom: 16px;
`

const PerformanceActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`
interface IConnectProps {
  locations: { [key: string]: ILocation }
  offices: { [key: string]: ILocation }
}

interface ISearchParams {
  event: Event
  locationId: string
  timeStart: string
  timeEnd: string
}

interface IMetricsQueryResult {
  getTotalMetrics: GQLTotalMetricsResult
}

interface State {
  selectedLocation: ISearchLocation
  /* TODO the event type should be changed because Event is birth/death.
  WorkflowStatus.tsx, StatusWiseDeclarationCountView requires BIRTH/DEATH.
  GraphQL Queries in PerformanceHome.tsx also require BIRTH/DEATH.
  Due to that we had to use toUpperCase where it is required.
  */
  event: Event
  timeStart: Date
  timeEnd: Date
  toggleStatus: boolean
}

interface IDispatchProps {
  goToWorkflowStatus: typeof goToWorkflowStatus
  goToCompletenessRates: typeof goToCompletenessRates
}

type Props = WrappedComponentProps &
  IDispatchProps &
  RouteComponentProps & { userDetails: IUserDetails | null } & IConnectProps & {
    theme: ITheme
  }

const selectLocation = (
  locationId: string,
  searchableLocations: ISearchLocation[]
) => {
  return searchableLocations.find(
    ({ id }) => id === locationId
  ) as ISearchLocation
}

class PerformanceHomeComponent extends React.Component<Props, State> {
  transformPropsToState(props: Props) {
    const {
      location: { search },
      locations,
      offices
    } = props
    const { timeStart, timeEnd, locationId, event } = parse(
      search
    ) as unknown as ISearchParams
    const selectedLocation = selectLocation(
      locationId,
      generateLocations({ ...locations, ...offices }, props.intl).concat(
        getAdditionalLocations(props.intl)
      )
    )

    return {
      selectedLocation,
      timeStart:
        (timeStart && new Date(timeStart)) || subYears(new Date(Date.now()), 1),
      timeEnd: (timeEnd && new Date(timeEnd)) || new Date(Date.now()),
      event: event || Event.BIRTH,
      toggleStatus: false
    }
  }

  constructor(props: Props) {
    super(props)
    window.__localeId__ = this.props.intl.locale

    this.state = this.transformPropsToState(props)
  }

  togglePerformanceStatus = () => {
    this.setState({
      toggleStatus: !this.state.toggleStatus
    })
  }

  onClickDetails = (time: CompletenessRateTime) => {
    const { event, selectedLocation, timeStart, timeEnd } = this.state
    this.props.goToCompletenessRates(
      event,
      selectedLocation && !isCountry(selectedLocation)
        ? selectedLocation.id
        : undefined,
      timeStart,
      timeEnd,
      time
    )
  }

  getFilter = (intl: IntlShape, selectedLocation: ISearchLocation) => {
    const { id: locationId } = selectedLocation || {}

    return (
      <PerformanceActions>
        <LocationPicker
          additionalLocations={getAdditionalLocations(intl)}
          selectedLocationId={locationId || NATIONAL_ADMINISTRATIVE_LEVEL}
          onChangeLocation={(newLocationId) => {
            const newLocation = selectLocation(
              newLocationId,
              generateLocations(
                {
                  ...this.props.locations,
                  ...this.props.offices
                },
                this.props.intl
              ).concat(getAdditionalLocations(intl))
            )
            this.setState({ selectedLocation: newLocation })
          }}
        />
        <PerformanceSelect
          onChange={(option) => this.setState({ event: option.value as Event })}
          id="eventSelect"
          withLightTheme={true}
          defaultWidth={100}
          value={this.state.event}
          options={[
            {
              label: intl.formatMessage(messages.eventOptionForBirths),
              value: Event.BIRTH
            },
            {
              label: intl.formatMessage(messages.eventOptionForDeaths),
              value: Event.DEATH
            }
          ]}
        />
        <DateRangePicker
          startDate={this.state.timeStart}
          endDate={this.state.timeEnd}
          onDatesChange={({ startDate, endDate }) => {
            this.setState({
              timeStart: startDate,
              timeEnd: endDate
            })
          }}
        />
      </PerformanceActions>
    )
  }

  onClickStatusDetails = (status?: keyof IStatusMapping) => {
    const { selectedLocation, event, timeStart, timeEnd } = this.state
    const { id: locationId } = selectedLocation
    this.props.goToWorkflowStatus(locationId, timeStart, timeEnd, status, event)
  }

  render() {
    const { intl } = this.props
    const { timeStart, timeEnd, event, toggleStatus } = this.state
    const queryVariablesWithoutLocationId = {
      timeStart: timeStart.toISOString(),
      timeEnd: timeEnd.toISOString(),
      event: event.toUpperCase()
    }
    return (
      <SysAdminContentWrapper
        id="performanceHome"
        isCertificatesConfigPage={true}
        mapPerformanceClickHandler={this.togglePerformanceStatus}
        profilePageStyle={{
          paddingTopMd: 0,
          horizontalPaddingMd: 0
        }}
      >
        <Layout>
          <LayoutLeft>
            <Content
              title={intl.formatMessage(navigationMessages.performance)}
              size={ContentSize.LARGE}
              filterContent={this.getFilter(intl, this.state.selectedLocation)}
            >
              <Query
                query={PERFORMANCE_METRICS}
                variables={
                  this.state.selectedLocation &&
                  !isCountry(this.state.selectedLocation)
                    ? {
                        ...queryVariablesWithoutLocationId,
                        locationId: this.state.selectedLocation.id
                      }
                    : queryVariablesWithoutLocationId
                }
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
                        selectedEvent={event.toUpperCase() as 'BIRTH' | 'DEATH'}
                        onClickDetails={this.onClickDetails}
                      />
                      <RegistrationsReport
                        data={data!.getTotalMetrics}
                        selectedEvent={event.toUpperCase() as 'BIRTH' | 'DEATH'}
                      />
                      <CertificationRateComponent
                        data={certificationRatesDummyData}
                      />
                      <AppSources
                        data={data!.getTotalMetrics}
                        locationId={this.state.selectedLocation.id}
                        timeStart={timeStart.toISOString()}
                        timeEnd={timeEnd.toISOString()}
                      />
                    </>
                  )
                }}
              </Query>
              <CorrectionsReport
                timeStart={timeStart}
                timeEnd={timeEnd}
                locationId={
                  this.state.selectedLocation &&
                  !isCountry(this.state.selectedLocation)
                    ? this.state.selectedLocation.id
                    : undefined
                }
                selectedEvent={event.toUpperCase() as 'BIRTH' | 'DEATH'}
              />
              <Query
                query={GET_TOTAL_PAYMENTS}
                variables={
                  this.state.selectedLocation &&
                  !isCountry(this.state.selectedLocation)
                    ? {
                        ...queryVariablesWithoutLocationId,
                        locationId: this.state.selectedLocation.id
                      }
                    : queryVariablesWithoutLocationId
                }
              >
                {({ loading, data, error }) => {
                  if (data && data.getTotalPayments) {
                    return (
                      <PaymentsAmountComponent data={data!.getTotalPayments} />
                    )
                  }
                  if (loading) {
                    return <Spinner id="fees-collected-loading" />
                  }
                  if (error) {
                    return (
                      <>
                        <ToastNotification type={NOTIFICATION_TYPE.ERROR} />
                      </>
                    )
                  }
                }}
              </Query>
            </Content>
          </LayoutLeft>
          <Query
            query={PERFORMANCE_STATS}
            variables={{
              locationId:
                this.state.selectedLocation &&
                !isCountry(this.state.selectedLocation)
                  ? this.state.selectedLocation.id
                  : undefined,
              populationYear: timeEnd.getFullYear(),
              event: this.state.event,
              status: [
                'IN_PROGRESS',
                'DECLARED',
                'REJECTED',
                'VALIDATED',
                'WAITING_VALIDATION',
                'REGISTERED'
              ]
            }}
            fetchPolicy="no-cache"
          >
            {({ loading, data, error }) => {
              if (error) {
                return (
                  <>
                    <ToastNotification type={NOTIFICATION_TYPE.ERROR} />
                  </>
                )
              }

              return (
                <>
                  <ResponsiveModal
                    title={intl.formatMessage(constantsMessages.status)}
                    show={toggleStatus}
                    handleClose={this.togglePerformanceStatus}
                    actions={[]}
                  >
                    <ResponsiveModalContent>
                      {loading ? (
                        <Spinner id="modal-data-loading" />
                      ) : (
                        <>
                          <StatusWiseDeclarationCountView
                            selectedEvent={this.state.event}
                            locationId={this.state.selectedLocation?.id}
                            statusMapping={StatusMapping}
                            data={data.fetchRegistrationCountByStatus}
                            onClickStatusDetails={this.onClickStatusDetails}
                          />

                          <Devider />

                          <LocationStatsView
                            registrationOffices={
                              data.getLocationStatistics!.offices
                            }
                            totalRegistrars={
                              data.getLocationStatistics!.registrars
                            }
                            citizen={
                              Math.round(
                                data.getLocationStatistics!.population
                              ) /
                              Math.round(data.getLocationStatistics!.registrars)
                            }
                          />
                        </>
                      )}
                    </ResponsiveModalContent>
                  </ResponsiveModal>
                  <LayoutRight>
                    <LocationStats>
                      {loading ? (
                        <Spinner id="location-stats-loading" />
                      ) : (
                        <LocationStatsView
                          registrationOffices={
                            data.getLocationStatistics!.offices
                          }
                          totalRegistrars={
                            data.getLocationStatistics!.registrars
                          }
                          citizen={
                            Math.round(data.getLocationStatistics!.population) /
                            Math.round(data.getLocationStatistics!.registrars)
                          }
                        />
                      )}
                    </LocationStats>

                    <RegistrationStatus>
                      {loading ? (
                        <Spinner id="registration-status-loading" />
                      ) : (
                        <StatusWiseDeclarationCountView
                          selectedEvent={this.state.event}
                          locationId={this.state.selectedLocation?.id}
                          statusMapping={StatusMapping}
                          data={data.fetchRegistrationCountByStatus}
                          onClickStatusDetails={this.onClickStatusDetails}
                        />
                      )}
                    </RegistrationStatus>
                  </LayoutRight>
                </>
              )
            }}
          </Query>
        </Layout>
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

export const PerformanceHome = connect(mapStateToProps, {
  goToWorkflowStatus,
  goToCompletenessRates
})(withTheme(injectIntl(PerformanceHomeComponent)))
