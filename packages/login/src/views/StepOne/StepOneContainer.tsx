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

import React from 'react'

import {
  getErrorCode,
  getSubmissionError,
  getsubmitting,
  selectApplicationName
} from '@login/login/selectors'
import { useDispatch, useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { Field, Form } from 'react-final-form'
import { Box, InputField, PasswordInput, TextInput } from '@opencrvs/components'
import { messages } from '@login/i18n/messages/views/stepOneForm'
import { stepOneFields } from '@login/views/StepOne/stepOneFields'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import {
  ERROR_CODE_FIELD_MISSING,
  ERROR_CODE_FORBIDDEN_CREDENTIALS,
  ERROR_CODE_INVALID_CREDENTIALS,
  ERROR_CODE_PHONE_NUMBER_VALIDATE
} from '@login/utils/authUtils'
import { IAuthenticationData } from '@login/utils/authApi'
import * as actions from '@login/login/actions'
import {
  goToForgottenItemForm,
  resetSubmissionError
} from '@login/login/actions'
import { Button } from '@opencrvs/components/lib/Button'
import { Toast } from '@opencrvs/components/lib/Toast/Toast'
import { usePersistentCountryLogo } from '@login/common/LoginBackgroundWrapper'
import { Container, FormWrapper, LogoContainer } from '@login/views/Common'
import { LanguageSelect } from '@login/i18n/components/LanguageSelect'
import { Text } from '@opencrvs/components/lib/Text/Text'
import { Link } from '@opencrvs/components/lib/Link/Link'
import { Stack } from '@opencrvs/components/lib/Stack/Stack'

const userNameField = stepOneFields.username
const passwordField = stepOneFields.password

const UserNameInput = () => {
  const intl = useIntl()

  return (
    <Field name={userNameField.name}>
      {({ meta, input, ...otherProps }) => (
        <InputField
          {...userNameField}
          {...otherProps}
          touched={Boolean(meta.touched)}
          label={intl.formatMessage(userNameField.label)}
          optionalLabel={intl.formatMessage(messages.optionalLabel)}
          ignoreMediaQuery
          hideAsterisk
        >
          <TextInput
            {...userNameField}
            {...input}
            touched={Boolean(meta.touched)}
            error={Boolean(meta.error)}
            type="text"
            ignoreMediaQuery
          />
        </InputField>
      )}
    </Field>
  )
}

const Password = () => {
  const intl = useIntl()

  return (
    <Field name={passwordField.name}>
      {({ meta, input, ...otherProps }) => (
        <InputField
          {...passwordField}
          {...otherProps}
          touched={Boolean(meta.touched)}
          label={intl.formatMessage(passwordField.label)}
          optionalLabel={intl.formatMessage(messages.optionalLabel)}
          ignoreMediaQuery
          hideAsterisk
        >
          <PasswordInput
            {...passwordField}
            {...input}
            touched={Boolean(meta.touched)}
            error={Boolean(meta.error)}
            ignoreMediaQuery
          />
        </InputField>
      )}
    </Field>
  )
}

const FORM_NAME = 'STEP_ONE'

export function StepOneContainer() {
  const submitting = useSelector(getsubmitting)
  const errorCode = useSelector(getErrorCode)
  const submissionError = useSelector(getSubmissionError)
  const intl = useIntl()
  const isOffline: boolean = navigator.onLine ? false : true

  const dispatch = useDispatch()

  const logo = usePersistentCountryLogo()
  const appName = useSelector(selectApplicationName)

  React.useEffect(() => {
    if (appName) document.title = appName
  }, [appName])
  return (
    <Container id="login-step-one-box">
      <Box id="Box">
        <LogoContainer>
          <CountryLogo size="small" src={logo} />
        </LogoContainer>
        <Form
          onSubmit={(values: IAuthenticationData) =>
            dispatch(actions.authenticate(values))
          }
        >
          {({ handleSubmit }) => (
            <FormWrapper id={FORM_NAME} onSubmit={handleSubmit}>
              <Stack direction="column" alignItems="stretch" gap={24}>
                <Text element="h1" variant="h2" align="center">
                  {intl.formatMessage(messages.stepOneLoginText)}
                </Text>

                <Field name={userNameField.name} component={UserNameInput} />

                <Field name={passwordField.name} component={Password} />

                <Button
                  id="login-mobile-submit"
                  type="primary"
                  size="large"
                  loading={submitting}
                >
                  {intl.formatMessage(messages.submit)}
                </Button>
                <Button
                  size="small"
                  type="tertiary"
                  id="login-forgot-password"
                  onClick={() => dispatch(goToForgottenItemForm())}
                >
                  {intl.formatMessage(messages.forgotPassword)}
                </Button>
              </Stack>
            </FormWrapper>
          )}
        </Form>
      </Box>

      {submissionError && errorCode ? (
        <Toast type="error" onClose={() => dispatch(resetSubmissionError())}>
          {errorCode === ERROR_CODE_FIELD_MISSING &&
            intl.formatMessage(messages.fieldMissing)}
          {errorCode === ERROR_CODE_INVALID_CREDENTIALS &&
            intl.formatMessage(messages.submissionError)}
          {errorCode === ERROR_CODE_FORBIDDEN_CREDENTIALS &&
            intl.formatMessage(messages.forbiddenCredentialError)}
          {errorCode === ERROR_CODE_PHONE_NUMBER_VALIDATE &&
            intl.formatMessage(messages.phoneNumberFormat)}
        </Toast>
      ) : (
        isOffline && (
          <Toast type="error">
            {intl.formatMessage(messages.networkError)}
          </Toast>
        )
      )}
    </Container>
  )
}
