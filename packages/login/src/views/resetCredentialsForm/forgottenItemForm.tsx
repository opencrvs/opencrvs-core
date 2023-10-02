/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { goToHome, goToPhoneNumberVerificationForm } from '@login/login/actions'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Content } from '@opencrvs/components/lib/Content'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'

import { RadioButton } from '@opencrvs/components/lib/Radio'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { messages } from '@login/i18n/messages/views/resetCredentialsForm'
import { constantsMessages } from '@login/i18n/messages/constants'

const Actions = styled.div`
  & > div {
    margin-bottom: 16px;
  }
`

interface BaseProps {
  goToHome: typeof goToHome
  goToPhoneNumberVerificationForm: typeof goToPhoneNumberVerificationForm
}
interface State {
  forgottenItem: string
  error: boolean
}

type Props = BaseProps & WrappedComponentProps

class ForgottenItemComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      forgottenItem: '',
      error: false
    }
  }

  handleContinue = (event: React.FormEvent) => {
    event.preventDefault()
    if (this.state.forgottenItem === '') {
      this.setState({ error: true })
    } else {
      this.props.goToPhoneNumberVerificationForm(this.state.forgottenItem)
    }
  }

  render() {
    const { intl, goToHome } = this.props

    const forgottenItems = [
      {
        id: 'usernameOption',
        option: {
          label: intl.formatMessage(messages.usernameOptionLabel),
          value: 'username'
        }
      },
      {
        id: 'passwordOption',
        option: {
          label: intl.formatMessage(messages.passwordOptionLabel),
          value: 'password'
        }
      }
    ]

    return (
      <>
        <Frame
          header={
            <AppBar
              desktopLeft={
                <Button
                  aria-label="Go back"
                  size="medium"
                  type="icon"
                  onClick={goToHome}
                >
                  <Icon name="ArrowLeft" />
                </Button>
              }
              mobileLeft={
                <Button
                  aria-label="Go back"
                  size="medium"
                  type="icon"
                  onClick={goToHome}
                >
                  <Icon name="ArrowLeft" />
                </Button>
              }
              mobileTitle={intl.formatMessage(messages.forgottenItemFormTitle)}
              desktopTitle={intl.formatMessage(messages.forgottenItemFormTitle)}
            />
          }
          skipToContentText={intl.formatMessage(
            constantsMessages.skipToMainContent
          )}
        >
          <form id="forgotten-item-form" onSubmit={this.handleContinue}>
            <Content
              title={intl.formatMessage(messages.forgottenItemFormBodyHeader)}
              bottomActionButtons={[
                <Button
                  key="1"
                  id="continue"
                  onClick={this.handleContinue}
                  type="primary"
                  size="large"
                >
                  {intl.formatMessage(messages.continueButtonLabel)}
                </Button>
              ]}
              showTitleOnMobile
            >
              <Actions id="forgotten-item-options">
                {this.state.error && (
                  <ErrorText id="error-text">
                    {intl.formatMessage(messages.error)}
                  </ErrorText>
                )}
                {forgottenItems.map((item) => {
                  return (
                    <RadioButton
                      id={item.id}
                      size="large"
                      key={item.id}
                      name="forgottenItemOptions"
                      label={item.option.label}
                      value={item.option.value}
                      selected={
                        this.state.forgottenItem === item.option.value
                          ? item.option.value
                          : ''
                      }
                      onChange={() =>
                        this.setState({ forgottenItem: item.option.value })
                      }
                    />
                  )
                })}
              </Actions>
            </Content>
          </form>
        </Frame>
      </>
    )
  }
}

export const ForgottenItem = connect(null, {
  goToHome,
  goToPhoneNumberVerificationForm
})(injectIntl(ForgottenItemComponent))
