import * as React from 'react'
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl'

import styled from 'styled-components'
import { InjectedFormProps, WrappedFieldProps, Field } from 'redux-form'

import { PrimaryButton, Button } from '@opencrvs/components/lib/buttons'
import {
  InputField,
  TextInput,
  PasswordInput,
  THEME_MODE,
  ErrorMessage
} from '@opencrvs/components/lib/forms'

import { stepOneFields } from '@login/views/StepOne/stepOneFields'

import { IAuthenticationData } from '@login/utils/authApi'
import { Logo } from '@opencrvs/components/lib/icons'
import {
  ERROR_CODE_FIELD_MISSING,
  ERROR_CODE_INVALID_CREDENTIALS,
  ERROR_CODE_PHONE_NUMBER_VALIDATE
} from '@login/utils/authUtils'
export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
  },
  fieldMissing: {
    id: 'login.fieldMissing',
    defaultMessage: 'Mobile number and password must be provided',
    description: "The error if user doesn't fill all the field"
  },
  phoneNumberFormat: {
    id: 'validations.phoneNumberFormat',
    defaultMessage:
      'Must be a valid mobile phone number. Starting with 0. e.g. {example}',
    description:
      'The error message that appears on phone numbers where the first character must be a 0'
  }
})

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
    text-decoration-color: ${({ theme }) => theme.colors.secondary};
  }
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
}

type IStepOneForm = IProps & IDispatchProps

export type FullProps = InjectedIntlProps &
  InjectedFormProps<IAuthenticationData, IStepOneForm> &
  IStepOneForm

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
      label={intl.formatMessage(mobileField.label)}
      optionalLabel={intl.formatMessage(messages.optionalLabel)}
      ignoreMediaQuery
      hideAsterisk
      mode={THEME_MODE.DARK}
    >
      <TextInput
        {...mobileField}
        {...input}
        touched={Boolean(meta.touched)}
        error={Boolean(meta.error)}
        type="tel"
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

export class StepOneForm extends React.Component<FullProps> {
  render() {
    const {
      intl,
      handleSubmit,
      formId,
      submitAction,
      submissionError,
      errorCode
    } = this.props

    return (
      <Container id="login-step-one-box">
        <LogoContainer>
          <Logo />
        </LogoContainer>
        <Title>
          {submissionError && (
            <ErrorMessage>
              {errorCode === ERROR_CODE_FIELD_MISSING &&
                intl.formatMessage(messages.fieldMissing)}
              {errorCode === ERROR_CODE_INVALID_CREDENTIALS &&
                intl.formatMessage(messages.submissionError)}
              {errorCode === ERROR_CODE_PHONE_NUMBER_VALIDATE &&
                intl.formatMessage(messages.phoneNumberFormat)}
            </ErrorMessage>
          )}
        </Title>
        <FormWrapper id={formId} onSubmit={handleSubmit(submitAction)}>
          <FieldWrapper>
            <Field
              name={mobileField.name}
              validate={mobileField.validate}
              component={MobileInput as React.ComponentClass<any>}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Field
              name={passwordField.name}
              validate={passwordField.validate}
              component={Password as React.ComponentClass<any>}
            />
          </FieldWrapper>
          <ActionWrapper>
            <PrimaryButton id="login-mobile-submit" type="submit">
              {intl.formatMessage(messages.submit)}
            </PrimaryButton>
            <StyledButton id="login-forgot-password" type="button">
              {intl.formatMessage(messages.forgotPassword)}
            </StyledButton>
          </ActionWrapper>
        </FormWrapper>
      </Container>
    )
  }
}
