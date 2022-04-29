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
import { Box, Spinner } from '@opencrvs/components/lib/interface'
import * as React from 'react'
import { ITheme } from '@opencrvs/components/lib/theme'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import { SubHeader } from './utils'

const Stats = styled(Box)`
  margin: 0 auto;
  width: 100%;
  height: auto;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    border: 0;
    padding: 0;
  }
`
const StatsRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 8px 0;
  & span:first-child {
    ${({ theme }) => theme.fonts.bold14}
    color: ${({ theme }) => theme.colors.copy};
  }
  & span:last-child {
    ${({ theme }) => theme.fonts.reg14}
    color: ${({ theme }) => theme.colors.grey500}
  }
`
export interface IPerformanceStatsProps {
  registrationOffices: number
  totalRegistrars: number
  citizen: number
}

type Props = WrappedComponentProps &
  IPerformanceStatsProps & {
    theme: ITheme
  }

class PerformanceStatsComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
    window.__localeId__ = this.props.intl.locale
  }

  render() {
    const {
      intl,
      registrationOffices,
      totalRegistrars,

      citizen
    } = this.props

    return (
      <Stats>
        <SubHeader>{intl.formatMessage(messages.stats)}</SubHeader>
        <StatsRow>
          <span>{intl.formatMessage(messages.declarationsStartedOffices)}</span>
          <span>{registrationOffices || 0}</span>
        </StatsRow>
        <StatsRow>
          <span>
            {intl.formatMessage(
              messages.performanceRegistrarsApplicationsLabel
            )}
          </span>
          <span>{totalRegistrars || 0}</span>
        </StatsRow>
        <StatsRow>
          <span>{intl.formatMessage(messages.registrarsToCitizen)}</span>
          <span>
            {intl.formatMessage(messages.registrarsToCitizenValue, {
              citizen: citizen || 0
            })}
          </span>
        </StatsRow>
      </Stats>
    )
  }
}

export const PerformanceStats = withTheme(injectIntl(PerformanceStatsComponent))
