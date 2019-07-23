import { defineMessages } from 'react-intl'

export const formMessages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  uploadedList: {
    id: 'form.field.label.imageUpload.uploadedList',
    defaultMessage: 'Uploaded:',
    description: 'label for uploaded list'
  }
})
