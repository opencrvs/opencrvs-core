import { defineMessages, MessageDescriptor } from 'react-intl'

interface ResetCredentialsFormMessages {
  forgottenItemFormTitle: MessageDescriptor
  forgottenItemFormBodyHeader: MessageDescriptor
  passwordResetPhoneNumberConfirmationFormBodyHeader: MessageDescriptor
  passwordResetPhoneNumberConfirmationFormBodySubheader: MessageDescriptor
  passwordResetRecoveryCodeEntryFormBodyHeader: MessageDescriptor
  passwordResetRecoveryCodeEntryFormBodySubheader: MessageDescriptor
  passwordResetSecurityQuestionFormBodySubheader: MessageDescriptor
  usernameOptionLabel: MessageDescriptor
  passwordOptionLabel: MessageDescriptor
  passwordResetFormTitle: MessageDescriptor
  phoneNumberFieldLabel: MessageDescriptor
  verificationCodeFieldLabel: MessageDescriptor
  answerFieldLabel: MessageDescriptor
  continueButtonLabel: MessageDescriptor
  error: MessageDescriptor
}

const messagesToDefine: ResetCredentialsFormMessages = {
  // Forgotten item form messages
  forgottenItemFormTitle: {
    id: 'title.form.forgottenItem',
    defaultMessage: 'Forgotten username or password',
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
  continueButtonLabel: {
    id: 'label.button.continue',
    defaultMessage: 'Continue',
    description: 'Label used for continue button'
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
