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
import { PERFORMANCE_REPORT_TYPE_WEEKY } from '@register/utils/constants'
import { Header } from '@register/views/Performance/utils'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { PerformanceContentWrapper } from './PerformanceContentWrapper'

interface ReportProps {
  title: string
  reportType: string
}

type Props = ReportProps &
  WrappedComponentProps &
  RouteComponentProps<{}, {}, { reportType: string; title: string }>

type State = {}

class ReportComponent extends React.Component<Props, State> {
  render() {
    const { reportType, title } = this.props
    return (
      <PerformanceContentWrapper tabId={reportType}>
        <Header>{title}</Header>
      </PerformanceContentWrapper>
    )
  }
}

function mapStateToProps(state: State, props: Props) {
  return {
    reportType:
      (props.location.state && props.location.state.reportType) ||
      PERFORMANCE_REPORT_TYPE_WEEKY,
    title: (props.location.state && props.location.state.title) || ''
  }
}

export const Report = connect(mapStateToProps)(injectIntl(ReportComponent))
