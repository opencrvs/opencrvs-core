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
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { PerformanceContentWrapper } from './PerformanceContentWrapper'
import { WeeklyReports } from './WeeklyReports'

type Props = WrappedComponentProps & { reportType: string }

type State = {}

class ReportListComponent extends React.Component<Props, State> {
  render() {
    const { reportType } = this.props

    return (
      <PerformanceContentWrapper tabId={reportType}>
        {reportType === PERFORMANCE_REPORT_TYPE_WEEKY && <WeeklyReports />}
      </PerformanceContentWrapper>
    )
  }
}

function mapStateToProps(
  state: State,
  props: RouteComponentProps<{ reportType: string }>
) {
  const { match } = props

  return {
    reportType: match.params.reportType || PERFORMANCE_REPORT_TYPE_WEEKY
  }
}

export const ReportList = connect(mapStateToProps)(
  injectIntl(ReportListComponent)
)
