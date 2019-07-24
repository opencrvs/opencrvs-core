import { defineMessages } from 'react-intl'

interface IDuplicatesMessages {
  notDuplicate: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IDuplicatesMessages = {
  notDuplicate: {
    id: 'duplicates.details.notDuplicate',
    defaultMessage: 'Not a duplicate?',
    description: 'A Question which is a link: Not a duplicate?'
  }
}

export const messages: IDuplicatesMessages = defineMessages(messagesToDefine)
