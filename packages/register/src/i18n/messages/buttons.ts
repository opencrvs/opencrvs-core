import { defineMessages } from 'react-intl'

interface IButtonsMessages {
  back: ReactIntl.FormattedMessage.MessageDescriptor
  upload: ReactIntl.FormattedMessage.MessageDescriptor
  delete: ReactIntl.FormattedMessage.MessageDescriptor
  preview: ReactIntl.FormattedMessage.MessageDescriptor
  cancel: ReactIntl.FormattedMessage.MessageDescriptor
  sendForReview: ReactIntl.FormattedMessage.MessageDescriptor
  sendIncomplete: ReactIntl.FormattedMessage.MessageDescriptor
  register: ReactIntl.FormattedMessage.MessageDescriptor
  rejectApplication: ReactIntl.FormattedMessage.MessageDescriptor
  send: ReactIntl.FormattedMessage.MessageDescriptor
  select: ReactIntl.FormattedMessage.MessageDescriptor
  logout: ReactIntl.FormattedMessage.MessageDescriptor
  reject: ReactIntl.FormattedMessage.MessageDescriptor
  settings: ReactIntl.FormattedMessage.MessageDescriptor
  login: ReactIntl.FormattedMessage.MessageDescriptor
  goToHomepage: ReactIntl.FormattedMessage.MessageDescriptor
  review: ReactIntl.FormattedMessage.MessageDescriptor
  print: ReactIntl.FormattedMessage.MessageDescriptor
  edit: ReactIntl.FormattedMessage.MessageDescriptor
  yes: ReactIntl.FormattedMessage.MessageDescriptor
  update: ReactIntl.FormattedMessage.MessageDescriptor
  retry: ReactIntl.FormattedMessage.MessageDescriptor
  next: ReactIntl.FormattedMessage.MessageDescriptor
  finish: ReactIntl.FormattedMessage.MessageDescriptor
  editRegistration: ReactIntl.FormattedMessage.MessageDescriptor
  confirm: ReactIntl.FormattedMessage.MessageDescriptor
  no: ReactIntl.FormattedMessage.MessageDescriptor
  change: ReactIntl.FormattedMessage.MessageDescriptor
  continueButton: ReactIntl.FormattedMessage.MessageDescriptor
  saveExitButton: ReactIntl.FormattedMessage.MessageDescriptor
  exitButton: ReactIntl.FormattedMessage.MessageDescriptor
  search: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IButtonsMessages = {
  search: {
    id: 'buttons.search',
    defaultMessage: 'Search',
    description: 'The title of search input submit button'
  },
  continueButton: {
    id: 'buttons.continue',
    defaultMessage: 'Continue',
    description: 'Continue Button Text'
  },
  saveExitButton: {
    id: 'buttons.saveAndExit',
    defaultMessage: 'SAVE & EXIT',
    description: 'SAVE & EXIT Button Text'
  },
  exitButton: {
    id: 'buttons.exit',
    defaultMessage: 'EXIT',
    description: 'Label for Exit button on EventTopBar'
  },
  no: {
    id: 'buttons.no',
    defaultMessage: 'No',
    description: 'No button text'
  },
  change: {
    id: 'buttons.change',
    defaultMessage: 'Change',
    description: 'Change action'
  },
  next: {
    id: 'buttons.next',
    defaultMessage: 'Next',
    description: 'The label for next button'
  },
  finish: {
    id: 'buttons.finish',
    defaultMessage: 'Finish',
    description: 'The label for finish printing certificate button'
  },

  editRegistration: {
    id: 'buttons.editRegistration',
    defaultMessage: 'Edit Registration',
    description: 'Edit registration button text'
  },
  confirm: {
    id: 'buttons.confirm',
    defaultMessage: 'Confirm',
    description: 'Confirm button text'
  },
  update: {
    id: 'buttons.update',
    defaultMessage: 'Update',
    description: 'The title of update button for draft application'
  },
  retry: {
    id: 'buttons.retry',
    defaultMessage: 'Retry',
    description: 'The title of retry button for failed application'
  },
  yes: {
    id: 'buttons.yes',
    defaultMessage: 'Yes',
    description: 'Yes button text'
  },
  review: {
    id: 'buttons.review',
    defaultMessage: 'Review',
    description: 'Review button text'
  },
  print: {
    id: 'buttons.print',
    defaultMessage: 'Print',
    description: 'Print button text'
  },
  edit: {
    id: 'buttons.edit',
    defaultMessage: 'Edit',
    description: 'Edit button text'
  },
  back: {
    id: 'buttons.back',
    defaultMessage: 'Back',
    description: 'Back button'
  },
  upload: {
    id: 'buttons.upload',
    defaultMessage: 'Upload',
    description: 'Upload buttton'
  },
  delete: {
    id: 'buttons.delete',
    defaultMessage: 'Delete',
    description: 'Delete button'
  },
  preview: {
    id: 'buttons.preview',
    defaultMessage: 'Preview',
    description: 'Preview button'
  },
  cancel: {
    id: 'buttons.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button text in the modal'
  },
  sendForReview: {
    id: 'buttons.sendForReview',
    defaultMessage: 'SEND FOR REVIEW',
    description: 'Submit Button Text'
  },
  sendIncomplete: {
    id: 'buttons.sendIncomplete',
    defaultMessage: 'Send incomplete application',
    description: 'Title for Incomplete submit button'
  },
  rejectApplication: {
    id: 'buttons.rejectApplication',
    defaultMessage: 'Reject Application',
    description: 'Reject application button text'
  },
  send: {
    id: 'buttons.send',
    defaultMessage: 'Send',
    description: 'Submit button on submit modal'
  },
  register: {
    id: 'buttons.register',
    defaultMessage: 'Register',
    description: 'Label for button on register confirmation modal'
  },
  select: {
    id: 'buttons.select',
    defaultMessage: 'SELECT',
    description: 'The select title'
  },
  logout: {
    id: 'buttons.logout',
    defaultMessage: 'Logout',
    description: 'logout title'
  },
  settings: {
    id: 'buttons.settings',
    defaultMessage: 'Settings',
    description: 'Menu item settings'
  },
  reject: {
    id: 'buttons.reject',
    defaultMessage: 'Reject',
    description: 'A label for reject link'
  },
  login: {
    id: 'buttons.login',
    defaultMessage: 'Login',
    description: 'Login button on session expire modal'
  },
  goToHomepage: {
    id: 'buttons.goToHomePage',
    defaultMessage: 'Go to Homepage',
    description: 'Label for Go to Homepage button'
  }
}

export const buttonMessages: IButtonsMessages = defineMessages(messagesToDefine)
