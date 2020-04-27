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
import styled from '@client/styledComponents'
import {
  LinkButton,
  TertiaryButton,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import { Activity, ArrowDownBlue } from '@opencrvs/components/lib/icons'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { PerformanceSelect } from '@client/views/Performance/PerformanceSelect'
import {
  goToPerformanceHome,
  goToOperationalReport,
  goToPerformanceReport
} from '@client/navigation'
import { messages } from '@client/i18n/messages/views/performance'
import { Query } from '@client/components/Query'
import { OPERATIONAL_REPORTS_METRICS } from './metricsQuery'
import { ApolloError } from 'apollo-client'
import {
  GQLEventEstimationMetrics,
  GQLApplicationsStartedMetrics
} from '@opencrvs/gateway/src/graphql/schema'
import { RegistrationRatesReport } from './reports/operational/RegistrationRatesReport'
import { ApplicationsStartedReport } from './reports/operational/ApplicationsStartedReport'
import moment from 'moment'
import { ListTable } from '@opencrvs/components/lib/interface'
import { Event } from '@client/forms'
import {
  PERFORMANCE_REPORT_TYPE_MONTHLY,
  MONTHS_IN_YEAR
} from '@client/utils/constants'
import { getMonthDateRange } from '@client/views/Performance/utils'

interface IDispatchProps {
  goToPerformanceHome: typeof goToPerformanceHome
  goToOperationalReport: typeof goToOperationalReport
  goToPerformanceReport: typeof goToPerformanceReport
}

interface IMetricsQueryResult {
  getEventEstimationMetrics: GQLEventEstimationMetrics
  getApplicationsStartedMetrics: GQLApplicationsStartedMetrics
}
export enum OPERATIONAL_REPORT_SECTION {
  OPERATIONAL = 'OPERATIONAL',
  REPORTS = 'REPORTS'
}

type Props = WrappedComponentProps &
  Pick<RouteComponentProps, 'history'> &
  IDispatchProps

interface State {}

const Header = styled.h1`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h2Style};
`

const HeaderContainer = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;

  & > :first-child {
    margin-right: 24px;
  }

  & > :nth-child(2) {
    position: relative;
    bottom: 2px;
  }
`

const ActionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  margin: 0 -40px 0 -40px;
  padding: 0 40px 16px 40px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dividerDark};
`

const MonthlyReportsList = styled.div`
  margin-top: 16px;
`

class OperationalReportComponent extends React.Component<Props, State> {
  onChangeLocation = () => {
    this.props.goToPerformanceHome({
      selectedLocation: this.props.history.location.state.selectedLocation
    })
  }

  getTotal(applicationMetrics: GQLApplicationsStartedMetrics): number {
    return (
      applicationMetrics.fieldAgentApplications +
      applicationMetrics.hospitalApplications +
      applicationMetrics.officeApplications
    )
  }

  getContent(eventType: Event) {
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
                this.props.history.location.state.selectedLocation!,
                PERFORMANCE_REPORT_TYPE_MONTHLY,
                eventType,
                start.toDate(),
                end.toDate()
              )
            }
            disabled={!this.props.history.location.state.selectedLocation}
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

  getPercentage(
    totalMetrics: GQLApplicationsStartedMetrics,
    value: number
  ): number {
    return Math.round((value / this.getTotal(totalMetrics)) * 100)
  }

  render() {
    const {
      intl,
      history: {
        location: {
          state: { selectedLocation, sectionId }
        }
      }
    } = this.props

    const { displayLabel: title, id: locationId } = selectedLocation
    moment.locale(this.props.intl.locale)
    moment.defaultFormat = 'MMMM YYYY'
    const timeEnd = moment()
    const timeStart = moment().subtract(1, 'years')

    return (
      <PerformanceContentWrapper hideTopBar>
        <HeaderContainer>
          <Header id="header-location-name">{title}</Header>
          <LinkButton id="change-location-link" onClick={this.onChangeLocation}>
            {intl.formatMessage(buttonMessages.change)}
          </LinkButton>
        </HeaderContainer>
        <ActionContainer>
          <div>
            <PerformanceSelect
              onChange={(selectedValue: string) =>
                this.props.goToOperationalReport(
                  selectedLocation,
                  selectedValue as OPERATIONAL_REPORT_SECTION
                )
              }
              id="operational-select"
              value={OPERATIONAL_REPORT_SECTION.OPERATIONAL}
              options={[
                {
                  label: intl.formatMessage(messages.operational),
                  value: OPERATIONAL_REPORT_SECTION.OPERATIONAL
                },
                {
                  label: intl.formatMessage(messages.reports),
                  value: OPERATIONAL_REPORT_SECTION.REPORTS
                }
              ]}
            />
          </div>
          <TertiaryButton align={ICON_ALIGNMENT.LEFT} icon={() => <Activity />}>
            {intl.formatMessage(buttonMessages.status)}
          </TertiaryButton>
        </ActionContainer>
        {sectionId === OPERATIONAL_REPORT_SECTION.OPERATIONAL && (
          <Query
            query={OPERATIONAL_REPORTS_METRICS}
            variables={{
              timeStart: timeStart.toISOString(),
              timeEnd: timeEnd.toISOString(),
              locationId
            }}
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
              return (
                <>
                  <RegistrationRatesReport
                    loading={loading}
                    data={data && data.getEventEstimationMetrics}
                    reportTimeFrom={timeStart.format()}
                    reportTimeTo={timeEnd.format()}
                  />

                  <ApplicationsStartedReport
                    loading={loading}
                    data={data && data.getApplicationsStartedMetrics}
                    reportTimeFrom={timeStart.format()}
                    reportTimeTo={timeEnd.format()}
                  />
                </>
              )
            }}
          </Query>
        )}
        {sectionId === OPERATIONAL_REPORT_SECTION.REPORTS && (
          <MonthlyReportsList>
            <ListTable
              tableTitle={intl.formatMessage(constantsMessages.birth)}
              isLoading={false}
              content={this.getContent(Event.BIRTH)}
              tableHeight={280}
              pageSize={MONTHS_IN_YEAR}
              hideBoxShadow={true}
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
              content={this.getContent(Event.DEATH)}
              tableHeight={280}
              pageSize={MONTHS_IN_YEAR}
              hideBoxShadow={true}
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
          </MonthlyReportsList>
        )}
      </PerformanceContentWrapper>
    )
  }
}

export const OperationalReport = connect(
  null,
  { goToPerformanceHome, goToOperationalReport, goToPerformanceReport }
)(injectIntl(OperationalReportComponent))
