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
import { authApi } from '@login/utils/authApi'
import { emailAddressFormat, phoneNumberFormat } from '@login/utils/validate'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'

import React, { useState } from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import styled from 'styled-components'
import { messages } from '@login/i18n/messages/views/resetCredentialsForm'
import { convertToMSISDN } from '@login/utils/dataCleanse'
import { messages as validationMessages } from '@login/i18n/messages/validations'
import { constantsMessages } from '@login/i18n/messages/constants'
import { useLocation, useNavigate } from 'react-router-dom'
import * as routes from '@login/navigation/routes'

const Actions = styled.div`
  & > div {
    margin-bottom: 16px;
  }
`

interface State {
  phone: string
  email: string
  touched: boolean
  error: boolean
  errorMessage: string
  notificationMethod: string
}

const AuthDetailsVerificationComponent = ({ intl }: WrappedComponentProps) => {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notificationMethod] = useState(
    window.config.USER_NOTIFICATION_DELIVERY_METHOD
  )

  // <{ forgottenItem: FORGOTTEN_ITEMS }>
  const location = useLocation()
  const navigate = useNavigate()

  const handleMobileChange = (value: string) => {
    setPhone(value)
    setTouched(true)
    setError(phoneNumberFormat(value) ? true : false)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setTouched(true)
    setError(emailAddressFormat(value) ? true : false)
  }

  const handleContinue = async (event: React.FormEvent) => {
    event.preventDefault()

    if (notificationMethod === 'sms' && (!phone || error)) {
      setError(true)
      setTouched(true)
      setErrorMessage(
        !phone
          ? intl.formatMessage(validationMessages.phoneNumberFormat)
          : intl.formatMessage(messages.errorPhoneNumberNotFound)
      )
      return
    }
    if (notificationMethod === 'email' && (!email || error)) {
      setError(true)
      setTouched(true)
      setErrorMessage(
        !email
          ? intl.formatMessage(validationMessages.emailAddressFormat)
          : intl.formatMessage(messages.errorEmailAddressNotFound)
      )
      return
    }

    try {
      const { nonce, securityQuestionKey } = await authApi.verifyUser({
        mobile:
          notificationMethod === 'sms'
            ? convertToMSISDN(phone, window.config.COUNTRY)
            : undefined,
        email: notificationMethod === 'email' ? email : undefined,
        retrieveFlow: location.state.forgottenItem
      })

      if (securityQuestionKey) {
        return navigate(routes.SECURITY_QUESTION, {
          state: {
            nonce,
            securityQuestionKey,
            forgottenItem: location.state.forgottenItem
          }
        })
      }

      navigate(routes.RECOVERY_CODE_ENTRY, {
        state: {
          nonce,
          mobile: phone,
          email,
          forgottenItem: location.state.forgottenItem
        }
      })
    } catch (err) {
      setError(true)
      setErrorMessage(
        intl.formatMessage(
          notificationMethod === 'sms'
            ? messages.errorPhoneNumberNotFound
            : messages.errorEmailAddressNotFound
        )
      )
    }
  }

  const validationError =
    error &&
    (notificationMethod === 'sms'
      ? phoneNumberFormat(phone)
      : emailAddressFormat(email))
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
                onClick={() => navigate(routes.FORGOTTEN_ITEM)}
              >
                <Icon name="ArrowLeft" />
              </Button>
            }
            mobileLeft={
              <Button
                aria-label="Go back"
                size="medium"
                type="icon"
                onClick={() => navigate(routes.FORGOTTEN_ITEM)}
              >
                <Icon name="ArrowLeft" />
              </Button>
            }
            mobileTitle={intl.formatMessage(
              messages.credentialsResetFormTitle,
              {
                forgottenItem: location.state.forgottenItem
              }
            )}
            desktopTitle={intl.formatMessage(
              messages.credentialsResetFormTitle,
              {
                forgottenItem: location.state.forgottenItem
              }
            )}
          />
        }
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
      >
        <form id="phone-or-email-verification-form" onSubmit={handleContinue}>
          <Content
            size={ContentSize.SMALL}
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
                onClick={handleContinue}
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
                  notificationMethod === 'sms'
                    ? intl.formatMessage(messages.phoneNumberFieldLabel)
                    : notificationMethod === 'email'
                    ? intl.formatMessage(messages.emailAddressFieldLabel)
                    : ''
                }
                touched={touched}
                error={
                  validationError
                    ? intl.formatMessage(
                        validationError.message,
                        validationError.props
                      )
                    : error
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
                    value={phone}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    touched={touched}
                    error={error}
                  />
                )}
                {notificationMethod === 'email' && (
                  <TextInput
                    id="email-address-input"
                    key="emailAddressInputField"
                    name="emailAddressInput"
                    isSmallSized={true}
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    touched={touched}
                    error={error}
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

export const AuthDetailsVerification = injectIntl(
  AuthDetailsVerificationComponent
)
