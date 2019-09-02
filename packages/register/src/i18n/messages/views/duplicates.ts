import { defineMessages, MessageDescriptor } from 'react-intl'

interface IDuplicatesMessages {
  notDuplicate: MessageDescriptor
  notDuplicateConfirmationTxt: MessageDescriptor
  rejectDescription: MessageDescriptor
  duplicateFoundTitle: MessageDescriptor
  duplicateFoundDescription: MessageDescriptor
  possibleDuplicateFound: MessageDescriptor
}

const messagesToDefine: IDuplicatesMessages = {
  rejectDescription: {
    id: 'duplicates.modal.reject',
    defaultMessage:
      'Are you sure you want to reject this application for being a duplicate ?',
    description: 'Description of the reject modal'
  },
  duplicateFoundTitle: {
    id: 'duplicates.duplicateFoundTitle',
    defaultMessage: 'Possible duplicates found',
    description: 'The title of the text box in the duplicates page'
  },
  duplicateFoundDescription: {
    id: 'duplicates.duplicateFoundDescription',
    defaultMessage:
      'The following application has been flagged as a possible duplicate of an existing registered record.',
    description: 'The description at the top of the duplicates page'
  },
  possibleDuplicateFound: {
    id: 'duplicates.possibleDuplicateFound',
    defaultMessage: 'Possible duplicate',
    description: 'The duplicates page title'
  },
  notDuplicate: {
    id: 'duplicates.details.notDuplicate',
    defaultMessage: 'Not a duplicate?',
    description: 'A Question which is a link: Not a duplicate?'
  },
  notDuplicateConfirmationTxt: {
    id: 'duplicates.notDuplicate.modal.confirmationText',
    defaultMessage: 'Are you sure this is not a duplicate application?',
    description: 'Not a duplicate modal confirmation text'
  }
}

export const messages: IDuplicatesMessages = defineMessages(messagesToDefine)
