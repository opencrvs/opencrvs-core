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
  reject: ReactIntl.FormattedMessage.MessageDescriptor
  send: ReactIntl.FormattedMessage.MessageDescriptor
  select: ReactIntl.FormattedMessage.MessageDescriptor
}

const messaegsToDefine: IButtonsMessages = {
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
  reject: {
    id: 'buttons.reject',
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
  }
}

export const buttonMessages: IButtonsMessages = defineMessages(messaegsToDefine)
