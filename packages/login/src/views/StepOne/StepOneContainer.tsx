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
import { goToForgottenItemForm } from '@login/login/actions'
import { Button } from '@opencrvs/components/lib/Button'
import { Toast } from '@opencrvs/components/lib/Toast/Toast'
import { usePersistentCountryLogo } from '@login/common/LoginBackgroundWrapper'
import {
  ActionWrapper,
  Container,
  FieldWrapper,
  FormWrapper,
  LogoContainer,
  StyledButton,
  StyledButtonWrapper,
  StyledH2
} from '@login/views/Common'

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
          <CountryLogo src={logo} />
        </LogoContainer>
        <Form
          onSubmit={(values: IAuthenticationData) =>
            dispatch(actions.authenticate(values))
          }
        >
          {({ handleSubmit }) => (
            <FormWrapper id={FORM_NAME} onSubmit={handleSubmit}>
              <StyledH2>
                {intl.formatMessage(messages.stepOneLoginText)}
              </StyledH2>

              <FieldWrapper>
                <Field name={userNameField.name} component={UserNameInput} />
              </FieldWrapper>
              <FieldWrapper>
                <Field name={passwordField.name} component={Password} />
              </FieldWrapper>
              <ActionWrapper>
                <Button
                  id="login-mobile-submit"
                  type="primary"
                  loading={submitting}
                >
                  {intl.formatMessage(messages.submit)}
                </Button>
                <StyledButtonWrapper>
                  <StyledButton
                    id="login-forgot-password"
                    type="button"
                    onClick={() => dispatch(goToForgottenItemForm())}
                  >
                    {intl.formatMessage(messages.forgotPassword)}
                  </StyledButton>
                </StyledButtonWrapper>
              </ActionWrapper>
            </FormWrapper>
          )}
        </Form>
      </Box>

      {submissionError && errorCode ? (
        <Toast type="error">
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
