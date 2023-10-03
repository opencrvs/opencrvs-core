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
  goToForgottenItemForm,
  goToRecoveryCodeEntryForm,
  goToSecurityQuestionForm
} from '@login/login/actions'
import { authApi } from '@login/utils/authApi'
import { emailAddressFormat, phoneNumberFormat } from '@login/utils/validate'
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
import { constantsMessages } from '@login/i18n/messages/constants'

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
  email: string
  touched: boolean
  error: boolean
  errorMessage: string
  notificationMethod: string
}

type Props = BaseProps &
  RouteComponentProps<{}, {}, { forgottenItem: FORGOTTEN_ITEMS }> &
  WrappedComponentProps

class PhoneNumberVerificationComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      phone: '',
      email: '',
      touched: false,
      error: false,
      errorMessage: '',
      notificationMethod: window.config.USER_NOTIFICATION_DELIVERY_METHOD
    }
  }

  handleMobileChange = (value: string) => {
    this.setState({
      error: phoneNumberFormat(value) ? true : false,
      phone: value,
      touched: true
    })
  }

  handleEmailChange = (value: string) => {
    this.setState({
      error: emailAddressFormat(value) ? true : false,
      email: value,
      touched: true
    })
  }

  handleContinue = async (event: React.FormEvent) => {
    event.preventDefault()
    if (
      this.state.notificationMethod === 'sms' &&
      (!this.state.phone || this.state.error)
    ) {
      this.setState((prevState) => ({
        touched: true,
        error: true,
        errorMessage: !prevState.phone
          ? this.props.intl.formatMessage(validationMessages.phoneNumberFormat)
          : this.props.intl.formatMessage(messages.errorPhoneNumberNotFound)
      }))
      return
    } else if (
      this.state.notificationMethod === 'email' &&
      (!this.state.email || this.state.error)
    ) {
      this.setState((prevState) => ({
        touched: true,
        error: true,
        errorMessage: !prevState.email
          ? this.props.intl.formatMessage(validationMessages.emailAddressFormat)
          : this.props.intl.formatMessage(messages.errorEmailAddressNotFound)
      }))
      return
    }
    try {
      const { nonce, securityQuestionKey } = await authApi.verifyUser({
        mobile:
          this.state.notificationMethod === 'sms'
            ? convertToMSISDN(this.state.phone, window.config.COUNTRY)
            : undefined,
        email:
          this.state.notificationMethod === 'email'
            ? this.state.email
            : undefined,
        retrieveFlow: this.props.location.state.forgottenItem
      })

      if (securityQuestionKey) {
        this.props.goToSecurityQuestionForm(
          nonce,
          securityQuestionKey,
          this.props.location.state.forgottenItem
        )
      } else {
        this.props.goToRecoveryCodeEntryForm(
          nonce,
          this.props.location.state.forgottenItem,
          this.state.phone,
          this.state.email
        )
      }
    } catch (err) {
      this.setState({
        error: true,
        errorMessage: this.props.intl.formatMessage(
          this.state.notificationMethod === 'sms'
            ? messages.errorPhoneNumberNotFound
            : messages.errorEmailAddressNotFound
        )
      })
    }
  }

  render() {
    const {
      error: responseError,
      errorMessage,
      notificationMethod
    } = this.state
    const { intl, goToForgottenItemForm } = this.props
    const validationError =
      this.state.error &&
      (notificationMethod === 'sms'
        ? phoneNumberFormat(this.state.phone)
        : emailAddressFormat(this.state.email))
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
          skipToContentText={intl.formatMessage(
            constantsMessages.skipToMainContent
          )}
        >
          <form
            id="phone-or-email-verification-form"
            onSubmit={this.handleContinue}
          >
            <Content
              title={
                notificationMethod === 'sms'
                  ? intl.formatMessage(
                      messages.phoneNumberConfirmationFormBodyHeader
                    )
                  : intl.formatMessage(
                      messages.emailAddressConfirmationFormBodyHeader
                    )
              }
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
              <Actions id="phone-or-email-verification">
                <InputField
                  id="phone-or-email-for-notification"
                  key="phoneOrEmailFieldInputContainer"
                  label={
                    this.state.notificationMethod === 'sms'
                      ? this.props.intl.formatMessage(
                          messages.phoneNumberFieldLabel
                        )
                      : this.state.notificationMethod === 'email'
                      ? this.props.intl.formatMessage(
                          messages.emailAddressFieldLabel
                        )
                      : ''
                  }
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
                  {notificationMethod === 'sms' && (
                    <TextInput
                      id="phone-number-input"
                      type="tel"
                      key="phoneNumberInputField"
                      name="phoneNumberInput"
                      isSmallSized={true}
                      value={this.state.phone}
                      onChange={(e) => this.handleMobileChange(e.target.value)}
                      touched={this.state.touched}
                      error={responseError}
                    />
                  )}
                  {notificationMethod === 'email' && (
                    <TextInput
                      id="email-address-input"
                      key="emailAddressInputField"
                      name="emailAddressInput"
                      isSmallSized={true}
                      value={this.state.email}
                      onChange={(e) => this.handleEmailChange(e.target.value)}
                      touched={this.state.touched}
                      error={responseError}
                    />
                  )}
                </InputField>
              </Actions>
            </Content>
          </form>
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
