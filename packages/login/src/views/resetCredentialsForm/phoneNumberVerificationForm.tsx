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
  goToForgottenItemForm,
  goToRecoveryCodeEntryForm,
  goToSecurityQuestionForm
} from '@login/login/actions'
import { authApi } from '@login/utils/authApi'
import { phoneNumberFormat } from '@login/utils/validate'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Content } from '@opencrvs/components/lib/Content'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'

import * as React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import styled from 'styled-components'
import { messages } from '@login/i18n/messages/views/resetCredentialsForm'
import { convertToMSISDN } from '@login/utils/dataCleanse'
import { messages as validationMessages } from '@login/i18n/messages/validations'

const Actions = styled.div`
  & > div {
    margin-bottom: 16px;
  }
`

interface BaseProps {
  goToForgottenItemForm: typeof goToForgottenItemForm
  goToRecoveryCodeEntryForm: typeof goToRecoveryCodeEntryForm
  goToSecurityQuestionForm: typeof goToSecurityQuestionForm
}
interface State {
  phone: string
  touched: boolean
  error: boolean
  errorMessage: string
}

type Props = BaseProps &
  RouteComponentProps<{}, {}, { forgottenItem: FORGOTTEN_ITEMS }> &
  WrappedComponentProps

class PhoneNumberVerificationComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      phone: '',
      touched: false,
      error: false,
      errorMessage: ''
    }
  }

  handleChange = (value: string) => {
    this.setState({
      error: phoneNumberFormat(value) ? true : false,
      phone: value,
      touched: true
    })
  }

  handleContinue = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!this.state.phone || this.state.error) {
      this.setState({
        touched: true,
        error: true,
        errorMessage: this.props.intl.formatMessage(
          validationMessages.phoneNumberFormat
        )
      })
      return
    }
    try {
      const { nonce, securityQuestionKey } = await authApi.verifyUser(
        convertToMSISDN(this.state.phone, window.config.COUNTRY),
        this.props.location.state.forgottenItem
      )
      if (securityQuestionKey) {
        this.props.goToSecurityQuestionForm(
          nonce,
          securityQuestionKey,
          this.props.location.state.forgottenItem
        )
      } else {
        this.props.goToRecoveryCodeEntryForm(
          nonce,
          this.state.phone,
          this.props.location.state.forgottenItem
        )
      }
    } catch (err) {
      this.setState({
        error: true,
        errorMessage: this.props.intl.formatMessage(
          messages.errorPhoneNumberNotFound
        )
      })
    }
  }

  render() {
    const { error: responseError, errorMessage } = this.state
    const { intl, goToForgottenItemForm } = this.props
    const validationError =
      this.state.error && phoneNumberFormat(this.state.phone)

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
                  onClick={goToForgottenItemForm}
                >
                  <Icon name="ArrowLeft" />
                </Button>
              }
              mobileLeft={
                <Button
                  aria-label="Go back"
                  size="medium"
                  type="icon"
                  onClick={goToForgottenItemForm}
                >
                  <Icon name="ArrowLeft" />
                </Button>
              }
              mobileTitle={intl.formatMessage(
                messages.credentialsResetFormTitle,
                {
                  forgottenItem: this.props.location.state.forgottenItem
                }
              )}
              desktopTitle={intl.formatMessage(
                messages.credentialsResetFormTitle,
                {
                  forgottenItem: this.props.location.state.forgottenItem
                }
              )}
            />
          }
          skipToContentText="Skip to main content"
        >
          <Content
            title={intl.formatMessage(
              messages.phoneNumberConfirmationFormBodyHeader
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
            <form
              id="phone-number-verification-form"
              onSubmit={this.handleContinue}
            >
              <Actions id="phone-number-verification">
                <InputField
                  id="phone-number"
                  key="phoneNumberFieldContainer"
                  label={this.props.intl.formatMessage(
                    messages.phoneNumberFieldLabel
                  )}
                  touched={this.state.touched}
                  error={
                    validationError
                      ? this.props.intl.formatMessage(
                          validationError.message,
                          validationError.props
                        )
                      : responseError
                      ? errorMessage
                      : ''
                  }
                  hideAsterisk={true}
                >
                  <TextInput
                    id="phone-number-input"
                    type="tel"
                    key="phoneNumberInputField"
                    name="phoneNumberInput"
                    isSmallSized={true}
                    value={this.state.phone}
                    onChange={(e) => this.handleChange(e.target.value)}
                    touched={this.state.touched}
                    error={responseError}
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

export const PhoneNumberVerification = connect(null, {
  goToForgottenItemForm,
  goToRecoveryCodeEntryForm,
  goToSecurityQuestionForm
})(withRouter(injectIntl(PhoneNumberVerificationComponent)))
