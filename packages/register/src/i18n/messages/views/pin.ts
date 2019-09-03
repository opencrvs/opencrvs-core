import { defineMessages, MessageDescriptor } from 'react-intl'

interface IPinMessages {
  createTitle: MessageDescriptor
  createDescription: MessageDescriptor
  pinSameDigitsError: MessageDescriptor
  pinSequentialDigitsError: MessageDescriptor
  pinMatchError: MessageDescriptor
  reEnterTitle: MessageDescriptor
  reEnterDescription: MessageDescriptor
  incorrect: MessageDescriptor
  lastTry: MessageDescriptor
  locked: MessageDescriptor
}

const messagesToDefine: IPinMessages = {
  incorrect: {
    id: 'unlockApp.incorrectPin',
    defaultMessage: 'Incorrect pin. Please try again',
    description: 'The message displayed when a user enters an incorrect PIN'
  },
  lastTry: {
    id: 'unlockApp.lastTry',
    defaultMessage: 'Last Try',
    description:
      'The message displayed before the 3rd attempt of an incorrect PIN'
  },
  locked: {
    id: 'unlockApp.locked',
    defaultMessage: 'Locked',
    description: 'The title displayed while creating a PIN'
  },
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
