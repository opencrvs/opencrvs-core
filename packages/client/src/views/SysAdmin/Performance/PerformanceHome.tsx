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
import { goToPerformanceHome } from '@client/navigation'
import { ILocation } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { generateLocations } from '@client/utils/locationUtils'
import {
  Box,
  ISearchLocation,
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
import { PERFORMANCE_METRICS } from './metricsQuery'
import { ApolloError } from 'apollo-client'
import {
  ToastNotification,
  NOTIFICATION_TYPE
} from '@client/components/interface/ToastNotification'
import { CompletenessReport } from './CompletenessReport'
import { RegistrationsReport } from './RegistrationsReport'
import { GQLTotalMetricsResult } from '@opencrvs/gateway/src/graphql/schema'

const Layout = styled.div`
  display: flex;
  gap: 16px;
`
const LayoutLeft = styled.div`
  flex-grow: 1;

  .performance-block {
    &:not(:last-child) {
      margin-bottom: 40px;
    }
  }
`
const LayoutRight = styled.div`
  margin-top: 24px;
  width: 300px;
  display: flex;
  gap: 16px;
  flex-direction: column;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    position: absolute;
    display: none;
  }
`

const Stats = styled(Box)`
  width: 100%;
  height: auto;
`
const H4 = styled.div`
  ${({ theme }) => theme.fonts.h4}
  color: ${({ theme }) => theme.colors.copy};
`
const RegistrationStatus = styled(Box)`
  width: 100%;
  height: auto;
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
interface IDispatchProps {
  goToPerformanceHome: typeof goToPerformanceHome
}

interface State {
  selectedLocation: ISearchLocation
  event: Event
  timeStart: Date
  timeEnd: Date
}

type Props = WrappedComponentProps &
  RouteComponentProps & { userDetails: IUserDetails | null } & IConnectProps &
  IDispatchProps & { theme: ITheme }

const selectLocation = (
  locationId: string,
  searchableLocations: ISearchLocation[]
) => {
  return searchableLocations.find(
    ({ id }) => id === locationId
  ) as ISearchLocation
}
class PerformanceHomeComponent extends React.Component<Props, State> {
  static transformPropsToState(props: Props, state?: State) {
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
      generateLocations({ ...locations, ...offices }, props.intl)
    )

    return {
      selectedLocation,
      timeStart:
        (timeStart && new Date(timeStart)) || subYears(new Date(Date.now()), 1),
      timeEnd: (timeEnd && new Date(timeEnd)) || new Date(Date.now()),
      event: event || Event.BIRTH
    }
  }

  constructor(props: Props) {
    super(props)
    window.__localeId__ = this.props.intl.locale

    this.state = PerformanceHomeComponent.transformPropsToState(
      props,
      undefined
    )
  }

  getTabContent = (intl: IntlShape, selectedLocation: ISearchLocation) => {
    const { id: locationId } = selectedLocation || {}
    return (
      <PerformanceActions>
        <LocationPicker
          selectedLocationId={locationId}
          onChangeLocation={(newLocationId) => {
            const newLocation = selectLocation(
              newLocationId,
              generateLocations(
                { ...this.props.locations, ...this.props.offices },
                this.props.intl
              )
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

  render() {
    const { intl, userDetails } = this.props
    const { timeStart, timeEnd, event } = this.state
    const queryVariablesWithoutLocationId = {
      timeStart: timeStart.toISOString(),
      timeEnd: timeEnd.toISOString(),
      event: event.toUpperCase()
    }
    return (
      <SysAdminContentWrapper
        id="performanceHome"
        isCertificatesConfigPage={true}
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
              filterContent={this.getTabContent(
                intl,
                this.state.selectedLocation
              )}
            >
              <Query
                query={PERFORMANCE_METRICS}
                variables={
                  this.state.selectedLocation
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
                      />
                      <RegistrationsReport
                        data={data!.getTotalMetrics}
                        selectedEvent={event.toUpperCase() as 'BIRTH' | 'DEATH'}
                      />
                    </>
                  )
                }}
              </Query>
            </Content>
          </LayoutLeft>
          <LayoutRight>
            <Stats>
              <H4>Stats</H4>
            </Stats>
            <RegistrationStatus>
              <H4>Registration by status</H4>
            </RegistrationStatus>
          </LayoutRight>
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
  goToPerformanceHome
})(withTheme(injectIntl(PerformanceHomeComponent)))
