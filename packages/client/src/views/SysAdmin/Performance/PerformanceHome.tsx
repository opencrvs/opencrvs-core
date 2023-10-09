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
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { messages } from '@client/i18n/messages/views/performance'
import { ILocation } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { generateLocations } from '@client/utils/locationUtils'
import { ISearchLocation } from '@opencrvs/components/lib/LocationSearch'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import * as React from 'react'
import { parse } from 'query-string'
import { ITheme } from '@opencrvs/components/lib/theme'
import { injectIntl, WrappedComponentProps, IntlShape } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import styled, { withTheme } from 'styled-components'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { DateRangePicker } from '@client/components/DateRangePicker'
import subMonths from 'date-fns/subMonths'
import { PerformanceSelect } from '@client/views/SysAdmin/Performance/PerformanceSelect'
import { Event } from '@client/utils/gateway'
import { LocationPicker } from '@client/components/LocationPicker'
import { getUserDetails } from '@client/profile/profileSelectors'
import { Query } from '@client/components/Query'
import {
  CORRECTION_TOTALS,
  PERFORMANCE_METRICS,
  PERFORMANCE_STATS
} from './metricsQuery'
import { ApolloError } from '@apollo/client'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { CompletenessReport } from '@client/views/SysAdmin/Performance/CompletenessReport'
import { RegistrationsReport } from '@client/views/SysAdmin/Performance/RegistrationsReport'
import type {
  GQLCorrectionMetric,
  GQLTotalMetricsResult
} from '@client/utils/gateway-deprecated-do-not-use'
import { GET_TOTAL_PAYMENTS } from '@client/views/SysAdmin/Performance/queries'
import { PaymentsAmountComponent } from '@client/views/SysAdmin/Performance/PaymentsAmountComponent'
import { CertificationRatesReport } from '@client/views/SysAdmin/Performance/CertificationRatesReport'
import {
  StatusMapping,
  getAdditionalLocations,
  CompletenessRateTime,
  isCountry,
  NATIONAL_ADMINISTRATIVE_LEVEL,
  calculateTotal
} from '@client/views/SysAdmin/Performance/utils'
import { constantsMessages } from '@client/i18n/messages/constants'
import { CorrectionsReport } from '@client/views/SysAdmin/Performance/CorrectionsReport'
import { AppSources } from './ApplicationSourcesReport'
import { LocationStatsView } from './LocationStatsView'
import {
  IStatusMapping,
  StatusWiseDeclarationCountView
} from './reports/operational/StatusWiseDeclarationCountView'
import {
  goToWorkflowStatus,
  goToCompletenessRates,
  goToPerformanceHome
} from '@client/navigation'
import { withOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'
import { NoWifi } from '@opencrvs/components/lib/icons'
import { REGISTRAR_ROLES } from '@client/utils/constants'
import { ICurrency } from '@client/utils/referenceApi'
import { Box } from '@opencrvs/components/lib/Box'
import startOfMonth from 'date-fns/startOfMonth'
import { UserDetails } from '@client/utils/userUtils'

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
    min-height: 80vh;
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
    @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
      min-height: 100vh;
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
  width: 335px;
  display: flex;
  flex-shrink: 0;
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
  flex-basis: 20vh;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    border: 0;
    padding: 0;
  }
`
const RegistrationStatus = styled(Box)`
  width: 100%;
  height: auto;
  flex-basis: 48vh;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    border: 0;
    padding: 0;
  }
`

const Devider = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  margin-bottom: 16px;
`

const ConnectivityContainer = styled.div`
  justify-content: center;
  gap: 8px;
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-top: 12px;
  }
`
const NoConnectivity = styled(NoWifi)`
  width: 24px;
`

const Text = styled.div`
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
`
interface IConnectProps {
  locations: { [key: string]: ILocation }
  offices: { [key: string]: ILocation }
  timeStart: Date
  timeEnd: Date
  event: Event
  selectedLocation: ISearchLocation
  currency: ICurrency
}

interface ISearchParams {
  /* TODO the event type should be changed because Event is birth/death.
  WorkflowStatus.tsx, StatusWiseDeclarationCountView requires BIRTH/DEATH.
  GraphQL Queries in PerformanceHome.tsx also require BIRTH/DEATH.
  Due to that we had to use toUpperCase where it is required.
  */
  event: Event
  locationId: string
  timeStart: string
  timeEnd: string
}

interface IMetricsQueryResult {
  getTotalMetrics: GQLTotalMetricsResult
}

interface State {
  toggleStatus: boolean
  officeSelected: boolean
  isAccessibleOffice: boolean
}

type IOnlineStatusProps = {
  isOnline: boolean
}

interface IDispatchProps {
  goToWorkflowStatus: typeof goToWorkflowStatus
  goToCompletenessRates: typeof goToCompletenessRates
  goToPerformanceHome: typeof goToPerformanceHome
}

type Props = WrappedComponentProps &
  IDispatchProps &
  IOnlineStatusProps &
  RouteComponentProps & { userDetails: UserDetails | null } & IConnectProps & {
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
interface ICorrectionsQueryResult {
  getTotalCorrections: Array<GQLCorrectionMetric>
}

class PerformanceHomeComponent extends React.Component<Props, State> {
  transformPropsToState(props: Props) {
    const { selectedLocation } = props
    return {
      toggleStatus: false,
      officeSelected: this.isOfficeSelected(selectedLocation),
      isAccessibleOffice: this.isAccessibleOfficeSelected(selectedLocation)
    }
  }

  constructor(props: Props) {
    super(props)
    window.__localeId__ = this.props.intl.locale

    this.state = this.transformPropsToState(props)
  }

  componentDidUpdate(previousProps: Props) {
    if (previousProps.selectedLocation.id !== this.props.selectedLocation.id) {
      this.setState({
        officeSelected: this.isOfficeSelected(this.props.selectedLocation),
        isAccessibleOffice: this.isAccessibleOfficeSelected(
          this.props.selectedLocation
        )
      })
    }
  }

  togglePerformanceStatus = () => {
    this.setState({
      toggleStatus: !this.state.toggleStatus
    })
  }

  onClickDetails = (time: CompletenessRateTime) => {
    const { event, timeStart, timeEnd, selectedLocation } = this.props
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
    const { id: locationId } = selectedLocation

    return (
      <>
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
            this.props.goToPerformanceHome(
              this.props.timeStart,
              this.props.timeEnd,
              this.props.event,
              newLocation.id
            )
          }}
        />
        <PerformanceSelect
          onChange={(option) => {
            const { timeStart, timeEnd } = this.props
            this.props.goToPerformanceHome(
              timeStart,
              timeEnd,
              option.value as Event,
              locationId
            )
          }}
          id="eventSelect"
          withLightTheme={true}
          defaultWidth={110}
          value={this.props.event}
          options={[
            {
              label: intl.formatMessage(messages.eventOptionForBirths),
              value: Event.Birth
            },
            {
              label: intl.formatMessage(messages.eventOptionForDeaths),
              value: Event.Death
            }
          ]}
        />
        <DateRangePicker
          startDate={this.props.timeStart}
          endDate={this.props.timeEnd}
          onDatesChange={({ startDate, endDate }) => {
            this.props.goToPerformanceHome(
              startDate,
              endDate,
              this.props.event,
              locationId
            )
          }}
        />
      </>
    )
  }

  onClickStatusDetails = (status?: keyof IStatusMapping) => {
    const { event, timeStart, timeEnd, selectedLocation } = this.props
    const { id: locationId } = selectedLocation
    this.props.goToWorkflowStatus(locationId, timeStart, timeEnd, status, event)
  }

  isOfficeSelected(selectedLocation?: ISearchLocation) {
    if (selectedLocation) {
      return Object.keys(this.props.offices).some(
        (id) => id === selectedLocation.id
      )
    }
    return false
  }

  isAccessibleOfficeSelected(selectedLocation?: ISearchLocation) {
    if (
      selectedLocation &&
      this.isOfficeSelected(selectedLocation) &&
      this.props.userDetails &&
      this.props.userDetails.systemRole
    ) {
      if (this.props.userDetails?.systemRole === 'NATIONAL_REGISTRAR') {
        return true
      } else if (
        REGISTRAR_ROLES.includes(this.props.userDetails?.systemRole) &&
        this.props.userDetails.primaryOffice?.id === selectedLocation.id
      ) {
        return true
      }
    }
    return false
  }

  render() {
    const { intl, isOnline } = this.props
    const { toggleStatus, officeSelected } = this.state
    const { timeStart, timeEnd, event, selectedLocation } = this.props

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
        hideBackground={true}
      >
        <Layout>
          <LayoutLeft>
            <Content
              title={intl.formatMessage(navigationMessages.performance)}
              size={ContentSize.LARGE}
              filterContent={this.getFilter(intl, selectedLocation)}
            >
              {isOnline ? (
                <>
                  <Query
                    query={PERFORMANCE_METRICS}
                    fetchPolicy="cache-and-network"
                    variables={
                      selectedLocation && !isCountry(selectedLocation)
                        ? {
                            ...queryVariablesWithoutLocationId,
                            locationId: selectedLocation.id
                          }
                        : queryVariablesWithoutLocationId
                    }
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
                        return <GenericErrorToast />
                      }

                      if (loading && !data) {
                        return (
                          <Spinner id="performance-home-loading" size={24} />
                        )
                      }

                      return (
                        <>
                          {!officeSelected && (
                            <CompletenessReport
                              data={data!.getTotalMetrics}
                              selectedEvent={
                                event.toUpperCase() as 'BIRTH' | 'DEATH'
                              }
                              onClickDetails={this.onClickDetails}
                            />
                          )}
                          <RegistrationsReport
                            data={data!.getTotalMetrics}
                            selectedEvent={
                              event.toUpperCase() as 'BIRTH' | 'DEATH'
                            }
                            timeStart={timeStart.toISOString()}
                            timeEnd={timeEnd.toISOString()}
                            locationId={selectedLocation.id}
                          />
                          <CertificationRatesReport
                            totalRegistrations={calculateTotal(
                              data?.getTotalMetrics.results || []
                            )}
                            {...(selectedLocation &&
                            !isCountry(selectedLocation)
                              ? {
                                  ...queryVariablesWithoutLocationId,
                                  locationId: selectedLocation.id
                                }
                              : queryVariablesWithoutLocationId)}
                          />
                          <AppSources
                            data={data!.getTotalMetrics}
                            isAccessibleOffice={this.state.isAccessibleOffice}
                            locationId={
                              isCountry(selectedLocation)
                                ? undefined
                                : selectedLocation.id
                            }
                            timeStart={timeStart.toISOString()}
                            timeEnd={timeEnd.toISOString()}
                            event={event}
                          />
                        </>
                      )
                    }}
                  </Query>
                  <Query
                    fetchPolicy="cache-and-network"
                    query={CORRECTION_TOTALS}
                    variables={
                      selectedLocation && !isCountry(selectedLocation)
                        ? {
                            ...queryVariablesWithoutLocationId,
                            locationId: selectedLocation.id
                          }
                        : queryVariablesWithoutLocationId
                    }
                  >
                    {({
                      loading,
                      error,
                      data
                    }: {
                      loading: boolean
                      error?: ApolloError
                      data?: ICorrectionsQueryResult
                    }) => {
                      if (error) {
                        return <GenericErrorToast />
                      }

                      if (loading) {
                        return null
                      }
                      return (
                        <CorrectionsReport data={data!.getTotalCorrections} />
                      )
                    }}
                  </Query>
                  <Query
                    fetchPolicy="cache-and-network"
                    query={GET_TOTAL_PAYMENTS}
                    variables={
                      selectedLocation && !isCountry(selectedLocation)
                        ? {
                            ...queryVariablesWithoutLocationId,
                            locationId: selectedLocation.id
                          }
                        : queryVariablesWithoutLocationId
                    }
                  >
                    {({ loading, data, error }) => {
                      if (error) {
                        return <GenericErrorToast />
                      }
                      if (loading) {
                        return null
                      }
                      if (data && data.getTotalPayments) {
                        return (
                          <PaymentsAmountComponent
                            currency={this.props.currency}
                            data={data!.getTotalPayments}
                          />
                        )
                      }

                      return <></>
                    }}
                  </Query>
                </>
              ) : (
                <ConnectivityContainer>
                  <NoConnectivity />
                  <Text id="no-connection-text">
                    {intl.formatMessage(constantsMessages.noConnection)}
                  </Text>
                </ConnectivityContainer>
              )}
            </Content>
          </LayoutLeft>
          <Query
            query={PERFORMANCE_STATS}
            variables={{
              locationId:
                selectedLocation && !isCountry(selectedLocation)
                  ? selectedLocation.id
                  : undefined,
              populationYear: timeEnd.getFullYear(),
              event,
              status: [
                'IN_PROGRESS',
                'DECLARED',
                'REJECTED',
                'VALIDATED',
                'WAITING_VALIDATION',
                'REGISTERED'
              ],
              officeSelected: this.state.officeSelected
            }}
            fetchPolicy="cache-and-network"
            key={Number(isOnline)} // To re-render when online
          >
            {({ loading, data, error }) => {
              if (error) {
                return <GenericErrorToast />
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
                      {loading && !data ? (
                        <Spinner id="modal-data-loading" size={24} />
                      ) : (
                        <>
                          {isOnline && (
                            <StatusWiseDeclarationCountView
                              selectedEvent={this.props.event}
                              isAccessibleOffice={this.state.isAccessibleOffice}
                              statusMapping={StatusMapping}
                              data={data.fetchRegistrationCountByStatus}
                              onClickStatusDetails={this.onClickStatusDetails}
                            />
                          )}

                          {!officeSelected && isOnline && (
                            <>
                              <Devider />

                              <LocationStatsView
                                registrationOffices={
                                  data.getLocationStatistics!.offices
                                }
                                totalRegistrars={
                                  data.getLocationStatistics!.registrars
                                }
                                citizen={Math.round(
                                  data.getLocationStatistics!.population /
                                    data.getLocationStatistics!.registrars
                                )}
                              />
                            </>
                          )}
                        </>
                      )}
                    </ResponsiveModalContent>
                  </ResponsiveModal>
                  <LayoutRight>
                    {!officeSelected && (
                      <LocationStats>
                        {!isOnline ? null : loading && !data ? (
                          <Spinner id="location-stats-loading" size={24} />
                        ) : (
                          <LocationStatsView
                            registrationOffices={
                              data.getLocationStatistics!.offices
                            }
                            totalRegistrars={
                              data.getLocationStatistics!.registrars
                            }
                            citizen={Math.round(
                              data.getLocationStatistics!.population /
                                data.getLocationStatistics!.registrars
                            )}
                          />
                        )}
                      </LocationStats>
                    )}

                    <RegistrationStatus>
                      {!isOnline ? (
                        <></>
                      ) : loading && !data ? (
                        <Spinner id="registration-status-loading" size={24} />
                      ) : (
                        <StatusWiseDeclarationCountView
                          selectedEvent={this.props.event}
                          isAccessibleOffice={this.state.isAccessibleOffice}
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

function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps & WrappedComponentProps
) {
  const offlineCountryConfiguration = getOfflineData(state)

  const locations = offlineCountryConfiguration.locations
  const offices = offlineCountryConfiguration.offices
  const {
    location: { search }
  } = props
  const { timeStart, timeEnd, locationId, event } = parse(
    search
  ) as unknown as ISearchParams

  const selectedLocation = !locationId
    ? getAdditionalLocations(props.intl)[0]
    : selectLocation(
        locationId,
        generateLocations({ ...locations, ...offices }, props.intl).concat(
          getAdditionalLocations(props.intl)
        )
      )

  return {
    locations,
    timeStart:
      (timeStart && new Date(timeStart)) ||
      new Date(
        startOfMonth(subMonths(new Date(Date.now()), 11)).setHours(0, 0, 0, 0)
      ),
    timeEnd:
      (timeEnd && new Date(timeEnd)) ||
      new Date(new Date(Date.now()).setHours(23, 59, 59, 999)),
    event: event || Event.Birth,
    selectedLocation,
    offices: offlineCountryConfiguration.offices,
    userDetails: getUserDetails(state),
    currency: offlineCountryConfiguration.config.CURRENCY
  }
}

export const PerformanceHome = injectIntl(
  connect(mapStateToProps, {
    goToWorkflowStatus,
    goToCompletenessRates,
    goToPerformanceHome
  })(withTheme(withOnlineStatus(PerformanceHomeComponent)))
)
