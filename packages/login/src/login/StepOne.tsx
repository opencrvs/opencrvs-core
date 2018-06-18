import * as React from 'react'
import { InjectedIntlProps } from 'react-intl'
import { InjectedFormProps } from 'redux-form'
import { InputField } from '@opencrvs/components/lib/InputField'
import { Button } from '@opencrvs/components/lib/Button'
import { Box } from '@opencrvs/components/lib/Box'
import styled from 'styled-components'
import { messages } from '../i18n/messages'
import { IStepOneFields } from './type/StepOne'

const StyledBox = styled(Box)`
  position: absolute;
  height: auto;
  top: 50%;
  right: 50%;
  padding: 0px;
  margin: 0px;
  transform: translate(50%, -50%);
`

const FormWrapper = styled.form`
  position: relative;
  margin: auto;
  width: 80%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 90%;
  }
  margin-bottom: 50px;
  padding-top: 20px;
`

const ActionWrapper = styled.div`
  position: relative;
  float: right;
  margin-top: 10px;
  margin-bottom: 40px;
`

const Title = styled.div`
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

export interface IStepOne {
  formId: string
  meta: IStepOneFields
  initialValues: any
  submitAction: (values: any) => void
}
export class StepOne extends React.Component<
  IStepOne & InjectedIntlProps & InjectedFormProps<{}, IStepOne>
> {
  render() {
    const { intl, handleSubmit, formId, submitAction } = this.props
    // TODO: will replace tempMeta with reduxForm meta once we figure out how to set up Fields from JSON
    const tempMeta = {
      touched: false
    }
    return (
      <StyledBox id="login-step-one-box" columns={4}>
        <Title>
          <h2>{intl.formatMessage(messages.stepOneTitle)}</h2>
          <p>{intl.formatMessage(messages.stepOneInstruction)}</p>
        </Title>
        <FormWrapper id={formId} onSubmit={handleSubmit(submitAction)}>
          <FieldWrapper>
            <InputField
              id="mobile-number"
              label={intl.formatMessage(messages.mobileNumberLabel)}
              placeholder={intl.formatMessage(messages.mobileNumberPlaceholder)}
              type="text"
              disabled={false}
              meta={tempMeta}
            />
          </FieldWrapper>
          <FieldWrapper>
            <InputField
              id="password"
              label={intl.formatMessage(messages.passwordLabel)}
              type="password"
              disabled={false}
              meta={tempMeta}
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
