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
import { dynamicConstantsMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/performance'
import { IStoreState } from '@client/store'
import {
  Description,
  SubHeader
} from '@opencrvs/client/src/views/Performance/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { GQLEventEstimationMetrics } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'

const ReportHeader = styled.div`
  margin: 24px 0px;
`

const Reports = styled.div`
  display: flex;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column;
  }
`
const Report = styled.div`
  width: 50%;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
    margin-bottom: 24px;
  }
`

const KeyNumber = styled.div`
  color: ${({ theme }) => theme.colors.menuBackground};
  ${({ theme }) => theme.fonts.h4Style};
  margin: 16px 0px;
`
const KeyNumberDescription = styled.div`
  color: ${({ theme }) => theme.colors.placeholder};
  ${({ theme }) => theme.fonts.bodyStyle};
  margin: 16px 0px;
`

const Pair = styled.div`
  flex-direction: row;
  flex-wrap: no-wrap;
`
const Label = styled.span`
  color: ${({ theme }) => theme.colors.placeholder};
  ${({ theme }) => theme.fonts.bodyStyle};
`
const Value = styled.span`
  color: ${({ theme }) => theme.colors.placeholder};
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`

type Props = WrappedComponentProps & BaseProps

interface BaseProps {
  data?: GQLEventEstimationMetrics
  loading?: boolean
  reportTimeFrom: string
  reportTimeTo: string
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
  getReport(data: GQLEventEstimationMetrics) {
    const { intl, reportTimeFrom, reportTimeTo } = this.props
    const { birth45DayMetrics, death45DayMetrics } = data
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

        <Reports>
          <Report>
            <LinkButton>
              {intl.formatMessage(messages.birthRegistrationRatesReportHeader)}
            </LinkButton>
            <KeyNumber>{`${(birth45DayMetrics &&
              birth45DayMetrics.estimatedPercentage) ||
              0}%`}</KeyNumber>
            <KeyNumberDescription>
              {intl.formatMessage(messages.registrationRatesReportDescription, {
                totalRegistrationNumber:
                  (birth45DayMetrics && birth45DayMetrics.actualRegistration) ||
                  0,
                estimatedRegistrationNumber:
                  (birth45DayMetrics &&
                    birth45DayMetrics.estimatedRegistration) ||
                  0
              })}
            </KeyNumberDescription>
            {this.getLabelValuePair(
              intl.formatMessage(dynamicConstantsMessages.male),
              `${(birth45DayMetrics && birth45DayMetrics.malePercentage) || 0}%`
            )}
            {this.getLabelValuePair(
              intl.formatMessage(dynamicConstantsMessages.female),
              `${(birth45DayMetrics && birth45DayMetrics.femalePercentage) ||
                0}%`
            )}
          </Report>
          <Report>
            <LinkButton>
              {intl.formatMessage(messages.deathRegistrationRatesReportHeader)}
            </LinkButton>
            <KeyNumber>{`${(death45DayMetrics &&
              death45DayMetrics.estimatedPercentage) ||
              0}%`}</KeyNumber>
            <KeyNumberDescription>
              {intl.formatMessage(messages.registrationRatesReportDescription, {
                totalRegistrationNumber:
                  (death45DayMetrics && death45DayMetrics.actualRegistration) ||
                  0,
                estimatedRegistrationNumber:
                  (death45DayMetrics &&
                    death45DayMetrics.estimatedRegistration) ||
                  0
              })}
            </KeyNumberDescription>
            {this.getLabelValuePair(
              intl.formatMessage(dynamicConstantsMessages.male),
              `${(death45DayMetrics && death45DayMetrics.malePercentage) || 0}%`
            )}
            {this.getLabelValuePair(
              intl.formatMessage(dynamicConstantsMessages.female),
              `${(death45DayMetrics && death45DayMetrics.femalePercentage) ||
                0}%`
            )}
          </Report>
        </Reports>
      </>
    )
  }

  render() {
    const { data } = this.props
    return <>{data && this.getReport(data)}</>
  }
}

export const RegistrationRatesReport = injectIntl(
  RegistrationRatesReportComponent
)
