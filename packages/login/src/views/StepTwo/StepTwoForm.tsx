import * as React from 'react'
import { InjectedIntlProps, defineMessages } from 'react-intl'
import { InjectedFormProps, reset } from 'redux-form'
import { InputField } from '@opencrvs/components/lib/InputField'
import { Button } from '@opencrvs/components/lib/Button'
import { FlexGrid } from '@opencrvs/components/lib/grid'
import { Link } from '@opencrvs/components/lib/Link'
import { getFieldProps, getFocusState } from '../../utils/fieldUtils'
import { Field } from 'redux-form'
import { stepTwoFields } from './stepTwoFields'
import { localizeInput } from '../../i18n/components/localizeInput'

import { store } from '../../App'
import {
  StyledBox,
  ErrorText,
  Title,
  FormWrapper,
  ActionWrapper
} from '../StepOne/StepOneForm'
import styled from 'styled-components'
import { IVerifyCodeNumbers } from '@opencrvs/login/src/login/actions'
import { FORM_NAME } from '@opencrvs/login/src/views/StepTwo/contants'

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

const SecondaryButton = styled(Button).attrs({ secondary: true })`
  margin-right: 1em;
`

const LocalizedInputField = localizeInput(InputField)

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
  fieldToFocus?: string
}
export interface IDispatchProps {
  submitAction: (values: IVerifyCodeNumbers) => void
  onResendSMS: () => void
}

type IStepTwoForm = IProps & IDispatchProps

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
      <StyledBox id="login-step-two-box" columns={4}>
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
            <FieldWrapper>
              <Field
                {...getFieldProps(intl, stepTwoFields.code1, messages)}
                component={LocalizedInputField}
                placeholder="0"
                focusInput={getFocusState(stepTwoFields.code1.id, fieldToFocus)}
              />
            </FieldWrapper>
            <Separator>
              <Circle />
            </Separator>
            <FieldWrapper>
              <Field
                {...getFieldProps(intl, stepTwoFields.code2, messages)}
                component={LocalizedInputField}
                placeholder="0"
                focusInput={getFocusState(stepTwoFields.code2.id, fieldToFocus)}
              />
            </FieldWrapper>
            <Separator>
              <Circle />
            </Separator>
            <FieldWrapper>
              <Field
                {...getFieldProps(intl, stepTwoFields.code3, messages)}
                component={LocalizedInputField}
                placeholder="0"
                focusInput={getFocusState(stepTwoFields.code3.id, fieldToFocus)}
              />
            </FieldWrapper>
            <Separator>
              <Circle />
            </Separator>
            <FieldWrapper>
              <Field
                {...getFieldProps(intl, stepTwoFields.code4, messages)}
                component={LocalizedInputField}
                placeholder="0"
                focusInput={getFocusState(stepTwoFields.code4.id, fieldToFocus)}
              />
            </FieldWrapper>
            <Separator>
              <Circle />
            </Separator>
            <FieldWrapper>
              <Field
                {...getFieldProps(intl, stepTwoFields.code5, messages)}
                component={LocalizedInputField}
                placeholder="0"
                focusInput={getFocusState(stepTwoFields.code5.id, fieldToFocus)}
              />
            </FieldWrapper>
            <Separator>
              <Circle />
            </Separator>
            <FieldWrapper>
              <Field
                {...getFieldProps(intl, stepTwoFields.code6, messages)}
                component={LocalizedInputField}
                placeholder="0"
                focusInput={getFocusState(stepTwoFields.code6.id, fieldToFocus)}
              />
            </FieldWrapper>
          </FlexGrid>

          {fieldToFocus && (
            <ClearFormLink id="login-clear-form" onClick={this.clearTheForm}>
              Clear form
            </ClearFormLink>
          )}
          <ActionWrapper>
            <SecondaryButton
              onClick={this.props.onResendSMS}
              id="login-mobile-resend"
            >
              {intl.formatMessage(messages.resend)}
            </SecondaryButton>
            <Button id="login-mobile-submit" disabled={submitting}>
              {intl.formatMessage(messages.submit)}
            </Button>
          </ActionWrapper>
        </FormWrapper>
      </StyledBox>
    )
  }
}
