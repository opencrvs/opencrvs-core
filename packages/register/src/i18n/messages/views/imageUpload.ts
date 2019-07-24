import { defineMessages } from 'react-intl'

interface IFormMessages {
  uploadError: ReactIntl.FormattedMessage.MessageDescriptor
}

const messaegsToDefine: IFormMessages = {
  uploadError: {
    id: 'imageUpload.upload.error',
    defaultMessage: 'Must be in JPEG/JPG/PNG format',
    description: 'Show error messages while uploading'
  }
}

export const messages: IFormMessages = defineMessages(messaegsToDefine)
