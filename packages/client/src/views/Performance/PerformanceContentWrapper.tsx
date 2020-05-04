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
import { Header } from '@client/components/interface/Header/Header'
import { messages } from '@client/i18n/messages/views/performance'
import { PERFORMANCE_REPORT_TYPE_MONTHLY } from '@client/utils/constants'
import { IconTab } from '@client/views/RegistrationHome/RegistrationHome'
import { ICON_ALIGNMENT } from '@opencrvs/components/lib/buttons'
import { TopBar } from '@opencrvs/components/lib/interface'
import { Container, BodyContent } from '@opencrvs/components/lib/layout'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import styled from 'styled-components'

type Props = WrappedComponentProps & {
  tabId?: string
  hideTopBar?: boolean
  children?: React.ReactNode
}

type State = {}

const TAB_ID = {
  monthly: PERFORMANCE_REPORT_TYPE_MONTHLY
}

const Content = styled(BodyContent)`
  padding: 0px;
  margin: 32px auto 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding: 0px 16px;
  }
`

class PerformanceContentWrapperComponent extends React.Component<Props, State> {
  renderTopBar() {
    const { tabId, intl } = this.props

    return (
      <TopBar id="top-bar">
        <IconTab
          id={`tab_${TAB_ID.monthly}`}
          key={TAB_ID.monthly}
          active={tabId === TAB_ID.monthly}
          align={ICON_ALIGNMENT.LEFT}
        >
          {intl.formatMessage(messages.monthlyTabTitle)}
        </IconTab>
      </TopBar>
    )
  }
  render() {
    return (
      <Container>
        <Header />
        {!this.props.hideTopBar && this.renderTopBar()}

        <Content>{this.props.children}</Content>
      </Container>
    )
  }
}

export const PerformanceContentWrapper = injectIntl(
  PerformanceContentWrapperComponent
)
