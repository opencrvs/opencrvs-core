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
import { useIntl } from 'react-intl'
import { Field, Form } from 'react-final-form'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import { stepTwoFields } from '@login/views/StepTwo/stepTwoFields'
import { Text } from '@opencrvs/components/lib/Text'

import * as actions from '@login/login/actions'
import { IVerifyCodeNumbers, resetSubmissionError } from '@login/login/actions'
import { ceil } from 'lodash'
import { messages } from '@login/i18n/messages/views/stepTwoForm'
import { useDispatch, useSelector } from 'react-redux'
import { Box } from '@login/../../components/lib/Box'
import {
  getResentSMS,
  getStepOneDetails,
  getSubmissionError,
  getsubmitting,
  selectApplicationName
} from '@login/login/selectors'
import { Toast } from '@opencrvs/components'
import { usePersistentCountryLogo } from '@login/common/LoginBackgroundWrapper'
import {
  Container,
  FormWrapper,
  LogoContainer,
  StyledH2
} from '@login/views/Common'
import { Link } from '@opencrvs/components/lib/Link/Link'
import { Stack } from '@opencrvs/components/lib/Stack/Stack'
import { Button } from '@opencrvs/components/lib/Button'

const FORM_NAME = 'STEP_TWO'

export function StepTwoContainer() {
  const dispatch = useDispatch()
  const logo = usePersistentCountryLogo()

  const submitting = useSelector(getsubmitting)

  const submissionError = useSelector(getSubmissionError)
  const resentSMS = useSelector(getResentSMS)

  const stepOneDetails = useSelector(getStepOneDetails)
  const intl = useIntl()

  const appName = useSelector(selectApplicationName)

  React.useEffect(() => {
    if (appName) document.title = appName
  }, [appName])

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
      <Box id="Box">
        <LogoContainer>
          <CountryLogo src={logo} />
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

            <Text variant="reg16" element="p">
              {intl.formatMessage(messages.stepTwoInstruction, {
                number: mobileNumber
              })}
            </Text>
          </React.Fragment>
        )}

        <Form
          onSubmit={(values: IVerifyCodeNumbers) =>
            dispatch(actions.verifyCode(values))
          }
        >
          {({ handleSubmit }) => (
            <FormWrapper id={FORM_NAME} onSubmit={handleSubmit}>
              <Stack direction="column" alignItems="stretch" gap={16}>
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
                <Button
                  size="medium"
                  type="primary"
                  id="login-mobile-submit"
                  disabled={submitting}
                >
                  {intl.formatMessage(messages.verify)}
                </Button>

                <Link
                  onClick={() => dispatch(actions.resendSMS())}
                  id="login-mobile-resend"
                  type="button"
                >
                  {intl.formatMessage(messages.resend)}
                </Link>
              </Stack>
            </FormWrapper>
          )}
        </Form>
      </Box>
      {submissionError && (
        <Toast type="error" onClose={() => dispatch(resetSubmissionError())}>
          {intl.formatMessage(messages.codeSubmissionError)}
        </Toast>
      )}
    </Container>
  )
}
