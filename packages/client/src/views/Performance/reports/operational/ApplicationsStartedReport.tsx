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
import {
  Description,
  SubHeader,
  ReportHeader
} from '@opencrvs/client/src/views/Performance/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { GQLApplicationsStartedMetrics } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import styled from 'styled-components'

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

const Reports = styled.div<{ loading?: boolean }>`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    ${({ loading }) => {
      return loading
        ? `${Report}:nth-child(2) {
          display: none;
        }`
        : `{
          width: 100%;
          margin-bottom: 24px;
        }`
    }}
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

const LoaderBox = styled.span<{
  width?: number
}>`
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  height: 24px;
  width: ${({ width }) => (width ? `${width}%` : '100%')};
`

type Props = WrappedComponentProps & BaseProps

interface BaseProps {
  data?: GQLApplicationsStartedMetrics
  loading?: boolean
  reportTimeFrom?: string
  reportTimeTo?: string
}

interface States {}

class ApplicationsStartedReportComponent extends React.Component<
  Props,
  States
> {
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

  getLoader() {
    const { intl } = this.props
    return (
      <>
        <ReportHeader>
          <SubHeader>
            {intl.formatMessage(messages.applicationsStartedTitle)}
          </SubHeader>
          <LoaderBox width={60} />
        </ReportHeader>

        <Reports id="reports-loader" loading>
          <Report total={true}>
            <ReportTitle>
              <LoaderBox width={40} />
            </ReportTitle>
            <KeyNumber>
              <LoaderBox width={10} />
            </KeyNumber>
          </Report>
          <Report>
            <ReportTitle>
              <LoaderBox width={40} />
            </ReportTitle>
            <KeyNumber>
              <LoaderBox width={10} />
            </KeyNumber>
          </Report>
          <Report>
            <ReportTitle>
              <LoaderBox width={40} />
            </ReportTitle>
            <KeyNumber>
              <LoaderBox width={10} />
            </KeyNumber>
          </Report>
          <Report>
            <ReportTitle>
              <LoaderBox width={40} />
            </ReportTitle>
            <KeyNumber>
              <LoaderBox width={10} />
            </KeyNumber>
          </Report>
        </Reports>
      </>
    )
  }

  getReport(data: GQLApplicationsStartedMetrics) {
    const { intl, reportTimeFrom, reportTimeTo } = this.props
    const {
      fieldAgentApplications,
      hospitalApplications,
      officeApplications
    } = data
    return (
      <>
        <ReportHeader>
          <SubHeader>
            {intl.formatMessage(messages.applicationsStartedTitle)}
          </SubHeader>
          <Description>
            {intl.formatMessage(messages.applicationsStartedDescription)}
            {reportTimeFrom} - {reportTimeTo}
          </Description>
        </ReportHeader>
        <Reports>
          <Report total={true}>
            <ReportTitle>
              {intl.formatMessage(messages.applicationsStartedTotal)}
            </ReportTitle>
            <KeyNumber>{intl.formatNumber(this.getTotal(data))}</KeyNumber>
          </Report>
          <Report>
            <PerformanceLink>
              {intl.formatMessage(messages.applicationsStartedFieldAgents)}
            </PerformanceLink>
            <KeyNumber>
              {intl.formatNumber(fieldAgentApplications)}

              <KeyPercentage>
                (
                {intl.formatNumber(
                  this.getPercentage(data, fieldAgentApplications)
                )}
                %)
              </KeyPercentage>
            </KeyNumber>
          </Report>
          <Report>
            <ReportTitle>
              {intl.formatMessage(messages.applicationsStartedHospitals)}
            </ReportTitle>
            <KeyNumber>
              {intl.formatNumber(hospitalApplications)}

              <KeyPercentage>
                ({intl.formatNumber(hospitalApplications)}
                %)
              </KeyPercentage>
            </KeyNumber>
          </Report>
          <Report>
            <ReportTitle>
              {intl.formatMessage(messages.applicationsStartedOffices)}
            </ReportTitle>
            <KeyNumber>
              {intl.formatNumber(officeApplications)}

              <KeyPercentage>
                (
                {intl.formatNumber(
                  this.getPercentage(data, officeApplications)
                )}
                %)
              </KeyPercentage>
            </KeyNumber>
          </Report>
        </Reports>
      </>
    )
  }

  render() {
    const { data, loading } = this.props
    return (
      <>
        {loading && this.getLoader()}
        {data && this.getReport(data)}
      </>
    )
  }
}

export const ApplicationsStartedReport = injectIntl(
  ApplicationsStartedReportComponent
)
