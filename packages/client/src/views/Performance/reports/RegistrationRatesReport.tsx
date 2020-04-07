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
import {
  Description,
  SubHeader
} from '@opencrvs/client/src/views/Performance/utils'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { GQLEstimationMetrics } from '@opencrvs/gateway/src/graphql/schema'
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
  data?: GQLEstimationMetrics
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
  getReport() {
    return (
      <>
        <ReportHeader>
          <SubHeader>Registration rates</SubHeader>
          <Description>
            Rates are based on estimated totals calculated using the crude birth
            and death rate for October 2019 - October 2020
          </Description>
        </ReportHeader>

        <Reports>
          <Report>
            <LinkButton>
              Birth registration rate within 45 days of event
            </LinkButton>
            <KeyNumber>23.5%</KeyNumber>
            <KeyNumberDescription>
              32,000 registered within 45 days out of estimated 136,000
            </KeyNumberDescription>
            {this.getLabelValuePair('Male', '23.52%')}
            {this.getLabelValuePair('Female', '22.49%')}
            {this.getLabelValuePair('Third gender', '23.5%')}
          </Report>
          <Report>
            <LinkButton>
              Death registration rate within 45 days of event
            </LinkButton>
            <KeyNumber>23.5%</KeyNumber>
            <KeyNumberDescription>
              32,000 registered within 45 days out of estimated 136,000
            </KeyNumberDescription>
            {this.getLabelValuePair('Male', '23.52%')}
            {this.getLabelValuePair('Female', '22.49%')}
            {this.getLabelValuePair('Third gender', '23.5%')}
          </Report>
        </Reports>
      </>
    )
  }

  render() {
    const { data = {}, intl } = this.props
    return <>{data && this.getReport()}</>
  }
}

export const RegistrationRatesReport = connect(
  null,
  null
)(injectIntl(RegistrationRatesReportComponent))
