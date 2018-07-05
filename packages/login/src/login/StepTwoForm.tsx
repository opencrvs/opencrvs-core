import * as React from 'react'
import { InjectedIntlProps, defineMessages } from 'react-intl'
import { InjectedFormProps } from 'redux-form'
import { InputField } from '@opencrvs/components/lib/InputField'
import { Button } from '@opencrvs/components/lib/Button'
import { FlexGrid } from '@opencrvs/components/lib/grid'
import { getFieldProps } from '../utils/fieldUtils'
import { Field } from 'redux-form'
import { stepTwoFields } from './stepTwoFields'
import { localizeInput } from '../i18n/localizeInput'
import {
  StyledBox,
  ErrorText,
  Title,
  FormWrapper,
  ActionWrapper
} from './StepOneForm'
import styled from 'styled-components'

const messages = defineMessages({
  stepTwoTitle: {
    id: 'login.stepTwoTitle',
    defaultMessage: 'Login to OpenCRVS',
    description: 'The title that appears in step two of the form'
  },
  stepTwoInstruction: {
    id: 'login.stepTwoInstruction',
    defaultMessage: 'Please enter your mobile number and password.',
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

const LocalizedInputField = localizeInput(InputField)

export interface IStepTwoSMSData {
  code1: string
  code2: string
  code3: string
  code4: string
  code5: string
  code6: string
}

export interface IProps {
  formId: string
  submissionError: boolean
}
export interface IDispatchProps {
  submitAction: (values: IStepTwoSMSData) => void
}

type IStepTwoForm = IProps & IDispatchProps

export class StepTwoForm extends React.Component<
  InjectedIntlProps &
    InjectedFormProps<IStepTwoSMSData, IStepTwoForm> &
    IStepTwoForm
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
      <StyledBox id="login-step-two-box" columns={4}>
        <Title>
          <h2>{intl.formatMessage(messages.stepTwoTitle)}</h2>
          <p>{intl.formatMessage(messages.stepTwoInstruction)}</p>
          {submissionError && (
            <ErrorText>
              {intl.formatMessage(messages.codeSubmissionError)}
            </ErrorText>
          )}
        </Title>
        <FormWrapper id={formId} onSubmit={handleSubmit(submitAction)}>
          <FlexGrid>
            <FieldWrapper>
              <Field
                {...getFieldProps(intl, stepTwoFields.code1, messages)}
                component={LocalizedInputField}
                placeholder="0"
                autoFocus={true}
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
              />
            </FieldWrapper>
          </FlexGrid>
          <ActionWrapper>
            <Button id="login-mobile-submit">
              {intl.formatMessage(messages.submit)}
            </Button>
          </ActionWrapper>
        </FormWrapper>
      </StyledBox>
    )
  }
}
