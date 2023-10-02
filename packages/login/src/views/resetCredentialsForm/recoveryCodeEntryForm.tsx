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
import {
  FORGOTTEN_ITEMS,
  goToPhoneNumberVerificationForm,
  goToSecurityQuestionForm
} from '@login/login/actions'
import { NotificationEvent, authApi } from '@login/utils/authApi'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import styled from 'styled-components'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Content } from '@opencrvs/components/lib/Content'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Link } from '@opencrvs/components/lib/Link'
import { Toast } from '@opencrvs/components/lib/Toast'

import { messages } from '@login/i18n/messages/views/resetCredentialsForm'
import { constantsMessages } from '@login/i18n/messages/constants'

const Actions = styled.div`
  & > div {
    margin-bottom: 16px;
  }
`

interface BaseProps
  extends RouteComponentProps<
    {},
    {},
    {
      forgottenItem: FORGOTTEN_ITEMS
      nonce: string
      mobile?: string
      email?: string
    }
  > {
  goToPhoneNumberVerificationForm: typeof goToPhoneNumberVerificationForm
  goToSecurityQuestionForm: typeof goToSecurityQuestionForm
}

interface State {
  recoveryCode: string
  touched: boolean
  error: boolean
  resentAuthenticationCode: boolean
}

type Props = BaseProps & WrappedComponentProps

class RecoveryCodeEntryComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      recoveryCode: '',
      touched: false,
      error: true,
      resentAuthenticationCode: false
    }
  }

  handleChange = (value: string) => {
    this.setState({
      error: value.length !== 6,
      recoveryCode: value,
      touched: true,
      resentAuthenticationCode: false
    })
  }

  handleContinue = async (event: React.FormEvent) => {
    event.preventDefault()
    if (this.state.error) {
      return
    }
    try {
      const { nonce, securityQuestionKey } = await authApi.verifyNumber(
        this.props.location.state.nonce,
        this.state.recoveryCode
      )
      this.props.goToSecurityQuestionForm(
        nonce,
        securityQuestionKey,
        this.props.location.state.forgottenItem
      )
    } catch (error) {
      this.setState({
        error: true
      })
    }
  }

  resendAuthenticationCode = async (notificationEvent: NotificationEvent) => {
    await authApi.resendAuthenticationCode(
      this.props.location.state.nonce,
      notificationEvent,
      true
    )
    this.setState({ resentAuthenticationCode: true })
  }
  render() {
    const { intl, goToPhoneNumberVerificationForm } = this.props
    const { forgottenItem } = this.props.location.state
    const { resentAuthenticationCode } = this.state
    const notificationEvent = NotificationEvent.PASSWORD_RESET
    const notificationMethod = window.config.USER_NOTIFICATION_DELIVERY_METHOD

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
                  onClick={() => goToPhoneNumberVerificationForm(forgottenItem)}
                >
                  <Icon name="ArrowLeft" />
                </Button>
              }
              mobileLeft={
                <Button
                  aria-label="Go back"
                  size="medium"
                  type="icon"
                  onClick={() => goToPhoneNumberVerificationForm(forgottenItem)}
                >
                  <Icon name="ArrowLeft" />
                </Button>
              }
              mobileTitle={intl.formatMessage(
                messages.credentialsResetFormTitle,
                {
                  forgottenItem
                }
              )}
              desktopTitle={intl.formatMessage(
                messages.credentialsResetFormTitle,
                {
                  forgottenItem
                }
              )}
            />
          }
          skipToContentText={intl.formatMessage(
            constantsMessages.skipToMainContent
          )}
        >
          <form id="recovery-code-entry-form" onSubmit={this.handleContinue}>
            <Content
              title={intl.formatMessage(
                messages.recoveryCodeEntryFormBodyHeader
              )}
              subtitle={intl.formatMessage(
                notificationMethod === 'sms'
                  ? messages.recoveryCodeEntryFormBodySubheaderMobile
                  : messages.recoveryCodeEntryFormBodySubheaderEmail,
                {
                  link: (
                    <Link
                      onClick={() => {
                        this.resendAuthenticationCode(notificationEvent)
                      }}
                      id="retrieve-login-mobile-resend"
                      font="bold16"
                      type="button"
                    >
                      {intl.formatMessage(messages.resend, {
                        notificationMethod
                      })}
                    </Link>
                  )
                }
              )}
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
            >
              {resentAuthenticationCode && (
                <Toast type="success">
                  {intl.formatMessage(messages.resentSMS, {
                    number:
                      notificationMethod === 'sms'
                        ? this.props.location.state.mobile
                        : this.props.location.state.email
                  })}
                </Toast>
              )}

              <Actions id="recovery-code-verification">
                <InputField
                  id="recovery-code"
                  key="recoveryCodeFieldContainer"
                  label={this.props.intl.formatMessage(
                    messages.verificationCodeFieldLabel
                  )}
                  touched={this.state.touched}
                  error={
                    this.state.error
                      ? this.props.intl.formatMessage(messages.error)
                      : ''
                  }
                  hideAsterisk
                >
                  <TextInput
                    id="recovery-code-input"
                    type="number"
                    key="recoveryCodeInputField"
                    name="recoveryCodeInput"
                    isSmallSized
                    value={this.state.recoveryCode}
                    onChange={(e) => this.handleChange(e.target.value)}
                    touched={this.state.touched}
                    error={this.state.error}
                  />
                </InputField>
              </Actions>
            </Content>
          </form>
        </Frame>
      </>
    )
  }
}

export const RecoveryCodeEntry = connect(null, {
  goToPhoneNumberVerificationForm,
  goToSecurityQuestionForm
})(withRouter(injectIntl(RecoveryCodeEntryComponent)))
