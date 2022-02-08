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
import { Event } from '@client/forms'
import { dynamicConstantsMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/performance'
import {
  Description,
  SubHeader
} from '@opencrvs/client/src/views/SysAdmin/Performance/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { GQLEventEstimationMetrics } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import styled from 'styled-components'

const ReportHeader = styled.div`
  margin: 32px 0px;
`

const Report = styled.div`
  width: 50%;

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
  color: ${({ theme }) => theme.colors.menuBackground};
  ${({ theme }) => theme.fonts.h2Style};
  margin: 0px 0px -16px 0px;
`
const KeyNumberDescription = styled.div`
  color: ${({ theme }) => theme.colors.menuBackground};
  ${({ theme }) => theme.fonts.chartLegendStyle};
  margin: 16px 0px;
`

const Pair = styled.div`
  flex-direction: row;
  flex-wrap: no-wrap;
`
const Label = styled.span`
  color: ${({ theme }) => theme.colors.menuBackground};
  ${({ theme }) => theme.fonts.chartLegendStyle};
`
const Value = styled.span`
  color: ${({ theme }) => theme.colors.menuBackground};
  ${({ theme }) => theme.fonts.subtitleStyle};
`

export const LoaderBox = styled.span<{
  width?: number
}>`
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  height: 24px;
  width: ${({ width }) => (width ? `${width}%` : '100%')};
`

type Props = WrappedComponentProps & BaseProps

interface BaseProps {
  data?: GQLEventEstimationMetrics
  loading?: boolean
  reportTimeFrom?: string
  reportTimeTo?: string
  onClickEventDetails?: (event: Event, title: string) => void
}

interface States {}

class RegistrationRatesReportComponent extends React.Component<Props, States> {
  getLabelValuePair(label: string, value: string) {
    return (
      <Pair>
        <Label>{label}: </Label>
        <Value>{value}</Value>
      </Pair>
    )
  }

  getLoader() {
    const { intl } = this.props
    return (
      <>
        <ReportHeader>
          <SubHeader>
            {intl.formatMessage(messages.registrationRatesReportHeader)}
          </SubHeader>
          <LoaderBox width={60} />
        </ReportHeader>

        <Reports id="registration-rates-reports-loader">
          <Report>
            <LoaderBox width={40} />
            <KeyNumber>
              <LoaderBox width={10} />
            </KeyNumber>
            <KeyNumberDescription>
              <LoaderBox width={50} />
            </KeyNumberDescription>
            <LoaderBox width={20} />
            <br />
            <LoaderBox width={20} />
          </Report>
          <Report>
            <LoaderBox width={40} />
            <KeyNumber>
              <LoaderBox width={10} />
            </KeyNumber>
            <KeyNumberDescription>
              <LoaderBox width={50} />
            </KeyNumberDescription>
            <LoaderBox width={20} />
            <br />
            <LoaderBox width={20} />
          </Report>
        </Reports>
      </>
    )
  }

  getReport(data: GQLEventEstimationMetrics) {
    const { intl, reportTimeFrom, reportTimeTo, onClickEventDetails } =
      this.props
    const { birthTargetDayMetrics, deathTargetDayMetrics } = data
    const birthReportHeader = intl.formatMessage(
      messages.birthRegistrationRatesReportHeader,
      {
        birthRegistrationTarget: window.config.BIRTH_REGISTRATION_TARGET
      }
    )
    const deathReportHeader = intl.formatMessage(
      messages.deathRegistrationRatesReportHeader,
      {
        deathRegistrationTarget: window.config.DEATH_REGISTRATION_TARGET
      }
    )
    return (
      <>
        <ReportHeader>
          <SubHeader>
            {intl.formatMessage(messages.registrationRatesReportHeader)}
          </SubHeader>
          <Description>
            {intl.formatMessage(messages.registrationRatesReportSubHeader, {
              startTime: reportTimeFrom,
              endTime: reportTimeTo
            })}
          </Description>
        </ReportHeader>

        <Reports id="registration-rates-reports">
          <Report>
            <LinkButton
              id="birth-registration-detalis-link"
              onClick={() =>
                onClickEventDetails!(Event.BIRTH, birthReportHeader)
              }
            >
              {birthReportHeader}
            </LinkButton>
            <KeyNumber>
              {`${
                (birthTargetDayMetrics &&
                  birthTargetDayMetrics.estimatedPercentage) ||
                0
              }%`}
            </KeyNumber>
            <KeyNumberDescription>
              {intl.formatMessage(messages.registrationRatesReportDescription, {
                totalRegistrationNumber:
                  (birthTargetDayMetrics &&
                    birthTargetDayMetrics.actualRegistration) ||
                  0,
                estimatedRegistrationNumber:
                  (birthTargetDayMetrics &&
                    birthTargetDayMetrics.estimatedRegistration) ||
                  0,
                registrationTarget: window.config.BIRTH_REGISTRATION_TARGET
              })}
            </KeyNumberDescription>
            {this.getLabelValuePair(
              intl.formatMessage(dynamicConstantsMessages.male),
              `${
                (birthTargetDayMetrics &&
                  birthTargetDayMetrics.malePercentage) ||
                0
              }%`
            )}
            {this.getLabelValuePair(
              intl.formatMessage(dynamicConstantsMessages.female),
              `${
                (birthTargetDayMetrics &&
                  birthTargetDayMetrics.femalePercentage) ||
                0
              }%`
            )}
          </Report>
          <Report>
            <LinkButton
              id="death-registration-detalis-link"
              onClick={() =>
                onClickEventDetails!(Event.DEATH, deathReportHeader)
              }
            >
              {deathReportHeader}
            </LinkButton>
            <KeyNumber>
              {`${
                (deathTargetDayMetrics &&
                  deathTargetDayMetrics.estimatedPercentage) ||
                0
              }%`}
            </KeyNumber>
            <KeyNumberDescription>
              {intl.formatMessage(messages.registrationRatesReportDescription, {
                totalRegistrationNumber:
                  (deathTargetDayMetrics &&
                    deathTargetDayMetrics.actualRegistration) ||
                  0,
                estimatedRegistrationNumber:
                  (deathTargetDayMetrics &&
                    deathTargetDayMetrics.estimatedRegistration) ||
                  0,
                registrationTarget: window.config.DEATH_REGISTRATION_TARGET
              })}
            </KeyNumberDescription>
            {this.getLabelValuePair(
              intl.formatMessage(dynamicConstantsMessages.male),
              `${
                (deathTargetDayMetrics &&
                  deathTargetDayMetrics.malePercentage) ||
                0
              }%`
            )}
            {this.getLabelValuePair(
              intl.formatMessage(dynamicConstantsMessages.female),
              `${
                (deathTargetDayMetrics &&
                  deathTargetDayMetrics.femalePercentage) ||
                0
              }%`
            )}
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

export const RegistrationRatesReport = injectIntl(
  RegistrationRatesReportComponent
)
