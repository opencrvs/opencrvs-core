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
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'

import styled from 'styled-components'
import { InjectedFormProps, WrappedFieldProps, Field } from 'redux-form'

import { PrimaryButton, LinkButton } from '@opencrvs/components/lib/buttons'
import {
  InputField,
  TextInput,
  PasswordInput,
  THEME_MODE,
  ErrorMessage
} from '@opencrvs/components/lib/forms'

import { stepOneFields } from '@login/views/StepOne/stepOneFields'
import { messages } from '@login/i18n/messages/views/stepOneForm'

import { IAuthenticationData } from '@login/utils/authApi'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import {
  ERROR_CODE_FIELD_MISSING,
  ERROR_CODE_INVALID_CREDENTIALS,
  ERROR_CODE_FORBIDDEN_CREDENTIALS,
  ERROR_CODE_PHONE_NUMBER_VALIDATE
} from '@login/utils/authUtils'
import { goToForgottenItemForm } from '@login/login/actions'
import { useSelector } from 'react-redux'
import {
  selectApplicationName,
  selectCountryLogo
} from '@login/login/selectors'

export const Container = styled.div`
  position: relative;
  height: auto;
  padding: 0px;
  margin: 0px auto;
  width: 300px;
`

export const FormWrapper = styled.form`
  position: relative;
  margin: auto;
  width: 100%;
  margin-bottom: 50px;
  margin-top: 64px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-top: 48px;
  }
`

export const ActionWrapper = styled.div`
  position: relative;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
`
export const LogoContainer = styled.div`
  flex-direction: row;
  display: flex;
  justify-content: center;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    & svg {
      transform: scale(0.8);
    }
  }
`

export const Title = styled.div`
  margin: auto;
  margin-top: 30px;
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  ${({ theme }) => theme.fonts.reg16};
`
export const StyledPrimaryButton = styled(PrimaryButton)`
  justify-content: center;
  flex-direction: row;
  display: flex;
  flex: 1;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.16);
  padding: 10px ${({ theme }) => theme.grid.margin}px;
  margin-bottom: 10px;
`

export const StyledButton = styled(LinkButton)`
  color: ${({ theme }) => theme.colors.white};
  flex-direction: row;
  justify-content: center;
  text-decoration: none;
  margin: 10px ${({ theme }) => theme.grid.margin}px;
  ${({ theme }) => theme.fonts.reg16};
  :hover {
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.colors.secondary};
  }
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:not([data-focus-visible-added]) {
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.colors.white};
  }
  &:active:not([data-focus-visible-added]):enabled {
    outline: none;
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.copy};
  }
`
export const StyledButtonWrapper = styled.div`
  display: inline-flex;
  justify-content: center;
`
export const FieldWrapper = styled.div`
  min-height: 6.5em;
`

export interface IProps {
  formId: string
  submissionError: boolean
  errorCode?: number
}
export interface IDispatchProps {
  submitAction: (values: IAuthenticationData) => void
  forgetAction: typeof goToForgottenItemForm
}

type IStepOneForm = IProps & IDispatchProps

export type FullProps = IntlShapeProps &
  InjectedFormProps<IAuthenticationData, IStepOneForm> &
  IStepOneForm

const userNameField = stepOneFields.username
const passwordField = stepOneFields.password

type Props = WrappedFieldProps & IntlShapeProps

const UserNameInput = injectIntl((props: Props) => {
  const { intl, meta, input, ...otherProps } = props

  return (
    <InputField
      {...userNameField}
      {...otherProps}
      touched={meta.touched}
      label={intl.formatMessage(userNameField.label)}
      optionalLabel={intl.formatMessage(messages.optionalLabel)}
      ignoreMediaQuery
      hideAsterisk
      mode={THEME_MODE.DARK}
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
  )
})

const Password = injectIntl((props: Props) => {
  const { intl, meta, input, ...otherProps } = props

  return (
    <InputField
      {...passwordField}
      {...otherProps}
      touched={meta.touched}
      label={intl.formatMessage(passwordField.label)}
      optionalLabel={intl.formatMessage(messages.optionalLabel)}
      ignoreMediaQuery
      hideAsterisk
      mode={THEME_MODE.DARK}
    >
      <PasswordInput
        {...passwordField}
        {...input}
        touched={Boolean(meta.touched)}
        error={Boolean(meta.error)}
        ignoreMediaQuery
      />
    </InputField>
  )
})

function usePersistentCountryLogo() {
  const [offlineLogo, setOfflineLogo] = React.useState(
    localStorage.getItem('country-logo') ?? ''
  )
  const logo = useSelector(selectCountryLogo)
  if (logo && logo !== offlineLogo) {
    setOfflineLogo(logo)
    localStorage.setItem('country-logo', logo)
  }
  return offlineLogo
}

export function StepOneForm({
  intl,
  handleSubmit,
  formId,
  submitAction,
  forgetAction,
  submissionError,
  errorCode
}: FullProps) {
  /* This might need to be converted into a state */
  const isOffline: boolean = navigator.onLine ? false : true
  const logo = usePersistentCountryLogo()
  const appName = useSelector(selectApplicationName)

  React.useEffect(() => {
    if (appName) document.title = appName
  }, [appName])

  return (
    <Container id="login-step-one-box">
      <LogoContainer>
        <CountryLogo src={logo} />
      </LogoContainer>
      <Title>
        {submissionError && errorCode ? (
          <ErrorMessage>
            {errorCode === ERROR_CODE_FIELD_MISSING &&
              intl.formatMessage(messages.fieldMissing)}
            {errorCode === ERROR_CODE_INVALID_CREDENTIALS &&
              intl.formatMessage(messages.submissionError)}
            {errorCode === ERROR_CODE_FORBIDDEN_CREDENTIALS &&
              intl.formatMessage(messages.forbiddenCredentialError)}
            {errorCode === ERROR_CODE_PHONE_NUMBER_VALIDATE &&
              intl.formatMessage(messages.phoneNumberFormat)}
          </ErrorMessage>
        ) : (
          isOffline && (
            <ErrorMessage>
              {intl.formatMessage(messages.networkError)}
            </ErrorMessage>
          )
        )}
      </Title>
      <FormWrapper id={formId} onSubmit={handleSubmit(submitAction)}>
        <FieldWrapper>
          <Field
            name={userNameField.name}
            validate={userNameField.validate}
            component={UserNameInput}
          />
        </FieldWrapper>
        <FieldWrapper>
          <Field
            name={passwordField.name}
            validate={passwordField.validate}
            component={Password}
          />
        </FieldWrapper>
        <ActionWrapper>
          <PrimaryButton id="login-mobile-submit" type="submit">
            {intl.formatMessage(messages.submit)}
          </PrimaryButton>
          <StyledButtonWrapper>
            <StyledButton
              id="login-forgot-password"
              type="button"
              onClick={forgetAction}
            >
              {intl.formatMessage(messages.forgotPassword)}
            </StyledButton>
          </StyledButtonWrapper>
        </ActionWrapper>
      </FormWrapper>
    </Container>
  )
}
