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
import { goToOperationalReport } from '@client/navigation'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { generateLocations } from '@client/utils/locationUtils'
import { OPERATIONAL_REPORT_SECTION } from '@client/views/Performance/OperationalReport'
import { PerformanceContentWrapper } from '@client/views/Performance/PerformanceContentWrapper'
import { Header } from '@client/views/Performance/utils'
import {
  ISearchLocation,
  LocationSearch
} from '@opencrvs/components/lib/interface'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'

interface BaseProps {
  goToOperationalReport: typeof goToOperationalReport
}

type Props = BaseProps &
  WrappedComponentProps &
  Pick<RouteComponentProps, 'history'> & {
    offlineResources: IOfflineData
  }

interface State {
  selectedLocation: ISearchLocation | undefined
}

class TeamSearchComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedLocation:
        (props.history.location.state &&
          props.history.location.state.selectedLocation) ||
        undefined
    }
  }

  searchHandler = (item: ISearchLocation) => {
    this.setState({
      selectedLocation: item
    })
  }

  searchButtonHandler = () => {
    this.state.selectedLocation &&
      this.props.goToOperationalReport(
        this.state.selectedLocation.id,
        OPERATIONAL_REPORT_SECTION.OPERATIONAL
      )
  }

  render() {
    const { intl, offlineResources } = this.props

    return (
      <PerformanceContentWrapper hideTopBar>
        <Header>{intl.formatMessage(messages.sysAdminTeamHomeHeader)}</Header>

        <LocationSearch
          selectedLocation={this.state.selectedLocation}
          locationList={generateLocations(offlineResources.locations)}
          searchHandler={this.searchHandler}
          searchButtonHandler={this.searchButtonHandler}
        />
      </PerformanceContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineResources: getOfflineData(state)
  }
}

export const TeamSearch = connect(
  mapStateToProps,
  {
    goToOperationalReport
  }
)(injectIntl(TeamSearchComponent))
