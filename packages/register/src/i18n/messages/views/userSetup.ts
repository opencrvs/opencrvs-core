import { defineMessages, MessageDescriptor } from 'react-intl'

interface IUserSetupMessages {
  confirmPassword: MessageDescriptor
  hasCases: MessageDescriptor
  hasNumber: MessageDescriptor
  header: MessageDescriptor
  instruction: MessageDescriptor
  labelAssignedOffice: MessageDescriptor
  labelBanglaName: MessageDescriptor
  labelEnglishName: MessageDescriptor
  match: MessageDescriptor
  minLength: MessageDescriptor
  mismatch: MessageDescriptor
  newPassword: MessageDescriptor
  passwordRequired: MessageDescriptor
  setupCompleteTitle: MessageDescriptor
  userSetupInstruction: MessageDescriptor
  userSetupIntroduction: MessageDescriptor
  userSetupRevieTitle: MessageDescriptor
  userSetupReviewHeader: MessageDescriptor
  userSetupReviewInstruction: MessageDescriptor
  userSetupWelcomeTitle: MessageDescriptor
  validationMsg: MessageDescriptor
  waiting: MessageDescriptor
}

const messagesToDefine: IUserSetupMessages = {
  confirmPassword: {
    defaultMessage: 'Confirm new password',
    description: 'Confirm password label',
    id: 'password.label.confirm'
  },
  hasCases: {
    defaultMessage: 'Contain upper and lower cases',
    description: 'Password validation',
    id: 'password.cases'
  },
  hasNumber: {
    defaultMessage: 'At least one number',
    description: 'Password validation',
    id: 'password.number'
  },
  header: {
    defaultMessage: 'Choose a new password',
    description: 'New Password header',
    id: 'newPassword.header'
  },
  instruction: {
    defaultMessage:
      'We recommend you create a unique password - one that you don’t use for another website or app. Note. You can’t reuse your old password once you change it.',
    description: 'New Password instruction',
    id: 'newPassword.instruction'
  },
  labelAssignedOffice: {
    defaultMessage: 'Assigned office',
    description: 'Assigned office',
    id: 'label.assignedOffice'
  },
  labelBanglaName: {
    defaultMessage: 'Bengali name',
    id: 'settings.user.label.nameBN'
  },
  labelEnglishName: {
    defaultMessage: 'English name',
    id: 'settings.user.label.nameEN'
  },
  match: {
    defaultMessage: 'Passwords match',
    description: 'Password validation',
    id: 'password.match'
  },
  minLength: {
    defaultMessage: '{min} characters minimum',
    description: 'Password validation',
    id: 'password.minLength'
  },
  mismatch: {
    defaultMessage: 'Passwords do not match',
    description: 'Password validation',
    id: 'password.mismatch'
  },
  newPassword: {
    defaultMessage: 'New password:',
    description: 'New password label',
    id: 'password.label.new'
  },
  passwordRequired: {
    defaultMessage: 'New password is not valid',
    description: 'New password required',
    id: 'error.required.password'
  },
  setupCompleteTitle: {
    defaultMessage: 'Account setup complete',
    description: 'Title for the setup complete page',
    id: 'userSetup.complete.title'
  },
  userSetupInstruction: {
    defaultMessage:
      'Now login to your account with your user name and newly created password',
    description: 'Instruction for the setup complete',
    id: 'userSetup.complete.instruction'
  },
  userSetupIntroduction: {
    defaultMessage:
      'You just a few steps away from completing your account set up.',
    description: 'Instruction for the account setup langing page',
    id: 'userSetup.landing.instruction'
  },
  userSetupRevieTitle: {
    defaultMessage: 'Your details',
    description: 'User setup review page title',
    id: 'userSetup.review.title'
  },
  userSetupReviewHeader: {
    defaultMessage: 'Confirm your details',
    description: 'User setup review page subtitle',
    id: 'userSetup.review.header'
  },
  userSetupReviewInstruction: {
    defaultMessage:
      'Check the details below to confirm your account details are correct. and make annecessary changes to confirm your account details are correct.',
    description: 'User setup review page instruction',
    id: 'userSetupReview.instruction'
  },
  userSetupWelcomeTitle: {
    defaultMessage: 'Welcome to OpenCRVS',
    description: 'Title for the landing page',
    id: 'userSetup.landing.title'
  },
  validationMsg: {
    defaultMessage: 'Password must have:',
    description: 'Password validation message',
    id: 'password.validation.msg'
  },
  waiting: {
    defaultMessage: 'Setting up your account',
    description:
      'The message that displays when the user is waiting for the account to be created',
    id: 'user.setup.waiting'
  }
}

export const messages: IUserSetupMessages = defineMessages(messagesToDefine)
