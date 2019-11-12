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
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import { ListTable } from '@opencrvs/components/lib/interface'
import { constantsMessages } from '@register/i18n/messages'
import { messages } from '@register/i18n/messages/views/performance'
import { goToPerformanceReport } from '@register/navigation'
import { PERFORMANCE_REPORT_TYPE_WEEKY } from '@register/utils/constants'
import { Header } from '@register/views/Performance/utils'
import moment from 'moment'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'

interface ReportProps {
  goToPerformanceReport: typeof goToPerformanceReport
}

type Props = ReportProps & WrappedComponentProps

type State = {}

class WeeklyReportsComponent extends React.Component<Props, State> {
  getContent() {
    moment.locale(this.props.intl.locale)
    let content = []

    const startDayOfYear = moment([2019, 0]).startOf('month')
    const endDayOfYear = moment([2019, 11]).endOf('month')

    while (startDayOfYear < endDayOfYear) {
      const title = `${startDayOfYear.format(
        'DD MMMM'
      )} ${this.props.intl.formatMessage(
        constantsMessages.to
      )} ${startDayOfYear.add(7, 'days').format('DD MMMM YYYY')}`
      content.push({
        week: (
          <LinkButton
            onClick={() =>
              this.props.goToPerformanceReport(
                PERFORMANCE_REPORT_TYPE_WEEKY,
                title
              )
            }
          >
            {title}
          </LinkButton>
        ),
        export: (
          <>
            <LinkButton>CSV</LinkButton> <LinkButton>PDF</LinkButton>
          </>
        )
      })
    }
    return content
  }

  render() {
    const { intl } = this.props

    return (
      <>
        <Header>{intl.formatMessage(messages.weeklyReportsBodyHeader)}</Header>

        <ListTable
          tableTitle={intl.formatMessage(constantsMessages.birth)}
          isLoading={false}
          content={this.getContent()}
          columns={[
            {
              label: intl.formatMessage(constantsMessages.week),
              width: 70,
              key: 'week',
              isSortable: true,
              icon: <ArrowDownBlue />,
              sortFunction: () => console.log('sorted')
            },
            {
              label: intl.formatMessage(constantsMessages.export),
              width: 30,
              key: 'export'
            }
          ]}
          noResultText={intl.formatMessage(constantsMessages.noResults)}
        />

        <ListTable
          tableTitle={intl.formatMessage(constantsMessages.death)}
          isLoading={false}
          content={this.getContent()}
          columns={[
            {
              label: intl.formatMessage(constantsMessages.week),
              width: 70,
              key: 'week',
              isSortable: true,
              icon: <ArrowDownBlue />,
              sortFunction: () => console.log('sorted')
            },
            {
              label: intl.formatMessage(constantsMessages.export),
              width: 30,
              key: 'export'
            }
          ]}
          noResultText={intl.formatMessage(constantsMessages.noResults)}
        />
      </>
    )
  }
}

export const WeeklyReports = connect(
  null,
  {
    goToPerformanceReport
  }
)(injectIntl(WeeklyReportsComponent))
