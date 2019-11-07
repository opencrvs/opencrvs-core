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
import { messages } from '@register/i18n/messages/views/performance'
import { goToPerformanceReport } from '@register/navigation'
import { Header } from '@register/views/Performance/utils'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'

interface ReportProps {
  goToPerformanceReport: typeof goToPerformanceReport
}

type Props = ReportProps & WrappedComponentProps

type State = {}

class WeeklyReportsComponent extends React.Component<Props, State> {
  render() {
    const { intl } = this.props

    return (
      <Header>{intl.formatMessage(messages.weeklyReportsBodyHeader)}</Header>
    )
  }
}

export const WeeklyReports = connect(
  null,
  {
    goToPerformanceReport
  }
)(injectIntl(WeeklyReportsComponent))
