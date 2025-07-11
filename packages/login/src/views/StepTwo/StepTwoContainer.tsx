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
import * as React from 'react'
import { useIntl } from 'react-intl'
import { Field, Form } from 'react-final-form'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import { stepTwoFields } from '@login/views/StepTwo/stepTwoFields'
import { Text } from '@opencrvs/components/lib/Text'

import * as actions from '@login/login/actions'
import { IVerifyCodeNumbers, resetSubmissionError } from '@login/login/actions'
import { ceil } from 'lodash'
import { messages } from '@login/i18n/messages/views/stepTwoForm'
import { useDispatch, useSelector } from 'react-redux'
import { Box } from '@login/../../components/lib/Box'
import {
  getResentAuthenticationCode,
  getStepOneDetails,
  getSubmissionError,
  getsubmitting,
  selectApplicationName
} from '@login/login/selectors'
import { Toast } from '@opencrvs/components'
import { usePersistentCountryLogo } from '@login/common/LoginBackgroundWrapper'
import { Container, FormWrapper, LogoContainer } from '@login/views/Common'
import { Stack } from '@opencrvs/components/lib/Stack/Stack'
import { Button } from '@opencrvs/components/lib/Button'
import { NotificationEvent } from '@login/utils/authApi'
import { maskEmail, maskString } from '@login/utils/authUtils'

const FORM_NAME = 'STEP_TWO'

export function StepTwoContainer() {
  const dispatch = useDispatch()
  const logo = usePersistentCountryLogo()

  const submitting = useSelector(getsubmitting)

  const submissionError = useSelector(getSubmissionError)
  const resentAuthenticationCode = useSelector(getResentAuthenticationCode)

  const stepOneDetails = useSelector(getStepOneDetails)
  const intl = useIntl()

  const appName = useSelector(selectApplicationName)

  React.useEffect(() => {
    if (appName) document.title = appName
  }, [appName])

  const mobileNumber =
    stepOneDetails.mobile && maskString(stepOneDetails.mobile)
  const emailAddress = stepOneDetails.email && maskEmail(stepOneDetails.email)

  const field = stepTwoFields.code
  const notificationEvent = NotificationEvent.TWO_FACTOR_AUTHENTICATION
  const notificationMethod = window.config.USER_NOTIFICATION_DELIVERY_METHOD

  return (
    <Container id="login-step-two-box">
      <Box id="Box">
        <Stack direction="column" alignItems="stretch" gap={24}>
          <LogoContainer>
            <CountryLogo size="small" src={logo} />
          </LogoContainer>
          {resentAuthenticationCode ? (
            <React.Fragment>
              <Stack direction="column" alignItems="stretch" gap={8}>
                <Text element="h1" variant="h2" align="center">
                  {intl.formatMessage(messages.stepTwoResendTitle)}
                </Text>
                <Text
                  variant="reg16"
                  align="center"
                  color="supportingCopy"
                  element="p"
                >
                  {notificationMethod === 'sms' &&
                    intl.formatMessage(messages.resentSMS, {
                      number: mobileNumber
                    })}
                  {notificationMethod === 'email' &&
                    intl.formatMessage(messages.resentEMAIL, {
                      email: emailAddress
                    })}
                </Text>
              </Stack>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Stack direction="column" alignItems="stretch" gap={8}>
                <Text element="h1" variant="h2" align="center">
                  {intl.formatMessage(messages.stepTwoTitle)}
                </Text>

                <Text
                  variant="reg16"
                  align="center"
                  color="supportingCopy"
                  element="p"
                >
                  {notificationMethod === 'sms' &&
                    intl.formatMessage(messages.stepTwoInstructionSMS, {
                      number: mobileNumber
                    })}
                  {notificationMethod === 'email' &&
                    intl.formatMessage(messages.stepTwoInstructionEMAIL, {
                      email: emailAddress
                    })}
                </Text>
              </Stack>
            </React.Fragment>
          )}
        </Stack>

        <Form
          onSubmit={(values: IVerifyCodeNumbers) =>
            dispatch(actions.verifyCode(values))
          }
        >
          {({ handleSubmit }) => (
            <FormWrapper id={FORM_NAME} onSubmit={handleSubmit}>
              <Stack direction="column" alignItems="stretch" gap={24}>
                <Field name={field.name} field={field}>
                  {({ meta, input, ...otherProps }) => (
                    <InputField
                      {...field}
                      {...otherProps}
                      touched={Boolean(meta.touched)}
                      label={intl.formatMessage(messages.verficationCodeLabel)}
                      optionalLabel={intl.formatMessage(messages.optionalLabel)}
                      hideAsterisk
                    >
                      <TextInput
                        {...field}
                        {...input}
                        touched={Boolean(meta.touched)}
                        error={Boolean(meta.error)}
                      />
                    </InputField>
                  )}
                </Field>
                <Stack direction="column" gap={16}>
                  <Button
                    size="large"
                    type="primary"
                    fullWidth
                    id="login-mobile-submit"
                    loading={submitting}
                  >
                    {intl.formatMessage(messages.verify)}
                  </Button>

                  <Button
                    size="small"
                    type="tertiary"
                    onClick={(e) => {
                      e.preventDefault()
                      dispatch(
                        actions.resendAuthenticationCode(notificationEvent)
                      )
                    }}
                    id="login-mobile-resend"
                  >
                    {intl.formatMessage(messages.resend, {
                      notificationMethod
                    })}
                  </Button>
                </Stack>
              </Stack>
            </FormWrapper>
          )}
        </Form>
      </Box>
      {submissionError && (
        <Toast type="error" onClose={() => dispatch(resetSubmissionError())}>
          {intl.formatMessage(messages.codeSubmissionError)}
        </Toast>
      )}
    </Container>
  )
}
