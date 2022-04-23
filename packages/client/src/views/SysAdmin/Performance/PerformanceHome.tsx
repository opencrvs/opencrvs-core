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
import { Box, ISearchLocation } from '@opencrvs/components/lib/interface'
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
import { constantsMessages } from '@client/i18n/messages/constants'

const Layout = styled.div`
  display: flex;
  gap: 16px;
`
const LayoutLeft = styled.div`
  flex-grow: 1;
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
  padding-bottom: 16px;
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

const NATIONAL_ADMINISTRATIVE_LEVEL = 'NATIONAL_ADMINISTRATIVE_LEVEL'
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
        this.getAdditionalLocations()
      )
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

    this.state = this.transformPropsToState(props)
  }

  getAdditionalLocations() {
    const { intl } = this.props
    return [
      {
        id: NATIONAL_ADMINISTRATIVE_LEVEL,
        searchableText: intl.formatMessage(constantsMessages.countryName),
        displayLabel: intl.formatMessage(constantsMessages.countryName)
      }
    ]
  }

  getTabContent = (intl: IntlShape, selectedLocation: ISearchLocation) => {
    const { id: locationId } = selectedLocation || {}

    return (
      <PerformanceActions>
        <LocationPicker
          additionalLocations={this.getAdditionalLocations()}
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
              ).concat(this.getAdditionalLocations())
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
    const { intl } = this.props

    return (
      <SysAdminContentWrapper
        id="performanceHome"
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
              tabBarContent={this.getTabContent(
                intl,
                this.state.selectedLocation
              )}
              noTabBarBorder={true}
            ></Content>
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
