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
import { defineMessages } from 'react-intl'

const messagesToDefine = {
  // Forgotten item form messages
  forgottenItemFormTitle: {
    id: 'resetCredentials.forgottenItem.form.title',
    defaultMessage: "Can't login",
    description: 'Title used for forgotten item form'
  },
  forgottenItemFormBodyHeader: {
    id: 'resetCredentials.forgottenItem.form.body.header',
    defaultMessage: 'What have you forgotten?',
    description: 'Body header for forgotten item form'
  },

  // Phone number confirmation form messages
  phoneNumberConfirmationFormBodyHeader: {
    id: 'resetCredentials.phoneNumberConfirmation.form.body.header',
    defaultMessage: 'What is your phone number?',
    description:
      'Form body header used in the body of phone number confirmation step'
  },
  phoneNumberConfirmationFormBodySubheader: {
    id: 'resetCredentials.phoneNumberConfirmation.form.body.subheader',
    defaultMessage: 'This is the number assoricated with your account',
    description:
      'Form body subheader used in the body of phone number confirmation step'
  },
  // Recovery code entry form messages
  recoveryCodeEntryFormBodyHeader: {
    id: 'resetCredentials.recoveryCodeEntry.form.body.header',
    defaultMessage: 'Enter the 6-digit recovery code',
    description: 'Form body header used for recovery code entry step'
  },
  recoveryCodeEntryFormBodySubheader: {
    id: 'resetCredentials.recoveryCodeEntry.form.body.subheader',
    defaultMessage:
      "The recovery code was sent to your phone number. Please enter the code. Didn't receive it?",
    description: 'Form body subheader used for recovery code entry step'
  },
  codeResentTitle: {
    id: 'resetCredentials.recoveryCodeEntry.codeResent.form.body.header',
    defaultMessage: 'Verification code resent',
    description:
      'The title that appears in step two of the form after resend button click'
  },
  resentSMS: {
    id: 'resetCredentials.recoveryCodeEntry.codeResent.form.body.subheader',
    defaultMessage: 'We just resent you another code to {number}.',
    description: 'The message that appears when the resend button is clicked.'
  },
  // Security question form messages
  securityQuestionFormBodySubheader: {
    id: 'resetCredentials.securityQuestion.form.body.subheader',
    defaultMessage:
      'This is one of the security questions you choose when setting up your account',
    description: 'Form body subheader used for security question step'
  },

  // Password confirmation form messages
  passwordUpdateFormBodyHeader: {
    id: 'misc.newPass.header',
    defaultMessage: 'Choose a new password',
    description: 'New Password header'
  },
  passwordUpdateFormBodySubheader: {
    id: 'misc.newPass.instruction',
    defaultMessage:
      'We recommend you create a unique password - one that you don’t use for another website or app. Note. You can’t reuse your old password once you change it.',
    description: 'New Password instruction'
  },
  passwordLengthCharacteristicsForPasswordUpdateForm: {
    id: 'password.minLength',
    defaultMessage: '{min} characters minimum',
    description: 'Password validation'
  },
  passwordCaseCharacteristicsForPasswordUpdateForm: {
    id: 'password.cases',
    defaultMessage: 'Contain upper and lower cases',
    description: 'Password validation'
  },
  passwordNumberCharacteristicsForPasswordUpdateForm: {
    id: 'password.number',
    defaultMessage: 'At least one number',
    description: 'Password validation'
  },
  passwordUpdateFormValidationMsg: {
    id: 'password.validation.msg',
    defaultMessage: 'Password must have:',
    description: 'Password validation message'
  },

  // Password update success page messages
  successPageTitle: {
    id: 'resetCredentials.success.page.title',
    defaultMessage:
      '{forgottenItem, select, username {Username reminder sent} password {Passowrd reset successful}}',
    description: 'Title for success page'
  },
  successPageSubtitle: {
    id: 'resetCredentials.success.page.subtitle',
    defaultMessage:
      '{forgottenItem, select, username {Check your phone for a reminder of your username} password {You can now login with your new password}}',
    description: 'Subtitle for success page'
  },

  usernameOptionLabel: {
    id: 'resetCredentials.option.username',
    defaultMessage: 'My username',
    description: 'Option used for username'
  },
  passwordOptionLabel: {
    id: 'resetCredentials.option.password',
    defaultMessage: 'My password',
    description: 'Option used for password'
  },
  credentialsResetFormTitle: {
    id: 'resetCredentials.form.title',
    defaultMessage:
      '{forgottenItem, select, username {Username reminder request} password {Password reset}}',
    description: 'Title used reset credentials forms'
  },
  phoneNumberFieldLabel: {
    id: 'constants.phoneNumber',
    defaultMessage: 'Phone number',
    description: 'Label used for phone number input field'
  },
  verificationCodeFieldLabel: {
    id: 'resetCredentials.label.field.verificationCode',
    defaultMessage: 'Verification code (6 digits)',
    description: 'Label used for verification code input field'
  },
  answerFieldLabel: {
    id: 'resetCredentials.label.field.answer',
    defaultMessage: 'Answer',
    description: 'Label used for answer input field'
  },
  newPasswordLabel: {
    id: 'password.label.new',
    defaultMessage: 'New password:',
    description: 'New password label'
  },
  confirmPasswordLabel: {
    id: 'password.label.confirm',
    defaultMessage: 'Confirm new password',
    description: 'Confirm password label'
  },
  matchedPasswordMsg: {
    id: 'password.match',
    defaultMessage: 'Passwords match',
    description: 'Password validation'
  },
  mismatchedPasswordMsg: {
    id: 'password.mismatch',
    defaultMessage: 'Passwords do not match',
    description: 'Password validation'
  },
  passwordRequiredMsg: {
    id: 'error.required.password',
    defaultMessage: 'New password is not valid',
    description: 'New password required'
  },
  continueButtonLabel: {
    id: 'buttons.continue',
    defaultMessage: 'Continue',
    description: 'Label used for continue button'
  },
  confirmButtonLabel: {
    id: 'buttons.confirm',
    defaultMessage: 'Confirm',
    description: 'Label used for confirm button'
  },
  loginButtonLabel: {
    id: 'buttons.login',
    defaultMessage: 'Login',
    description: 'Label used for login button'
  },
  error: {
    id: 'label.error',
    defaultMessage: 'Invalid input',
    description: 'Generic error message for invalid form nput'
  },
  errorPhoneNumberNotFound: {
    id: 'error.errorPhoneNumberNotFound',
    defaultMessage: 'Mobile phone number not found.',
    description: 'Error message for phone number not found'
  },
  resend: {
    id: 'resend.sms',
    defaultMessage: 'Resend SMS',
    description: 'Text for button that resends SMS verification code'
  }
}

export const messages = defineMessages(messagesToDefine)
