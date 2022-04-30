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
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'

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
import { ceil } from 'lodash'
import { messages } from '@login/i18n/messages/views/stepTwoForm'

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
    const maskPercentage = 0.6
    const numberLength = stepOneDetails.mobile.length
    const unmaskedNumberLength =
      numberLength - ceil(maskPercentage * numberLength)
    const startForm = ceil(unmaskedNumberLength / 2)
    const endBefore = unmaskedNumberLength - startForm
    const mobileNumber = stepOneDetails.mobile.replace(
      stepOneDetails.mobile.slice(
        startForm,
        stepOneDetails.mobile.length - endBefore
      ),
      '*'.repeat(stepOneDetails.mobile.length - startForm - endBefore)
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
