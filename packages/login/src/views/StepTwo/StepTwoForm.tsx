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
import { Field, WrappedFieldProps, InjectedFormProps } from 'redux-form'
import * as React from 'react'
import styled from 'styled-components'
import {
  WrappedComponentProps as IntlShapeProps,
  defineMessages,
  injectIntl,
  MessageDescriptor
} from 'react-intl'

import {
  TextInput,
  InputField,
  THEME_MODE,
  ErrorMessage
} from '@opencrvs/components/lib/forms'
import { Mobile2FA } from '@opencrvs/components/lib/icons'
import { stepTwoFields } from '@login/views/StepTwo/stepTwoFields'
import { getMSISDNCountryCode } from '@login/utils/dataCleanse'
import {
  Title,
  FormWrapper,
  ActionWrapper,
  Container,
  LogoContainer,
  StyledButton,
  StyledButtonWrapper,
  FieldWrapper
} from '@login/views/StepOne/StepOneForm'

import { IVerifyCodeNumbers } from '@login/login/actions'
import { Ii18nReduxFormFieldProps } from '@login/utils/fieldUtils'

import { PrimaryButton } from '@opencrvs/components/lib/buttons/PrimaryButton'

export const messages: {
  [key: string]: MessageDescriptor
} = defineMessages({
  stepTwoTitle: {
    id: 'login.stepTwoTitle',
    defaultMessage: 'Verify your mobile',
    description: 'The title that appears in step two of the form'
  },
  stepTwoResendTitle: {
    id: 'login.stepTwoResendTitle',
    defaultMessage: 'Verification code resent',
    description:
      'The title that appears in step two of the form after resend button click'
  },
  resend: {
    id: 'login.resendMobile',
    defaultMessage: 'Resend SMS',
    description: 'Text for button that resends SMS verification code'
  },
  stepTwoInstruction: {
    id: 'login.stepTwoInstruction',
    defaultMessage:
      'A verification code has been sent to your phone. ending in {number}. This code will be valid for 5 minutes.',
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
    defaultMessage: 'We just resent you another code to {number}',
    description: 'The message that appears when the resend button is clicked.'
  },
  optionalLabel: {
    id: 'login.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  },
  verficationCodeLabel: {
    id: 'login.verficationCodeLabel',
    defaultMessage: 'Verification code (6 digits)',
    description: 'Verification code label'
  }
})

const StyledMobile2FA = styled(Mobile2FA)`
  transform: scale(0.8);
`
export interface IProps {
  formId: string
  submissionError: boolean
  resentSMS: boolean
  submitting: boolean
  stepOneDetails: { mobile: string }
}
export interface IDispatchProps {
  submitAction: (values: IVerifyCodeNumbers) => void
  onResendSMS: () => void
}

type IStepTwoForm = IProps & IDispatchProps

export type FullProps = IntlShapeProps &
  InjectedFormProps<IVerifyCodeNumbers, IStepTwoForm> &
  IStepTwoForm
const CodeInput = injectIntl(
  (
    props: WrappedFieldProps & {
      field: Ii18nReduxFormFieldProps
    } & IntlShapeProps
  ) => {
    const { field, meta, intl, ...otherProps } = props
    return (
      <InputField
        {...field}
        {...otherProps}
        touched={meta.touched}
        label={intl.formatMessage(messages.verficationCodeLabel)}
        optionalLabel={intl.formatMessage(messages.optionalLabel)}
        ignoreMediaQuery
        hideAsterisk
        mode={THEME_MODE.DARK}
      >
        <TextInput
          {...field}
          {...props.input}
          touched={Boolean(meta.touched)}
          error={Boolean(meta.error)}
          ignoreMediaQuery
        />
      </InputField>
    )
  }
)

export class StepTwoForm extends React.Component<FullProps> {
  render() {
    const {
      intl,
      handleSubmit,
      formId,
      submitAction,
      submitting,
      resentSMS,
      stepOneDetails,
      submissionError
    } = this.props
    const maskPattern = window.config.PHONE_NUMBER_PATTERN.mask
    const mobileNumber = stepOneDetails.mobile.replace(
      stepOneDetails.mobile.slice(
        maskPattern.startForm,
        stepOneDetails.mobile.length - maskPattern.endBefore
      ),
      '*'.repeat(
        stepOneDetails.mobile.length -
          maskPattern.startForm -
          maskPattern.endBefore
      )
    )
    const field = stepTwoFields.code
    return (
      <Container id="login-step-two-box">
        <Title>
          <LogoContainer>
            <StyledMobile2FA />
          </LogoContainer>
          {resentSMS ? (
            <React.Fragment>
              <h2>{intl.formatMessage(messages.stepTwoResendTitle)}</h2>
              <p>
                {intl.formatMessage(messages.resentSMS, {
                  number: mobileNumber
                })}
              </p>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <h2>{intl.formatMessage(messages.stepTwoTitle)}</h2>
              <p>
                {intl.formatMessage(messages.stepTwoInstruction, {
                  number: mobileNumber
                })}
              </p>
            </React.Fragment>
          )}

          {submissionError && (
            <ErrorMessage>
              {intl.formatMessage(messages.codeSubmissionError)}
            </ErrorMessage>
          )}
        </Title>
        <FormWrapper id={formId} onSubmit={handleSubmit(submitAction)}>
          <FieldWrapper>
            <Field
              name={field.name}
              validate={field.validate}
              component={CodeInput}
              field={field}
            />
          </FieldWrapper>

          <ActionWrapper>
            <PrimaryButton
              id="login-mobile-submit"
              disabled={submitting}
              type="submit"
            >
              {intl.formatMessage(messages.submit)}
            </PrimaryButton>{' '}
            <br />
            <StyledButtonWrapper>
              <StyledButton
                onClick={this.props.onResendSMS}
                id="login-mobile-resend"
                type="button"
              >
                {intl.formatMessage(messages.resend)}
              </StyledButton>
            </StyledButtonWrapper>
          </ActionWrapper>
        </FormWrapper>
      </Container>
    )
  }
}
