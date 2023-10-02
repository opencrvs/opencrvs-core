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
import { defineMessages, MessageDescriptor } from 'react-intl'

interface IStepOneFormMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  networkError: MessageDescriptor
  stepOneTitle: MessageDescriptor
  stepOneInstruction: MessageDescriptor
  submit: MessageDescriptor
  forgotPassword: MessageDescriptor
  submissionError: MessageDescriptor
  forbiddenCredentialError: MessageDescriptor
  optionalLabel: MessageDescriptor
  fieldMissing: MessageDescriptor
  phoneNumberFormat: MessageDescriptor
  stepOneLoginText: MessageDescriptor
}

const messagesToDefine: IStepOneFormMessages = {
  networkError: {
    id: 'error.networkError',
    defaultMessage: 'Unable to connect to server',
    description: 'The error that appears when there is no internet connection'
  },
  stepOneTitle: {
    id: 'buttons.login',
    defaultMessage: 'Login',
    description: 'The title that appears in step one of the form'
  },
  stepOneInstruction: {
    id: 'login.stepOneInstruction',
    defaultMessage: 'Please enter your mobile number and password.',
    description: 'The instruction that appears in step one of the form'
  },

  stepOneLoginText: {
    id: 'login.stepOneText',
    defaultMessage: 'Login to Farajaland CRVS',
    description: 'The instruction that appears in step one of the login form'
  },
  submit: {
    id: 'login.submit',
    defaultMessage: 'Login',
    description: 'The label that appears on the submit button'
  },
  forgotPassword: {
    id: 'login.forgotPassword',
    defaultMessage: 'Forgot password',
    description: 'The label that appears on the Forgot password button'
  },
  submissionError: {
    id: 'login.submissionError',
    defaultMessage: 'Sorry that mobile number and password did not work.',
    description:
      'The error that appears when the user entered details are unauthorised'
  },
  forbiddenCredentialError: {
    id: 'login.forbiddenCredentialError',
    defaultMessage: 'Sorry given user is not allowed to login.',
    description:
      'The error that appears when the user entered details are forbidden'
  },
  optionalLabel: {
    id: 'login.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  },
  fieldMissing: {
    id: 'login.fieldMissing',
    defaultMessage: 'Mobile number and password must be provided',
    description: "The error if user doesn't fill all the field"
  },
  phoneNumberFormat: {
    id: 'validations.phoneNumberFormat',
    defaultMessage: 'Must be a valid 10 digit number that starts with 0(7|9)',
    description:
      'The error message that appears on phone numbers where the first character must be a 0'
  }
}

export const messages: IStepOneFormMessages = defineMessages(messagesToDefine)
