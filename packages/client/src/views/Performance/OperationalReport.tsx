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

interface IDispatchProps {
  goToPerformanceHome: typeof goToPerformanceHome
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
  color: ${({ theme }) => theme.colors.menuBackground};
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
  flex-wrap: wrap;
  margin: 0 -40px 0 -40px;
  padding: 0 40px 8px 40px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dividerDark};
`

class OperationalReportComponent extends React.Component<Props, State> {
  onChangeLocation = () => {
    this.props.goToPerformanceHome({
      selectedLocation: this.props.history.location.state.selectedLocation
    })
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

    const title = selectedLocation.displayLabel

    return (
      <PerformanceContentWrapper hideTopBar>
        <HeaderContainer>
          <Header>{title}</Header>
          <LinkButton onClick={this.onChangeLocation}>
            {intl.formatMessage(buttonMessages.change)}
          </LinkButton>
        </HeaderContainer>
        <ActionContainer>
          <div>
            <PerformanceSelect
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
      </PerformanceContentWrapper>
    )
  }
}

export const OperationalReport = connect(
  null,
  { goToPerformanceHome }
)(injectIntl(OperationalReportComponent))
