import { defineMessages, MessageDescriptor } from 'react-intl'

interface ResetCredentialsFormMessages {
  forgottenItemFormTitle: MessageDescriptor
  forgottenItemFormBodyHeader: MessageDescriptor
  passwordResetPhoneNumberConfirmationFormBodyHeader: MessageDescriptor
  passwordResetPhoneNumberConfirmationFormBodySubheader: MessageDescriptor
  passwordResetRecoveryCodeEntryFormBodyHeader: MessageDescriptor
  passwordResetRecoveryCodeEntryFormBodySubheader: MessageDescriptor
  passwordResetSecurityQuestionFormBodySubheader: MessageDescriptor
  passwordResetUpdateFormBodyHeader: MessageDescriptor
  passwordResetUpdateFormBodySubheader: MessageDescriptor
  passwordLengthCharacteristicsForPasswordResetUpdateForm: MessageDescriptor
  passwordCaseCharacteristicsForPasswordResetUpdateForm: MessageDescriptor
  passwordNumberCharacteristicsForPasswordResetUpdateForm: MessageDescriptor
  passwordResetUpdateFormValidationMsg: MessageDescriptor

  passwordUpdateSuccessPageTitle: MessageDescriptor
  passwordUpdateSuccessPageSubtitle: MessageDescriptor

  usernameOptionLabel: MessageDescriptor
  passwordOptionLabel: MessageDescriptor
  passwordResetFormTitle: MessageDescriptor
  phoneNumberFieldLabel: MessageDescriptor
  verificationCodeFieldLabel: MessageDescriptor
  answerFieldLabel: MessageDescriptor
  newPasswordLabel: MessageDescriptor
  confirmPasswordLabel: MessageDescriptor
  matchedPasswordMsg: MessageDescriptor
  mismatchedPasswordMsg: MessageDescriptor
  passwordRequiredMsg: MessageDescriptor
  continueButtonLabel: MessageDescriptor
  confirmButtonLabel: MessageDescriptor
  loginButtonLabel: MessageDescriptor
  error: MessageDescriptor
}

const messagesToDefine: ResetCredentialsFormMessages = {
  // Forgotten item form messages
  forgottenItemFormTitle: {
    id: 'title.form.forgottenItem',
    defaultMessage: "Can't login",
    description: 'Title used for forgotten item form'
  },
  forgottenItemFormBodyHeader: {
    id: 'header.body.form.forgottenItem',
    defaultMessage: 'What have you forgotten?',
    description: 'Body header for forgotten item form'
  },

  // Phone number confirmation form messages
  passwordResetPhoneNumberConfirmationFormBodyHeader: {
    id: 'header.body.form.phoneNumberConfirmation.passwordreset',
    defaultMessage: 'What is your phone number?',
    description:
      'Form body header used in the body of phone number confirmation step of password reset form'
  },
  passwordResetPhoneNumberConfirmationFormBodySubheader: {
    id: 'subheader.body.form.phoneNumberConfirmation.passwordreset',
    defaultMessage: 'This is the number assoricated with your account',
    description:
      'Form body subheader used in the body of phone number confirmation step of password reset form'
  },

  // Recovery code entry form messages
  passwordResetRecoveryCodeEntryFormBodyHeader: {
    id: 'header.body.form.recoveryCodeEntry.passwordReset',
    defaultMessage: 'Enter the 6-digit recovery code',
    description:
      'Form body header used for recovery code entry step of password reset form'
  },
  passwordResetRecoveryCodeEntryFormBodySubheader: {
    id: 'subheader.body.form.recoveryCodeEntry.passwordReset',
    defaultMessage:
      "The recovery code was sent to your phone number. Please enter the code. Didn't receive it?",
    description:
      'Form body subheader used for recovery code entry step of password reset form'
  },

  // Security question form messages
  passwordResetSecurityQuestionFormBodySubheader: {
    id: 'subheader.body.form.securityQuestion.passwordReset',
    defaultMessage:
      'This is one of the security questions you choose when setting up your account',
    description:
      'Form body subheader used for security question step of password reset form'
  },

  // Password confirmation form messages
  passwordResetUpdateFormBodyHeader: {
    defaultMessage: 'Choose a new password',
    description: 'New Password header',
    id: 'newPassword.header'
  },
  passwordResetUpdateFormBodySubheader: {
    defaultMessage:
      'We recommend you create a unique password - one that you don’t use for another website or app. Note. You can’t reuse your old password once you change it.',
    description: 'New Password instruction',
    id: 'newPassword.instruction'
  },
  passwordLengthCharacteristicsForPasswordResetUpdateForm: {
    defaultMessage: '{min} characters minimum',
    description: 'Password validation',
    id: 'password.minLength'
  },
  passwordCaseCharacteristicsForPasswordResetUpdateForm: {
    defaultMessage: 'Contain upper and lower cases',
    description: 'Password validation',
    id: 'password.cases'
  },
  passwordNumberCharacteristicsForPasswordResetUpdateForm: {
    defaultMessage: 'At least one number',
    description: 'Password validation',
    id: 'password.number'
  },
  passwordResetUpdateFormValidationMsg: {
    defaultMessage: 'Password must have:',
    description: 'Password validation message',
    id: 'password.validation.msg'
  },

  // Password update success page messages
  passwordUpdateSuccessPageTitle: {
    defaultMessage: 'Passowrd reset successful',
    description: 'Title for password update success page',
    id: 'title.password.update.success.page'
  },
  passwordUpdateSuccessPageSubtitle: {
    defaultMessage: 'You can now login with your new password',
    description: 'Subtitle for password update success page',
    id: 'subtitle.password.update.success.page'
  },

  usernameOptionLabel: {
    id: 'option.username',
    defaultMessage: 'My username',
    description: 'Option used for username'
  },
  passwordOptionLabel: {
    id: 'option.password',
    defaultMessage: 'My password',
    description: 'Option used for password'
  },
  passwordResetFormTitle: {
    id: 'title.form.passwordReset',
    defaultMessage: 'Password reset',
    description: 'Form title used for password reset form'
  },
  phoneNumberFieldLabel: {
    id: 'label.field.phoneNumber',
    defaultMessage: 'Phone number',
    description: 'Label used for phone number input field'
  },
  verificationCodeFieldLabel: {
    id: 'label.field.verificationCode',
    defaultMessage: 'Verification code (6 digits)',
    description: 'Label used for verification code input field'
  },
  answerFieldLabel: {
    id: 'label.field.answer',
    defaultMessage: 'Answer',
    description: 'Label used for answer input field'
  },
  newPasswordLabel: {
    defaultMessage: 'New password:',
    description: 'New password label',
    id: 'password.label.new'
  },
  confirmPasswordLabel: {
    defaultMessage: 'Confirm new password',
    description: 'Confirm password label',
    id: 'password.label.confirm'
  },
  matchedPasswordMsg: {
    defaultMessage: 'Passwords match',
    description: 'Password validation',
    id: 'password.match'
  },
  mismatchedPasswordMsg: {
    defaultMessage: 'Passwords do not match',
    description: 'Password validation',
    id: 'password.mismatch'
  },
  passwordRequiredMsg: {
    defaultMessage: 'New password is not valid',
    description: 'New password required',
    id: 'error.required.password'
  },
  continueButtonLabel: {
    id: 'label.button.continue',
    defaultMessage: 'Continue',
    description: 'Label used for continue button'
  },
  confirmButtonLabel: {
    id: 'label.button.confirm',
    defaultMessage: 'Confirm',
    description: 'Label used for confirm button'
  },
  loginButtonLabel: {
    defaultMessage: 'Login',
    description: 'Label used for login button',
    id: 'label.button.login'
  },
  error: {
    id: 'label.error',
    defaultMessage: 'Invalid input',
    description: 'Generic error message for invalid form nput'
  }
}

export const messages: ResetCredentialsFormMessages = defineMessages(
  messagesToDefine
)
