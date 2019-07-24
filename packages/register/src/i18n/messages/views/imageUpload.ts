import { defineMessages } from 'react-intl'

interface IImageUploadMessages {
  uploadError: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IImageUploadMessages = {
  uploadError: {
    id: 'imageUpload.upload.error',
    defaultMessage: 'Must be in JPEG/JPG/PNG format',
    description: 'Show error messages while uploading'
  }
}

export const messages: IImageUploadMessages = defineMessages(messagesToDefine)
