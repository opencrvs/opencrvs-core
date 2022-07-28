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
import * as React from 'react'
import styled from 'styled-components'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { Form, Field } from 'react-final-form'
import {
  TextInput,
  InputField,
  THEME_MODE,
  ErrorMessage
} from '@opencrvs/components/lib/forms'
import { Mobile2FA } from '@opencrvs/components/lib/icons'
import { stepTwoFields } from '@login/views/StepTwo/stepTwoFields'
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
import * as actions from '@login/login/actions'
import { IVerifyCodeNumbers } from '@login/login/actions'
import { PrimaryButton } from '@opencrvs/components/lib/buttons/PrimaryButton'
import { ceil } from 'lodash'
import { messages } from '@login/i18n/messages/views/stepTwoForm'
import { useDispatch } from 'react-redux'

const StyledMobile2FA = styled(Mobile2FA)`
  transform: scale(0.8);
`
const StyledH2 = styled.h2`
  ${({ theme }) => theme.fonts.h2};
  /* stylelint-disable-next-line opencrvs/no-font-styles */
  font-weight: 400;
`
export interface IProps {
  formId: string
  submissionError: boolean
  resentSMS: boolean
  submitting: boolean
  stepOneDetails: { mobile: string }
  applicationName: string | undefined
}
export interface IDispatchProps {
  submitAction: (values: IVerifyCodeNumbers) => void
  onResendSMS: () => void
}

type IStepTwoForm = IProps & IDispatchProps

export type FullProps = IntlShapeProps & IStepTwoForm

export function StepTwoForm({
  intl,
  formId,
  submitAction,
  onResendSMS,
  submitting,
  resentSMS,
  stepOneDetails,
  submissionError,
  applicationName
}: FullProps) {
  const dispatch = useDispatch()

  React.useEffect(() => {
    if (applicationName) document.title = applicationName
  }, [applicationName])

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
            <StyledH2>
              {intl.formatMessage(messages.stepTwoResendTitle)}
            </StyledH2>
            <p>
              {intl.formatMessage(messages.resentSMS, {
                number: mobileNumber
              })}
            </p>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <StyledH2>{intl.formatMessage(messages.stepTwoTitle)}</StyledH2>
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
      <Form
        onSubmit={(values: IVerifyCodeNumbers) =>
          dispatch(actions.verifyCode(values))
        }
      >
        {({ handleSubmit }) => (
          <FormWrapper id={formId} onSubmit={handleSubmit}>
            <FieldWrapper>
              <Field name={field.name} field={field}>
                {({ meta, input, ...otherProps }) => (
                  <InputField
                    {...field}
                    {...otherProps}
                    touched={Boolean(meta.touched)}
                    label={intl.formatMessage(messages.verficationCodeLabel)}
                    optionalLabel={intl.formatMessage(messages.optionalLabel)}
                    ignoreMediaQuery
                    hideAsterisk
                    mode={THEME_MODE.DARK}
                  >
                    <TextInput
                      {...field}
                      {...input}
                      touched={Boolean(meta.touched)}
                      error={Boolean(meta.error)}
                      ignoreMediaQuery
                    />
                  </InputField>
                )}
              </Field>
            </FieldWrapper>

            <ActionWrapper>
              <PrimaryButton
                id="login-mobile-submit"
                disabled={submitting}
                type="submit"
              >
                {intl.formatMessage(messages.verify)}
              </PrimaryButton>{' '}
              <br />
              <StyledButtonWrapper>
                <StyledButton
                  onClick={onResendSMS}
                  id="login-mobile-resend"
                  type="button"
                >
                  {intl.formatMessage(messages.resend)}
                </StyledButton>
              </StyledButtonWrapper>
            </ActionWrapper>
          </FormWrapper>
        )}
      </Form>
    </Container>
  )
}
