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
}

const messagesToDefine: IButtonsMessages = {
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
