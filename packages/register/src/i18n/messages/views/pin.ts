import { defineMessages } from 'react-intl'

interface IPinMessages {
  createTitle: ReactIntl.FormattedMessage.MessageDescriptor
  createDescription: ReactIntl.FormattedMessage.MessageDescriptor
  pinSameDigitsError: ReactIntl.FormattedMessage.MessageDescriptor
  pinSequentialDigitsError: ReactIntl.FormattedMessage.MessageDescriptor
  pinMatchError: ReactIntl.FormattedMessage.MessageDescriptor
  reEnterTitle: ReactIntl.FormattedMessage.MessageDescriptor
  reEnterDescription: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IPinMessages = {
  createTitle: {
    id: 'createPIN.createTitle',
    defaultMessage: 'Create a PIN',
    description: 'The title displayed while creating a PIN'
  },
  createDescription: {
    id: 'createPIN.createDescription',
    defaultMessage:
      "Choose a PIN that doesn't have 4 repeating digits or sequential numbers.",
    description: 'The description displayed while creating a PIN'
  },
  pinSameDigitsError: {
    id: 'createPIN.pinSameDigitsError',
    defaultMessage: 'PIN cannot have same 4 digits',
    description: 'The error displayed if PIN contains 4 same digits.'
  },
  pinSequentialDigitsError: {
    id: 'createPIN.pinSeqDigitsError',
    defaultMessage: 'PIN cannot contain sequential digits',
    description: 'The error displayed if PIN contains sequential digits.'
  },
  pinMatchError: {
    id: 'createPIN.pinMatchError',
    defaultMessage: 'PIN code did not match. Please try again.',
    description: "The error displayed if PINs don't match"
  },
  reEnterTitle: {
    id: 'createPIN.reEnterTitle',
    defaultMessage: 'Re-enter your new PIN',
    description: 'The title displayed while creating a PIN'
  },
  reEnterDescription: {
    id: 'createPIN.reEnterDescription',
    defaultMessage: "Let's make sure we collected your PIN correctly.",
    description: ''
  }
}

export const messages: IPinMessages = defineMessages(messagesToDefine)
