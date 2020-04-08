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
import { Activity } from '@opencrvs/components/lib/icons'
import { buttonMessages } from '@client/i18n/messages'
import { PerformanceSelect } from '@client/views/Performance/PerformanceSelect'
import { goToPerformanceHome } from '@client/navigation'
import { messages } from '@client/i18n/messages/views/performance'
import { Query } from '@client/components/Query'
import {
  APPLICATIONS_STARTED_METRICS,
  EVENT_ESTIMATION_METRICS
} from './metricsQuery'
import { ApolloError } from 'apollo-client'
import {
  GQLApplicationsStartedMetrics,
  GQLEventEstimationMetrics
} from '@opencrvs/gateway/src/graphql/schema'
import moment from 'moment'
import {
  Reports,
  ReportHeader,
  SubHeader,
  Description
} from '@opencrvs/client/src/views/Performance/utils'

interface IDispatchProps {
  goToPerformanceHome: typeof goToPerformanceHome
}

interface IMetricsQueryResult {
  getEventEstimationMetrics: GQLEventEstimationMetrics
  getApplicationsStartedMetrics: GQLApplicationsStartedMetrics
}
export enum PERFORMANCE_TYPE {
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

const Report = styled.div<{
  total?: boolean
}>`
  ${({ total, theme }) =>
    total ? `background: ${theme.colors.background}; border-radius: 2px;` : ''}
  width: 25%;
  height: 109px;
  padding: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
    margin-bottom: 24px;
  }
`

const KeyNumber = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h2Style};
  position: relative;
  width: 100%;
  height: 100%;
`

const KeyPercentage = styled.div`
  color: ${({ theme }) => theme.colors.placeholder};
  ${({ theme }) => theme.fonts.bodyStyle};
  margin: 16px 0px;
  position: absolute;
  top: 6px;
  left: 28px;
`

const PerformanceLink = styled(LinkButton)`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`

const ReportTitle = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyBoldStyle};
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
          state: { selectedLocation }
        }
      }
    } = this.props

    const { displayLabel: title, id: locationId } = selectedLocation
    const timeEnd = new Date()
    const timeStart = new Date(timeEnd.getTime())
    timeStart.setFullYear(timeStart.getFullYear() - 1)
    moment.locale(this.props.intl.locale)

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
              id="operational-select"
              value={PERFORMANCE_TYPE.OPERATIONAL}
              options={[
                {
                  label: intl.formatMessage(messages.operational),
                  value: PERFORMANCE_TYPE.OPERATIONAL
                },
                {
                  label: intl.formatMessage(messages.reports),
                  value: PERFORMANCE_TYPE.REPORTS
                }
              ]}
            />
          </div>
          <TertiaryButton align={ICON_ALIGNMENT.LEFT} icon={() => <Activity />}>
            {intl.formatMessage(buttonMessages.status)}
          </TertiaryButton>
        </ActionContainer>
        <Query
          query={EVENT_ESTIMATION_METRICS}
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
            // Report components might be added here
            return <div />
          }}
        </Query>
        <Query
          query={APPLICATIONS_STARTED_METRICS}
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
            if (error) {
              return <div>{JSON.stringify(error.networkError)}</div>
            } else {
              return (
                <>
                  <ReportHeader>
                    <SubHeader>
                      {intl.formatMessage(messages.applicationsStartedTitle)}
                    </SubHeader>
                    <Description>
                      {intl.formatMessage(
                        messages.applicationsStartedDescription
                      )}
                      {moment(timeStart).format('MMMM YYYY')} -{' '}
                      {moment(timeEnd).format('MMMM YYYY')}
                    </Description>
                  </ReportHeader>
                  <Reports>
                    <Report total={true}>
                      <ReportTitle>
                        {intl.formatMessage(messages.applicationsStartedTotal)}
                      </ReportTitle>
                      <KeyNumber>
                        {(data &&
                          (data.getApplicationsStartedMetrics &&
                            intl.formatNumber(
                              this.getTotal(data.getApplicationsStartedMetrics)
                            ))) ||
                          0}
                      </KeyNumber>
                    </Report>
                    <Report>
                      <PerformanceLink>
                        {intl.formatMessage(
                          messages.applicationsStartedFieldAgents
                        )}
                      </PerformanceLink>
                      <KeyNumber>
                        {intl.formatNumber(
                          (data &&
                            (data.getApplicationsStartedMetrics &&
                              data.getApplicationsStartedMetrics
                                .fieldAgentApplications)) ||
                            0
                        )}

                        <KeyPercentage>
                          (
                          {data &&
                            (data.getApplicationsStartedMetrics &&
                              intl.formatNumber(
                                this.getPercentage(
                                  data.getApplicationsStartedMetrics,
                                  data.getApplicationsStartedMetrics
                                    .fieldAgentApplications
                                )
                              ))}
                          %)
                        </KeyPercentage>
                      </KeyNumber>
                    </Report>
                    <Report>
                      <ReportTitle>
                        {intl.formatMessage(
                          messages.applicationsStartedHospitals
                        )}
                      </ReportTitle>
                      <KeyNumber>
                        {intl.formatNumber(
                          (data &&
                            (data.getApplicationsStartedMetrics &&
                              data.getApplicationsStartedMetrics
                                .hospitalApplications)) ||
                            0
                        )}

                        <KeyPercentage>
                          (
                          {data &&
                            (data.getApplicationsStartedMetrics &&
                              intl.formatNumber(
                                this.getPercentage(
                                  data.getApplicationsStartedMetrics,
                                  data.getApplicationsStartedMetrics
                                    .hospitalApplications
                                )
                              ))}
                          %)
                        </KeyPercentage>
                      </KeyNumber>
                    </Report>
                    <Report>
                      <ReportTitle>
                        {intl.formatMessage(
                          messages.applicationsStartedOffices
                        )}
                      </ReportTitle>
                      <KeyNumber>
                        {intl.formatNumber(
                          (data &&
                            (data.getApplicationsStartedMetrics &&
                              data.getApplicationsStartedMetrics
                                .officeApplications)) ||
                            0
                        )}

                        <KeyPercentage>
                          (
                          {data &&
                            (data.getApplicationsStartedMetrics &&
                              intl.formatNumber(
                                this.getPercentage(
                                  data.getApplicationsStartedMetrics,
                                  data.getApplicationsStartedMetrics
                                    .officeApplications
                                )
                              ))}
                          %)
                        </KeyPercentage>
                      </KeyNumber>
                    </Report>
                  </Reports>
                </>
              )
            }
          }}
        </Query>
      </PerformanceContentWrapper>
    )
  }
}

export const OperationalReport = connect(
  null,
  { goToPerformanceHome }
)(injectIntl(OperationalReportComponent))
