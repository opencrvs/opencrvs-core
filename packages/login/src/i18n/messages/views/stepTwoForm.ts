/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { MessageDescriptor, defineMessages } from 'react-intl'

interface IStepTwoFormMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  stepTwoTitle: MessageDescriptor
  stepTwoResendTitle: MessageDescriptor
  resend: MessageDescriptor
  stepTwoInstructionSMS: MessageDescriptor
  stepTwoInstructionEMAIL: MessageDescriptor
  submit: MessageDescriptor
  codeSubmissionError: MessageDescriptor
  resentSMS: MessageDescriptor
  resentEMAIL: MessageDescriptor
  optionalLabel: MessageDescriptor
  verficationCodeLabel: MessageDescriptor
}

const messagesToDefine: IStepTwoFormMessages = {
  stepTwoTitle: {
    id: 'login.stepTwoTitle',
    defaultMessage: 'Verify your account',
    description: 'The title that appears in step two of the form'
  },
  stepTwoResendTitle: {
    id: 'login.stepTwoResendTitle',
    defaultMessage: 'Verification code resent',
    description:
      'The title that appears in step two of the form after resend button click'
  },
  resend: {
    id: 'login.resend',
    defaultMessage: 'Resend SMS',
    description: 'Text for button that resends SMS or email verification code'
  },
  stepTwoInstructionSMS: {
    id: 'login.stepTwoInstruction.sms',
    defaultMessage:
      'A verification code has been sent to your phone. ending in {number}. This code will be valid for 10 minutes.',
    description:
      'The instruction that appears in step two of the form that lets users know that code has been sent to phone'
  },
  stepTwoInstructionEMAIL: {
    id: 'login.stepTwoInstruction.email',
    defaultMessage:
      'A verification code has been sent to your email. ending in {email}. This code will be valid for 10 minutes.',
    description:
      'The instruction that appears in step two of the form that lets users know that code has been sent to email'
  },
  submit: {
    id: 'login.submit',
    defaultMessage: 'Submit',
    description: 'The label that appears on the submit button'
  },
  verify: {
    id: 'login.verify',
    defaultMessage: 'Verify',
    description: 'The label that appears on the verify code button'
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
    description:
      'The message that appears when the resend button is clicked and tells user than code is resent to email'
  },
  resentEMAIL: {
    id: 'login.resentEMAIL',
    defaultMessage: 'We just resent you another code to {email}',
    description:
      'The message that appears when the resend button is clicked and tells user than code is resent to email'
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
}

export const messages: IStepTwoFormMessages = defineMessages(messagesToDefine)
