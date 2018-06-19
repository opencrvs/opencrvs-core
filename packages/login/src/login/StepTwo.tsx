import * as React from 'react'
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl'
import { InjectedFormProps } from 'redux-form'
import { Input } from '@opencrvs/components/lib/form/Input'
import { Button } from '@opencrvs/components/lib/Button'
import { StyledBox, Title, FormWrapper, ActionWrapper } from './StepOne'
import styled from 'styled-components'
import { IStepTwoFields } from './type/Login'

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
  }
})

const FieldWrapper = styled.div`
  margin-bottom: 30px;
`

const Separator = styled.div`
  display: block;
  width: 1px;
  border-right: 1px solid ${({ theme }) => theme.colors.secondary};
`

export interface IStepTwo {
  formId: string
  meta: IStepTwoFields
  initialValues: any
  submitAction: (values: any) => void
}
class StepTwoWrapper extends React.Component<
  IStepTwo & InjectedIntlProps & InjectedFormProps<{}, IStepTwo>
> {
  render() {
    const { intl } = this.props
    // TODO: will replace tempMeta with reduxForm meta once we figure out how to set up Fields from JSON
    const tempMeta = {
      error: false,
      touched: false
    }
    return (
      <StyledBox id="login-step-two-box" columns={4}>
        <Title>
          <h2>{intl.formatMessage(messages.stepTwoTitle)}</h2>
          <p>{intl.formatMessage(messages.stepTwoInstruction)}</p>
        </Title>
        <FormWrapper>
          <FieldWrapper>
            <Input
              id="sms-code-1"
              placeholder="0"
              error={tempMeta.error}
              touched={tempMeta.touched}
              maxLength={1}
              type="text"
            />
            <Separator />
            <Input
              id="sms-code-2"
              placeholder="0"
              error={tempMeta.error}
              touched={tempMeta.touched}
              maxLength={1}
              type="text"
            />
            <Separator />
            <Input
              id="sms-code-3"
              placeholder="0"
              error={tempMeta.error}
              touched={tempMeta.touched}
              maxLength={1}
              type="text"
            />
            <Separator />
            <Input
              id="sms-code-4"
              placeholder="0"
              error={tempMeta.error}
              touched={tempMeta.touched}
              maxLength={1}
              type="text"
            />
            <Separator />
            <Input
              id="sms-code-5"
              placeholder="0"
              error={tempMeta.error}
              touched={tempMeta.touched}
              maxLength={1}
              type="text"
            />
            <Separator />
            <Input
              id="sms-code-6"
              placeholder="0"
              error={tempMeta.error}
              touched={tempMeta.touched}
              maxLength={1}
              type="text"
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

export const StepTwo = injectIntl<IStepTwo>(StepTwoWrapper)
