import * as React from 'react'
import { InjectedIntlProps, defineMessages } from 'react-intl'
import styled from 'styled-components'
import { InjectedFormProps } from 'redux-form'
import { InputField } from '@opencrvs/components/lib/forms'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

import { registrationFields } from './registrationFields'
import { getFieldProps } from '../utils/fieldUtils'
import { Field } from 'redux-form'
import { localizeInput } from '../i18n/localizeInput'

export const messages = defineMessages({
  registrationTitle: {
    id: 'registration.registrationTitle',
    defaultMessage: 'Register a child',
    description: 'The title that appears on the form'
  },
  registrationInstruction: {
    id: 'registration.registrationInstruction',
    defaultMessage: "Please enter the child's details.",
    description: 'The instruction that appears on the form'
  },
  firstNameLabel: {
    id: 'registration.firstNameLabel',
    defaultMessage: "Child's first name",
    description: 'The label that appears on the first name input'
  },
  firstNamePlaceholder: {
    id: 'registration.firstNamePlaceholder',
    defaultMessage: 'First name',
    description: 'The placeholder that appears on the first name input'
  },
  submit: {
    id: 'registration.submit',
    defaultMessage: 'Submit',
    description: 'The label that appears on the submit button'
  },
  submissionError: {
    id: 'registration.submissionError',
    defaultMessage: 'Sorry those details did not work.',
    description:
      'The error that appears when the user entered details are invalid'
  }
})

export const FormWrapper = styled.form`
  position: relative;
  margin: auto;
  width: 80%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 90%;
  }
  margin-bottom: 50px;
  padding-top: 20px;
`

export const ActionWrapper = styled.div`
  position: relative;
  margin-top: 10px;
  display: flex;
`

export const Title = styled.div`
  margin: auto;
  margin-top: 30px;
  width: 80%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 90%;
  }
`

export const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
`

const FieldWrapper = styled.div`
  margin-bottom: 30px;
`

export interface IRegistrationData {
  firstName: string
}

export interface IProps {
  formId: string
  submissionError: boolean
}
export interface IDispatchProps {
  submitAction: (values: IRegistrationData) => void
}

type IRegistrationForm = IProps & IDispatchProps

const LocalizedInputField = localizeInput(InputField)

export class RegistrationForm extends React.Component<
  InjectedIntlProps &
    InjectedFormProps<IRegistrationData, IRegistrationForm> &
    IRegistrationForm
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
      <div>
        <Title>
          <h2>{intl.formatMessage(messages.registrationTitle)}</h2>
          <p>{intl.formatMessage(messages.registrationInstruction)}</p>
          {submissionError && (
            <ErrorText>
              {intl.formatMessage(messages.submissionError)}
            </ErrorText>
          )}
        </Title>
        <FormWrapper id={formId} onSubmit={handleSubmit(submitAction)}>
          <FieldWrapper>
            <Field
              {...getFieldProps(intl, registrationFields.firstName, messages)}
              component={LocalizedInputField}
            />
          </FieldWrapper>
          <ActionWrapper>
            <PrimaryButton id="registration-submit" type="submit">
              {intl.formatMessage(messages.submit)}
            </PrimaryButton>
          </ActionWrapper>
        </FormWrapper>
      </div>
    )
  }
}
