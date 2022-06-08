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
import { messages } from '@client/i18n/messages/views/performance'
import { messages as messagesSearch } from '@client/i18n/messages/views/search'
import { goToTeamUserList } from '@client/navigation'
import { IOfflineData, ILocation } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { Header } from '@client/views/SysAdmin/Performance/utils'
import {
  ISearchLocation,
  LocationSearch
} from '@opencrvs/components/lib/interface'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import { NoWifi } from '@opencrvs/components/lib/icons'
import { withOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'
import { constantsMessages } from '@client/i18n/messages/constants'

interface BaseProps {
  goToTeamUserList: typeof goToTeamUserList
}

type IOnlineStatusProps = {
  isOnline: boolean
}

type Props = BaseProps &
  WrappedComponentProps &
  IOnlineStatusProps &
  Pick<RouteComponentProps, 'history'> & {
    offlineCountryConfiguration: IOfflineData
  }

interface State {
  selectedLocation: ISearchLocation | undefined
}

const ConnectivityContainer = styled.div`
  justify-content: center;
  gap: 8px;
  display: flex;
  margin-top: 5vh;
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

class TeamSearchComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const historyState = props.history.location.state as any
    this.state = {
      selectedLocation:
        (historyState && historyState.selectedLocation) || undefined
    }
  }

  searchHandler = (item: ISearchLocation) => {
    this.setState({
      selectedLocation: item
    })
  }

  searchButtonHandler = () => {
    this.state.selectedLocation &&
      this.props.goToTeamUserList(this.state.selectedLocation.id)
  }

  render() {
    const { intl, offlineCountryConfiguration, isOnline } = this.props

    return (
      <SysAdminContentWrapper>
        {isOnline ? (
          <>
            <Header>
              {intl.formatMessage(messages.sysAdminTeamHomeHeader)}
            </Header>

            <LocationSearch
              selectedLocation={this.state.selectedLocation}
              locationList={Object.values(
                offlineCountryConfiguration.offices
              ).map((location: ILocation) => {
                return {
                  id: location.id,
                  searchableText: location.name,
                  displayLabel: location.name
                }
              })}
              searchHandler={this.searchHandler}
              searchButtonHandler={this.searchButtonHandler}
              errorMessage={intl.formatMessage(messagesSearch.locationNotFound)}
            />
          </>
        ) : (
          <ConnectivityContainer>
            <NoConnectivity />
            <Text id="no-connection-text">
              {intl.formatMessage(constantsMessages.noConnection)}
            </Text>
          </ConnectivityContainer>
        )}
      </SysAdminContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineCountryConfiguration: getOfflineData(state)
  }
}

export const TeamSearch = connect(mapStateToProps, {
  goToTeamUserList
})(injectIntl(withOnlineStatus(TeamSearchComponent)))
