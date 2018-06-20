import * as React from 'react'
import { InjectedIntlProps, defineMessages } from 'react-intl'
import { InjectedFormProps } from 'redux-form'
import { InputField } from '@opencrvs/components/lib/InputField'
import { Button } from '@opencrvs/components/lib/Button'
import { Box } from '@opencrvs/components/lib/Box'
import styled from 'styled-components'
import { getFieldProps, stepOneFields } from '../utils/fields'
import { Field } from 'redux-form'
import { IIntlDynamicProps } from '../i18n/type/CustomIntlTypes'

export const messages = defineMessages({
  stepOneTitle: {
    id: 'login.stepOneTitle',
    defaultMessage: 'Login to OpenCRVS',
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
    defaultMessage: 'e.g: +44-7XXX-XXXXXX',
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
  required: {
    id: 'login.required',
    defaultMessage: 'Required',
    description: 'The error message that appears on required fields'
  },
  minLength: {
    id: 'login.minLength',
    defaultMessage: 'Must be {min} characters or more',
    description:
      'The error message that appears on fields with a minimum length'
  },
  numberRequired: {
    id: 'login.numberRequired',
    defaultMessage: 'Must be a number',
    description:
      'The error message that appears on fields where the value must be a number'
  }
})

const intlDynamicProps: IIntlDynamicProps = {
  minLength: {
    min: 11
  }
}

const customMobileFieldProps = {
  intlDynamicError: intlDynamicProps
}

export const StyledBox = styled(Box)`
  position: absolute;
  height: auto;
  top: 50%;
  right: 50%;
  padding: 0px;
  margin: 0px;
  transform: translate(50%, -50%);
`

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
  float: right;
  margin-top: 10px;
  margin-bottom: 40px;
`

export const Title = styled.div`
  margin: auto;
  margin-top: 30px;
  width: 80%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 90%;
  }
`

const FieldWrapper = styled.div`
  margin-bottom: 30px;
`

export interface IStepOneForm {
  formId: string
  submitAction: (values: any) => void
}

export class StepOneForm extends React.Component<
  InjectedIntlProps & InjectedFormProps<{}, IStepOneForm> & IStepOneForm
> {
  render() {
    const { intl, handleSubmit, formId, submitAction } = this.props
    return (
      <StyledBox id="login-step-one-box" columns={4}>
        <Title>
          <h2>{intl.formatMessage(messages.stepOneTitle)}</h2>
          <p>{intl.formatMessage(messages.stepOneInstruction)}</p>
        </Title>
        <FormWrapper id={formId} onSubmit={handleSubmit(submitAction)}>
          <FieldWrapper>
            <Field
              {...getFieldProps(
                intl,
                stepOneFields.mobile,
                messages,
                customMobileFieldProps
              )}
              component={InputField}
              intl={intl}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Field
              {...getFieldProps(intl, stepOneFields.password, messages)}
              component={InputField}
              intl={intl}
            />
          </FieldWrapper>
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
