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
  FORGOTTEN_ITEMS,
  goToPhoneNumberVerificationForm,
  goToSecurityQuestionForm
} from '@login/login/actions'
import { NotificationEvent, authApi } from '@login/utils/authApi'
import { PrimaryButton, LinkButton } from '@opencrvs/components/lib/buttons'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import styled from 'styled-components'
import { Title } from './commons'
import { messages } from '@login/i18n/messages/views/resetCredentialsForm'

const Actions = styled.div`
  padding: 32px 0;
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

    return (
      <>
        <ActionPageLight
          title={intl.formatMessage(messages.credentialsResetFormTitle, {
            forgottenItem
          })}
          goBack={() => goToPhoneNumberVerificationForm(forgottenItem)}
        >
          <form id="recovery-code-entry-form" onSubmit={this.handleContinue}>
            {resentAuthenticationCode && (
              <>
                <Title>{intl.formatMessage(messages.codeResentTitle)}</Title>
                {intl.formatMessage(messages.resentSMS, {
                  number:
                    window.config.USER_NOTIFICATION_DELIVERY_METHOD === 'sms'
                      ? this.props.location.state.mobile
                      : this.props.location.state.email
                })}
              </>
            )}
            {!resentAuthenticationCode && (
              <>
                <Title>
                  {intl.formatMessage(messages.recoveryCodeEntryFormBodyHeader)}
                </Title>
                {intl.formatMessage(
                  window.config.USER_NOTIFICATION_DELIVERY_METHOD === 'sms'
                    ? messages.recoveryCodeEntryFormBodySubheaderMobile
                    : messages.recoveryCodeEntryFormBodySubheaderEmail
                )}
              </>
            )}{' '}
            <LinkButton
              onClick={() => {
                this.resendAuthenticationCode(notificationEvent)
              }}
              id="retrieve-login-mobile-resend"
              type="button"
            >
              {intl.formatMessage(messages.resend)}
            </LinkButton>
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
                hideAsterisk={true}
              >
                <TextInput
                  id="recovery-code-input"
                  type="number"
                  key="recoveryCodeInputField"
                  name="recoveryCodeInput"
                  isSmallSized={true}
                  value={this.state.recoveryCode}
                  onChange={(e) => this.handleChange(e.target.value)}
                  touched={this.state.touched}
                  error={this.state.error}
                />
              </InputField>
            </Actions>
            <PrimaryButton id="continue">
              {intl.formatMessage(messages.continueButtonLabel)}
            </PrimaryButton>
          </form>
        </ActionPageLight>
      </>
    )
  }
}

export const RecoveryCodeEntry = connect(null, {
  goToPhoneNumberVerificationForm,
  goToSecurityQuestionForm
})(withRouter(injectIntl(RecoveryCodeEntryComponent)))
