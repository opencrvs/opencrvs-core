import { Field, WrappedFieldProps } from 'redux-form'
import * as React from 'react'
import styled from 'styled-components'
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl'
import { InjectedFormProps, reset } from 'redux-form'

import {
  SecondaryButton,
  PrimaryButton
} from '@opencrvs/components/lib/buttons'
import { Link } from '@opencrvs/components/lib/typography'
import { FlexGrid } from '@opencrvs/components/lib/grid'
import { TextInput, InputField } from '@opencrvs/components/lib/forms'

import { stepTwoFields } from './stepTwoFields'

import { store } from '../../App'
import {
  StyledBox,
  ErrorText,
  Title,
  FormWrapper,
  ActionWrapper
} from '../StepOne/StepOneForm'

import { IVerifyCodeNumbers } from '../../login/actions'
import { Ii18nReduxFormFieldProps } from '../../utils/fieldUtils'
import { localiseValidationError } from '../../forms/i18n'

import { FORM_NAME } from './contants'

const messages = defineMessages({
  stepTwoTitle: {
    id: 'login.stepTwoTitle',
    defaultMessage: 'Verify your mobile',
    description: 'The title that appears in step two of the form'
  },
  resend: {
    id: 'login.resendMobile',
    defaultMessage: 'Resend SMS',
    description: 'Text for button that resends SMS verification code'
  },
  stepTwoInstruction: {
    id: 'login.stepTwoInstruction',
    defaultMessage:
      'Please enter the sms code we have sent to your mobile phone.',
    description: 'The instruction that appears in step two of the form'
  },
  submit: {
    id: 'login.submit',
    defaultMessage: 'Submit',
    description: 'The label that appears on the submit button'
  },
  codeSubmissionError: {
    id: 'login.codeSubmissionError',
    defaultMessage: 'Sorry that code did not work.',
    description:
      'The error that appears when the user entered sms code is unauthorised'
  },
  resentSMS: {
    id: 'login.resentSMS',
    defaultMessage: 'We have delivered a new SMS to your mobile phone',
    description: 'The message that appears when the resend button is clicked.'
  },
  optionalLabel: {
    id: 'login.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  },
  clearForm: {
    id: 'login.clearForm',
    defaultMessage: 'Clear form',
    description: 'Button to clear the SMS code from the form'
  }
})

const FieldWrapper = styled.div`
  margin-bottom: 30px;
  flex-grow: 1;
  margin-right: 5%;
  margin-left: 5%;
  &:first-child {
    margin-left: 0%;
  }
  &:last-child {
    margin-right: 0%;
  }
`

const Separator = styled.div`
  flex-grow: 1;
  margin-left: auto;
  margin-right: auto;
`

const Circle = styled.div`
  height: 5px;
  width: 1px;
  position: relative;
  top: 12px;
  background-color: ${({ theme }) => theme.colors.disabled};
`

const SecondaryButtonStyled = styled(SecondaryButton)`
  margin-right: 1em;
`

const ClearFormLink = styled(Link)`
  position: relative;
  float: right;
  top: -20px;
`

export interface IProps {
  formId: string
  submissionError: boolean
  resentSMS: boolean
  submitting: boolean
  fieldToFocus: string | null
}
export interface IDispatchProps {
  submitAction: (values: IVerifyCodeNumbers) => void
  onResendSMS: () => void
}

type IStepTwoForm = IProps & IDispatchProps

const CodeInput = injectIntl(
  (
    props: WrappedFieldProps & { field: Ii18nReduxFormFieldProps } & {
      isFocused: boolean
    } & InjectedIntlProps
  ) => {
    const { field, meta, intl, ...otherProps } = props
    return (
      <InputField
        {...field}
        {...otherProps}
        touched={meta.touched}
        error={meta.error && localiseValidationError(intl, meta.error)}
        optionalLabel={intl.formatMessage(messages.optionalLabel)}
        label=""
        ignoreMediaQuery
      >
        <TextInput
          {...field}
          {...props.input}
          touched={Boolean(meta.touched)}
          error={Boolean(meta.error)}
          focusInput={props.isFocused}
          placeholder="0"
          ignoreMediaQuery
        />
      </InputField>
    )
  }
)

export class StepTwoForm extends React.Component<
  InjectedIntlProps &
    InjectedFormProps<IVerifyCodeNumbers, IStepTwoForm> &
    IStepTwoForm
> {
  clearTheForm(e: React.MouseEvent<HTMLElement>) {
    store.dispatch(reset(FORM_NAME))
  }
  render() {
    const {
      intl,
      handleSubmit,
      formId,
      submitAction,
      submissionError,
      submitting,
      resentSMS,
      fieldToFocus
    } = this.props

    return (
      <StyledBox id="login-step-two-box">
        <Title>
          <h2>{intl.formatMessage(messages.stepTwoTitle)}</h2>
          <p>{intl.formatMessage(messages.stepTwoInstruction)}</p>
          {submissionError && (
            <ErrorText>
              {intl.formatMessage(messages.codeSubmissionError)}
            </ErrorText>
          )}
          {resentSMS && (
            <ErrorText>{intl.formatMessage(messages.resentSMS)}</ErrorText>
          )}
        </Title>
        <FormWrapper id={formId} onSubmit={handleSubmit(submitAction)}>
          <FlexGrid>
            {Array(6)
              .fill(null)
              .map((_, i) => {
                const field = stepTwoFields[`code${i + 1}`]

                return (
                  <React.Fragment key={i}>
                    <FieldWrapper>
                      <Field
                        name={field.name}
                        validate={field.validate}
                        component={CodeInput}
                        field={field}
                        isFocused={field.id === fieldToFocus}
                      />
                    </FieldWrapper>
                    {i !== 5 && (
                      <Separator>
                        <Circle />
                      </Separator>
                    )}
                  </React.Fragment>
                )
              })}
          </FlexGrid>

          {fieldToFocus && (
            <ClearFormLink id="login-clear-form" onClick={this.clearTheForm}>
              {intl.formatMessage(messages.clearForm)}
            </ClearFormLink>
          )}
          <ActionWrapper>
            <SecondaryButtonStyled
              onClick={this.props.onResendSMS}
              id="login-mobile-resend"
            >
              {intl.formatMessage(messages.resend)}
            </SecondaryButtonStyled>
            <PrimaryButton id="login-mobile-submit" disabled={submitting}>
              {intl.formatMessage(messages.submit)}
            </PrimaryButton>
          </ActionWrapper>
        </FormWrapper>
      </StyledBox>
    )
  }
}
