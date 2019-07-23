import { defineMessages } from 'react-intl'

export const buttonMessages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
  }
})
