import { defineMessages } from 'react-intl'

export default defineMessages({
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
  pinSequentialDigitsError: {
    id: 'createPIN.pinSeqDigitsError',
    defaultMessage: 'PIN contains sequential digits.',
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
})
