import { defineMessages, MessageDescriptor } from 'react-intl'

interface IImageUploadMessages {
  uploadError: MessageDescriptor
  documentTypeRequired: MessageDescriptor
  overSized: MessageDescriptor
}

const messagesToDefine: IImageUploadMessages = {
  uploadError: {
    id: 'imageUploadOption.upload.error',
    defaultMessage:
      'File format not supported. Please attach a png, jpg or pdf (max 5mb)',
    description: 'Show error messages while uploading'
  },
  documentTypeRequired: {
    id: 'imageUploadOption.upload.documentType',
    defaultMessage: 'Please select the type of document first',
    description: 'Show error message if the document type is not selected'
  },
  overSized: {
    id: 'imageUploadOption.upload.overSized',
    defaultMessage: 'File is too large. Please attach file less than 5mb',
    description: 'Error message for Attachment size greater than 5MD.'
  }
}

export const messages: IImageUploadMessages = defineMessages(messagesToDefine)
