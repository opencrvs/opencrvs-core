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
import { Shield } from '@opencrvs/components/lib/icons'
import styled from '@client/styledComponents'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { CreatePin } from '@client/views/PIN/CreatePin'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { secureAccountMessages as messages } from '@client/i18n/messages/views/secureAccount'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { connect } from 'react-redux'
import { IApplicationConfig } from '@client/utils/referenceApi'

const SecurePageContainer = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  ${({ theme }) => theme.gradients.primary};
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  height: 100vh;
  text-align: center;
  width: 100%;
  position: absolute;
  color: ${({ theme }) => theme.colors.white};
`
const Wrapper = styled.div`
  width: 80%;
  margin: auto;
  max-width: 300px;
`
const Item = styled.div<{ margin?: string }>`
  margin: ${({ margin }) => margin || '0px'};
`
const PinButton = styled(PrimaryButton)`
  width: 100%;
  text-align: center;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.16);
  display: block;
`
const Bold = styled.span`
  ${({ theme }) => theme.fonts.h2};
`
interface IStateProps {
  config: IApplicationConfig
}

class SecureAccountComponent extends React.Component<
  {
    onComplete: () => void
    collectPin?: boolean
  } & IStateProps &
    IntlShapeProps
> {
  state = {
    collectPin: this.props.collectPin || false
  }

  render() {
    const { intl, config } = this.props

    return (
      (!this.state.collectPin && (
        <SecurePageContainer>
          <Wrapper>
            <Item margin="50px 0px">
              <Shield />
            </Item>

            <Item margin="50px 0px">
              <Bold>{intl.formatMessage(messages.secureAccountPageTitle)}</Bold>
              <p>
                {intl.formatMessage(messages.secureAccountPageDesc, {
                  applicationName: config.APPLICATION_NAME
                })}
              </p>
            </Item>

            <Item>
              <PinButton
                id="createPinBtn"
                onClick={() => this.setState({ collectPin: true })}
              >
                {intl.formatMessage(messages.createPin)}
              </PinButton>
            </Item>
          </Wrapper>
        </SecurePageContainer>
      )) || <CreatePin onComplete={this.props.onComplete} />
    )
  }
}

function mapStateToProps(state: IStoreState) {
  const offlineCountryConfiguration = getOfflineData(state)
  return {
    config: offlineCountryConfiguration.config
  }
}

export const SecureAccount = connect(mapStateToProps)(
  injectIntl(SecureAccountComponent)
)
