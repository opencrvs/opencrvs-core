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
    defaultMessage: 'Enter your phone number',
    description:
      'Form body header used in the body of phone number confirmation step'
  },
  // Email address confirmation form messages
  emailAddressConfirmationFormBodyHeader: {
    id: 'resetCredentials.emailAddressConfirmation.form.body.header',
    defaultMessage: 'Enter your email address',
    description:
      'Form body header used in the body of email address confirmation step'
  },
  // Recovery instructions sent page messages
  recoveryInstructionsSentTitleEmail: {
    id: 'resetCredentials.recoveryInstructionsSent.title.email',
    defaultMessage: 'Check your email',
    description:
      'Title for the recovery instructions sent page when notifications are delivered by email'
  },
  recoveryInstructionsSentTitlePhone: {
    id: 'resetCredentials.recoveryInstructionsSent.title.phone',
    defaultMessage: 'Check your phone',
    description:
      'Title for the recovery instructions sent page when notifications are delivered by SMS'
  },
  recoveryInstructionsSentBody: {
    id: 'resetCredentials.recoveryInstructionsSent.body',
    defaultMessage:
      "If we found an account, you'll receive instructions for {forgottenItem, select, username {retrieving your username} other {resetting your password}}. The link expires in 1 hour.",
    description:
      'Body message for the recovery instructions sent page. Must not assert delivery, since the account may not exist.'
  },
  // Recovery link landing page messages
  recoveryLinkExpiredTitle: {
    id: 'resetCredentials.recoveryLinkLanding.expired.title',
    defaultMessage: 'This link has expired',
    description:
      'Title shown when a recovery link is invalid, expired, or already used'
  },
  recoveryLinkExpiredBody: {
    id: 'resetCredentials.recoveryLinkLanding.expired.body',
    defaultMessage: 'This link is no longer valid. Request a new one to continue.',
    description:
      'Body shown when a recovery link is invalid, expired, or already used. Must not reveal whether the underlying account exists.'
  },
  recoveryLinkExpiredLinkLabel: {
    id: 'resetCredentials.recoveryLinkLanding.expired.link',
    defaultMessage: 'Start again',
    description:
      'Link back to the forgotten item form shown on an expired/invalid recovery link'
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
    defaultMessage: `Create a unique password - one that you don't use for other websites or applications. A secure and easy to remember passphrase could include three random words, while avoiding the use of personal info.`,
    description: 'New Password instruction'
  },
  passwordLengthCharacteristicsForPasswordUpdateForm: {
    id: 'password.minLength',
    defaultMessage: '{min} characters minimum',
    description: 'Password validation'
  },
  passwordCaseCharacteristicsForPasswordUpdateForm: {
    id: 'password.cases',
    defaultMessage: 'At least one upper and lower case character',
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
      '{forgottenItem, select, username {Username reminder sent} password {Passowrd reset successful} other {}}',
    description: 'Title for success page'
  },
  successPageSubtitlePhone: {
    id: 'resetCredentials.success.page.subtitle.phone',
    defaultMessage:
      '{forgottenItem, select, username {Check your phone for a reminder of your username} password {You can now login with your new password} other {}}',
    description: 'Subtitle for success page for phone'
  },
  successPageSubtitleEmail: {
    id: 'resetCredentials.success.page.subtitle.email',
    defaultMessage:
      '{forgottenItem, select, username {Check your email for a reminder of your username} password {You can now login with your new password} other {}}',
    description: 'Subtitle for success page for email'
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
      '{forgottenItem, select, username {Username reminder request} password {Password reset} other {}} ',
    description: 'Title used reset credentials forms'
  },
  phoneNumberFieldLabel: {
    id: 'constants.phoneNumber',
    defaultMessage: 'Phone number',
    description: 'Label used for phone number input field'
  },
  emailAddressFieldLabel: {
    id: 'constants.emailAddress',
    defaultMessage: 'Email Address',
    description: 'Label used for email address input field'
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
  backToLoginButtonLabel: {
    id: 'buttons.backToLogin',
    defaultMessage: 'Back to login',
    description:
      'Label used to leave a screen that is waiting on an emailed link, where logging in is not yet possible'
  },
  error: {
    id: 'label.error',
    defaultMessage: 'Invalid input',
    description: 'Generic error message for invalid form nput'
  }
}

export const messages = defineMessages(messagesToDefine)
