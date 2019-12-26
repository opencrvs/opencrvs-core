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
import moment from 'moment'
import * as React from 'react'
import { connect } from 'react-redux'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { ArrowDownBlue } from '@opencrvs/components/lib/icons'
import { ListTable } from '@opencrvs/components/lib/interface'
import { constantsMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/performance'
import { goToPerformanceReport } from '@client/navigation'
import { PERFORMANCE_REPORT_TYPE_MONTHLY } from '@client/utils/constants'
import { Header, getMonthDateRange } from '@client/views/Performance/utils'
import { getToken } from '@client/utils/authUtils'
import styled from '@client/styledComponents'

interface ReportProps {
  goToPerformanceReport: typeof goToPerformanceReport
}

const Actions = styled.div`
  padding: 1em 0;
`

function downloadAllData() {
  fetch(window.config.API_GATEWAY_URL + 'metrics/export', {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })
    .then(resp => resp.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'export.zip'
      a.click()
      window.URL.revokeObjectURL(url)
    })
}

type Props = ReportProps & WrappedComponentProps

type State = {}

class MonthlyReportsComponent extends React.Component<Props, State> {
  getContent() {
    moment.locale(this.props.intl.locale)
    let content = []

    const currentYear = moment().year()
    let currentMonth = 1

    while (currentMonth <= 12) {
      const { start, end } = getMonthDateRange(currentYear, currentMonth)
      const title = start.format('MMMM YYYY')
      content.push({
        month: (
          <LinkButton
            onClick={() =>
              this.props.goToPerformanceReport(
                PERFORMANCE_REPORT_TYPE_MONTHLY,
                start.toDate(),
                end.toDate()
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
      currentMonth++
    }
    return content
  }

  render() {
    const { intl } = this.props

    return (
      <>
        <Header>{intl.formatMessage(messages.monthlyReportsBodyHeader)}</Header>

        <ListTable
          tableTitle={intl.formatMessage(constantsMessages.birth)}
          isLoading={false}
          content={this.getContent()}
          tableHeight={280}
          columns={[
            {
              label: intl.formatMessage(constantsMessages.month),
              width: 70,
              key: 'month',
              isSortable: true,
              icon: <ArrowDownBlue />,
              sortFunction: () => {}
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
          tableHeight={280}
          columns={[
            {
              label: intl.formatMessage(constantsMessages.month),
              width: 70,
              key: 'month',
              isSortable: true,
              icon: <ArrowDownBlue />,
              sortFunction: () => {}
            },
            {
              label: intl.formatMessage(constantsMessages.export),
              width: 30,
              key: 'export'
            }
          ]}
          noResultText={intl.formatMessage(constantsMessages.noResults)}
        />
        <Actions>
          <LinkButton onClick={downloadAllData} id="export-all-button">
            {intl.formatMessage(messages.exportAll)}
          </LinkButton>
        </Actions>
      </>
    )
  }
}

export const MonthlyReports = connect(
  null,
  {
    goToPerformanceReport
  }
)(injectIntl(MonthlyReportsComponent))
