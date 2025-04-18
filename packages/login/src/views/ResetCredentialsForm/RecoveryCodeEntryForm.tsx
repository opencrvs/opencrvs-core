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
import { NotificationEvent, authApi } from '@login/utils/authApi'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import React, { useState } from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'

import styled from 'styled-components'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Link } from '@opencrvs/components/lib/Link'
import { Toast } from '@opencrvs/components/lib/Toast'

import { messages } from '@login/i18n/messages/views/resetCredentialsForm'
import { constantsMessages } from '@login/i18n/messages/constants'
import { useLocation, useNavigate } from 'react-router-dom'
import * as routes from '@login/navigation/routes'
const Actions = styled.div`
  & > div {
    margin-bottom: 16px;
  }
`

type Props = WrappedComponentProps
const RECOVERY_CODE_LENGTH = 6

const RecoveryCodeEntryComponent = ({ intl }: Props) => {
  const [recoveryCode, setRecoveryCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState(true)
  const [resentAuthenticationCode, setResentAuthenticationCode] =
    useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const goToPhoneNumberVerificationForm = (forgottenItem: string) =>
    navigate(routes.PHONE_NUMBER_VERIFICATION, { state: { forgottenItem } })

  const handleChange = (value: string) => {
    setRecoveryCode(value)
    setTouched(true)
    setError(value.length !== RECOVERY_CODE_LENGTH)
    setResentAuthenticationCode(false)
  }

  const handleContinue = async (event: React.FormEvent) => {
    event.preventDefault()
    if (error) {
      return
    }
    try {
      const { nonce, securityQuestionKey } = await authApi.verifyNumber(
        location.state.nonce,
        recoveryCode
      )
      navigate(routes.SECURITY_QUESTION, {
        state: {
          nonce,
          securityQuestionKey,
          forgottenItem: location.state.forgottenItem
        }
      })
    } catch (error) {
      setError(true)
    }
  }

  const resendAuthenticationCode = async (
    notificationEvent: NotificationEvent
  ) => {
    await authApi.resendAuthenticationCode(
      location.state.nonce,
      notificationEvent,
      true
    )
    setResentAuthenticationCode(true)
  }
  const { forgottenItem } = location.state
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
        <form id="recovery-code-entry-form" onSubmit={handleContinue}>
          <Content
            size={ContentSize.SMALL}
            title={intl.formatMessage(messages.recoveryCodeEntryFormBodyHeader)}
            showTitleOnMobile
            subtitle={intl.formatMessage(
              notificationMethod === 'sms'
                ? messages.recoveryCodeEntryFormBodySubheaderMobile
                : messages.recoveryCodeEntryFormBodySubheaderEmail,
              {
                link: (
                  <Link
                    onClick={() => {
                      resendAuthenticationCode(notificationEvent)
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
                onClick={handleContinue}
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
                      ? location.state.mobile
                      : location.state.email
                })}
              </Toast>
            )}

            <Actions id="recovery-code-verification">
              <InputField
                id="recovery-code"
                key="recoveryCodeFieldContainer"
                label={intl.formatMessage(messages.verificationCodeFieldLabel)}
                touched={touched}
                error={error ? intl.formatMessage(messages.error) : ''}
                hideAsterisk
              >
                <TextInput
                  id="recovery-code-input"
                  type="number"
                  key="recoveryCodeInputField"
                  name="recoveryCodeInput"
                  isSmallSized
                  value={recoveryCode}
                  onChange={(e) => handleChange(e.target.value)}
                  touched={touched}
                  error={error}
                />
              </InputField>
            </Actions>
          </Content>
        </form>
      </Frame>
    </>
  )
}

export const RecoveryCodeEntry = injectIntl(RecoveryCodeEntryComponent)
