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
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { PerformanceContentWrapper } from './PerformanceContentWrapper'
import { MonthlyReports } from './MonthlyReports'

type Props = WrappedComponentProps & RouteComponentProps
type State = {}

class ReportListComponent extends React.Component<Props, State> {
  render() {
    const { history } = this.props

    return (
      <PerformanceContentWrapper>
        <MonthlyReports history={history} />
      </PerformanceContentWrapper>
    )
  }
}

function mapStateToProps(state: State, props: RouteComponentProps) {
  const { history } = props

  return {
    history
  }
}

export const ReportList = connect(mapStateToProps)(
  injectIntl(ReportListComponent)
)
