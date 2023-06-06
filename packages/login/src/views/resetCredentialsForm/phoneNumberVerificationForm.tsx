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
import { emailAddressFormat, phoneNumberFormat } from '@login/utils/validate'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
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
import { convertToMSISDN } from '@login/utils/dataCleanse'
import { messages as validationMessages } from '@login/i18n/messages/validations'

const Actions = styled.div`
  padding: 32px 0;
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
      this.setState({
        touched: true,
        error: true,
        errorMessage: this.props.intl.formatMessage(
          validationMessages.phoneNumberFormat
        )
      })
      return
    } else if (
      this.state.notificationMethod === 'email' &&
      (!this.state.email || this.state.error)
    ) {
      this.setState({
        touched: true,
        error: true,
        errorMessage: this.props.intl.formatMessage(
          validationMessages.emailAddressFormat
        )
      })
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
        <ActionPageLight
          id="page-title"
          title={intl.formatMessage(messages.credentialsResetFormTitle, {
            forgottenItem: this.props.location.state.forgottenItem
          })}
          goBack={goToForgottenItemForm}
        >
          <form
            id="phone-or-email-verification-form"
            onSubmit={this.handleContinue}
          >
            <Title>
              {notificationMethod === 'sms' &&
                intl.formatMessage(
                  messages.phoneNumberConfirmationFormBodyHeader
                )}
              {notificationMethod === 'email' &&
                intl.formatMessage(
                  messages.emailAddressConfirmationFormBodyHeader
                )}
            </Title>

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

            <PrimaryButton id="continue">
              {intl.formatMessage(messages.continueButtonLabel)}
            </PrimaryButton>
          </form>
        </ActionPageLight>
      </>
    )
  }
}

export const PhoneNumberVerification = connect(null, {
  goToForgottenItemForm,
  goToRecoveryCodeEntryForm,
  goToSecurityQuestionForm
})(withRouter(injectIntl(PhoneNumberVerificationComponent)))
