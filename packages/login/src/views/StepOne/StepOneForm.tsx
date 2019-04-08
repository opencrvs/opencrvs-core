import * as React from 'react'
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl'

import styled from 'styled-components'
import { InjectedFormProps, WrappedFieldProps, Field } from 'redux-form'

import { PrimaryButton, Button } from '@opencrvs/components/lib/buttons'

import {
  InputField,
  TextInput,
  THEME_MODE
} from '@opencrvs/components/lib/forms'

import { stepOneFields } from './stepOneFields'

import { IAuthenticationData } from '../../utils/authApi'
import { localiseValidationError } from '../../forms/i18n'
import { Logo } from '@opencrvs/components/lib/icons'

export const messages = defineMessages({
  stepOneTitle: {
    id: 'login.stepOneTitle',
    defaultMessage: 'Login',
    description: 'The title that appears in step one of the form'
  },
  stepOneInstruction: {
    id: 'login.stepOneInstruction',
    defaultMessage: 'Please enter your mobile number and password.',
    description: 'The instruction that appears in step one of the form'
  },
  mobileLabel: {
    id: 'login.mobileLabel',
    defaultMessage: 'Mobile number',
    description: 'The label that appears on the mobile number input'
  },
  mobilePlaceholder: {
    id: 'login.mobilePlaceholder',
    defaultMessage: '07XXXXXXXXX',
    description: 'The placeholder that appears on the mobile number input'
  },
  passwordLabel: {
    id: 'login.passwordLabel',
    defaultMessage: 'Password',
    description: 'The label that appears on the password input'
  },
  submit: {
    id: 'login.submit',
    defaultMessage: 'Submit',
    description: 'The label that appears on the submit button'
  },
  forgotPassword: {
    id: 'login.forgotPassword',
    defaultMessage: 'Forgot password',
    description: 'The label that appears on the Forgot password button'
  },
  submissionError: {
    id: 'login.submissionError',
    defaultMessage: 'Sorry that mobile number and password did not work.',
    description:
      'The error that appears when the user entered details are unauthorised'
  },
  optionalLabel: {
    id: 'login.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  }
})

export const Container = styled.div`
  position: absolute;
  height: auto;
  top: 50%;
  right: 50%;
  padding: 0px;
  margin: 0px;
  transform: translate(50%, -50%);
  width: 20vw;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 70%;
  }
`

export const FormWrapper = styled.form`
  position: relative;
  margin: auto;
  width: 80%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 85%;
  }
  margin-bottom: 50px;
  padding-top: 20px;
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
`

export const Title = styled.div`
  margin: auto;
  margin-top: 30px;
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  width: 80%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 85%;
  }
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

export const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.colors.white};
  flex-direction: row;
  justify-content: center;
  padding: 10px ${({ theme }) => theme.grid.margin}px;

  :hover {
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.colors.accentLight};
  }
`
export const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
`

const FieldWrapper = styled.div`
  margin-bottom: 30px;
`

export interface IProps {
  formId: string
  submissionError: boolean
}
export interface IDispatchProps {
  submitAction: (values: IAuthenticationData) => void
}

type IStepOneForm = IProps & IDispatchProps

const mobileField = stepOneFields.mobile
const passwordField = stepOneFields.password

type Props = WrappedFieldProps & InjectedIntlProps

const MobileInput = injectIntl((props: Props) => {
  const { intl, meta, input, ...otherProps } = props

  return (
    <InputField
      {...mobileField}
      {...otherProps}
      touched={meta.touched}
      error={meta.error && localiseValidationError(intl, meta.error)}
      label={intl.formatMessage(mobileField.label)}
      optionalLabel={intl.formatMessage(messages.optionalLabel)}
      ignoreMediaQuery
      hideAsterisk
      mode={THEME_MODE.DARK}
    >
      <TextInput
        {...mobileField}
        {...input}
        type="tel"
        placeholder={intl.formatMessage(mobileField.placeholder)}
        ignoreMediaQuery
      />
    </InputField>
  )
})

const PasswordInput = injectIntl((props: Props) => {
  const { intl, meta, input, ...otherProps } = props

  return (
    <InputField
      {...passwordField}
      {...otherProps}
      touched={meta.touched}
      error={meta.error && localiseValidationError(intl, meta.error)}
      label={intl.formatMessage(passwordField.label)}
      optionalLabel={intl.formatMessage(messages.optionalLabel)}
      ignoreMediaQuery
      hideAsterisk
      mode={THEME_MODE.DARK}
    >
      <TextInput
        {...passwordField}
        {...input}
        type="password"
        ignoreMediaQuery
      />
    </InputField>
  )
})

export class StepOneForm extends React.Component<
  InjectedIntlProps &
    InjectedFormProps<IAuthenticationData, IStepOneForm> &
    IStepOneForm
> {
  render() {
    const {
      intl,
      handleSubmit,
      formId,
      submitAction,
      submissionError
    } = this.props

    return (
      <Container id="login-step-one-box">
        <LogoContainer>
          <Logo />
        </LogoContainer>
        <Title>
          {submissionError && (
            <ErrorText>
              {intl.formatMessage(messages.submissionError)}
            </ErrorText>
          )}
        </Title>
        <FormWrapper id={formId} onSubmit={handleSubmit(submitAction)}>
          <FieldWrapper>
            <Field
              name={mobileField.name}
              validate={mobileField.validate}
              component={
                // tslint:disable-next-line no-any
                MobileInput as React.ComponentClass<any>
              }
            />
          </FieldWrapper>
          <FieldWrapper>
            <Field
              name={passwordField.name}
              validate={passwordField.validate}
              component={
                // tslint:disable-next-line no-any
                PasswordInput as React.ComponentClass<any>
              }
            />
          </FieldWrapper>
          <ActionWrapper>
            <StyledPrimaryButton id="login-mobile-submit" type="submit">
              {intl.formatMessage(messages.submit)}
            </StyledPrimaryButton>
            <StyledButton id="login-forgot-password" type="button">
              {intl.formatMessage(messages.forgotPassword)}
            </StyledButton>
          </ActionWrapper>
        </FormWrapper>
      </Container>
    )
  }
}
