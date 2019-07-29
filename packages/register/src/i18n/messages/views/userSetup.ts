import { defineMessages } from 'react-intl'

interface IUserSetupMessages {
  header: ReactIntl.FormattedMessage.MessageDescriptor
  instruction: ReactIntl.FormattedMessage.MessageDescriptor
  newPassword: ReactIntl.FormattedMessage.MessageDescriptor
  confirmPassword: ReactIntl.FormattedMessage.MessageDescriptor
  minLength: ReactIntl.FormattedMessage.MessageDescriptor
  validationMsg: ReactIntl.FormattedMessage.MessageDescriptor
  hasCases: ReactIntl.FormattedMessage.MessageDescriptor
  hasNumber: ReactIntl.FormattedMessage.MessageDescriptor
  match: ReactIntl.FormattedMessage.MessageDescriptor
  mismatch: ReactIntl.FormattedMessage.MessageDescriptor
  passwordRequired: ReactIntl.FormattedMessage.MessageDescriptor
  setupCompleteTitle: ReactIntl.FormattedMessage.MessageDescriptor
  userSetupInstruction: ReactIntl.FormattedMessage.MessageDescriptor
  userSetupRevieTitle: ReactIntl.FormattedMessage.MessageDescriptor
  userSetupReviewHeader: ReactIntl.FormattedMessage.MessageDescriptor
  userSetupReviewInstruction: ReactIntl.FormattedMessage.MessageDescriptor
  labelAssignedOffice: ReactIntl.FormattedMessage.MessageDescriptor
  waiting: ReactIntl.FormattedMessage.MessageDescriptor
  labelEnglishName: ReactIntl.FormattedMessage.MessageDescriptor
  labelBanglaName: ReactIntl.FormattedMessage.MessageDescriptor
  userSetupWelcomeTitle: ReactIntl.FormattedMessage.MessageDescriptor
  userSetupIntroduction: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IUserSetupMessages = {
  userSetupWelcomeTitle: {
    id: 'userSetup.landing.title',
    defaultMessage: 'Welcome to OpenCRVS',
    description: 'Title for the landing page'
  },
  userSetupIntroduction: {
    id: 'userSetup.landing.instruction',
    defaultMessage:
      'You just a few steps away from completing your account set up.',
    description: 'Instruction for the account setup langing page'
  },
  labelEnglishName: {
    id: 'settings.user.label.nameEN',
    defaultMessage: 'English name'
  },
  labelBanglaName: {
    id: 'settings.user.label.nameBN',
    defaultMessage: 'Bengali name'
  },
  userSetupRevieTitle: {
    id: 'userSetup.review.title',
    defaultMessage: 'Your details',
    description: 'User setup review page title'
  },
  userSetupReviewHeader: {
    id: 'userSetup.review.header',
    defaultMessage: 'Confirm your details',
    description: 'User setup review page subtitle'
  },
  userSetupReviewInstruction: {
    id: 'userSetupReview.instruction',
    defaultMessage:
      'Check the details below to confirm your account details are correct. and make annecessary changes to confirm your account details are correct.',
    description: 'User setup review page instruction'
  },
  labelAssignedOffice: {
    id: 'label.assignedOffice',
    defaultMessage: 'Assigned office',
    description: 'Assigned office'
  },
  waiting: {
    id: 'user.setup.waiting',
    defaultMessage: 'Setting up your account',
    description:
      'The message that displays when the user is waiting for the account to be created'
  },
  setupCompleteTitle: {
    id: 'userSetup.complete.title',
    defaultMessage: 'Account setup complete',
    description: 'Title for the setup complete page'
  },
  userSetupInstruction: {
    id: 'userSetup.complete.instruction',
    defaultMessage:
      'Now login to your account with your user name and newly created password',
    description: 'Instruction for the setup complete'
  },
  header: {
    id: 'newPassword.header',
    defaultMessage: 'Choose a new password',
    description: 'New Password header'
  },
  instruction: {
    id: 'newPassword.instruction',
    defaultMessage:
      'We recommend you create a unique password - one that you don’t use for another website or app. Note. You can’t reuse your old password once you change it.',
    description: 'New Password instruction'
  },
  newPassword: {
    id: 'password.label.new',
    defaultMessage: 'New password:',
    description: 'New password label'
  },
  confirmPassword: {
    id: 'password.label.confirm',
    defaultMessage: 'Confirm new password',
    description: 'Confirm password label'
  },
  validationMsg: {
    id: 'password.validation.msg',
    defaultMessage: 'Password must have:',
    description: 'Password validation message'
  },
  minLength: {
    id: 'password.minLength',
    defaultMessage: '{min} characters minimum',
    description: 'Password validation'
  },
  hasCases: {
    id: 'password.cases',
    defaultMessage: 'Contain upper and lower cases',
    description: 'Password validation'
  },
  hasNumber: {
    id: 'password.number',
    defaultMessage: 'At least one number',
    description: 'Password validation'
  },
  match: {
    id: 'password.match',
    defaultMessage: 'Passwords match',
    description: 'Password validation'
  },
  mismatch: {
    id: 'password.mismatch',
    defaultMessage: 'Passwords do not match',
    description: 'Password validation'
  },
  passwordRequired: {
    id: 'error.required.password',
    defaultMessage: 'New password is not valid',
    description: 'New password required'
  }
}

export const messages: IUserSetupMessages = defineMessages(messagesToDefine)
