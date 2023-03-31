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
import { authApi } from '@login/utils/authApi'
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

const Actions = styled.div`
  & > div {
    margin-bottom: 16px;
  }
`

interface BaseProps
  extends RouteComponentProps<
    {},
    {},
    { forgottenItem: FORGOTTEN_ITEMS; nonce: string; mobile: string }
  > {
  goToPhoneNumberVerificationForm: typeof goToPhoneNumberVerificationForm
  goToSecurityQuestionForm: typeof goToSecurityQuestionForm
}

interface State {
  recoveryCode: string
  touched: boolean
  error: boolean
  resentSMS: boolean
}

type Props = BaseProps & WrappedComponentProps

class RecoveryCodeEntryComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      recoveryCode: '',
      touched: false,
      error: true,
      resentSMS: false
    }
  }

  handleChange = (value: string) => {
    this.setState({
      error: value.length !== 6,
      recoveryCode: value,
      touched: true,
      resentSMS: false
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

  resendSMS = async () => {
    await authApi.resendSMS(this.props.location.state.nonce, true)
    this.setState({ resentSMS: true })
  }
  render() {
    const { intl, goToPhoneNumberVerificationForm } = this.props
    const { forgottenItem } = this.props.location.state

    const { resentSMS } = this.state

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
          skipToContentText="Skip to main content"
        >
          <Content
            title={intl.formatMessage(messages.recoveryCodeEntryFormBodyHeader)}
            subtitle={intl.formatMessage(
              messages.recoveryCodeEntryFormBodySubheader,
              {
                link: (
                  <Link
                    onClick={this.resendSMS}
                    id="retrieve-login-mobile-resend"
                    font="bold16"
                    type="button"
                  >
                    {intl.formatMessage(messages.resend)}
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
            {resentSMS && (
              <Toast type="success">
                {intl.formatMessage(messages.resentSMS, {
                  number: this.props.location.state.mobile
                })}
              </Toast>
            )}
            <form id="recovery-code-entry-form" onSubmit={this.handleContinue}>
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
            </form>
          </Content>
        </Frame>
      </>
    )
  }
}

export const RecoveryCodeEntry = connect(null, {
  goToPhoneNumberVerificationForm,
  goToSecurityQuestionForm
})(withRouter(injectIntl(RecoveryCodeEntryComponent)))
