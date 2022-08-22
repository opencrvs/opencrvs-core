import { getBase64String, ErrorMessage } from './DocumentUploaderWithOption'
import Jimp from 'jimp'
import { buttonMessages, formMessages as messages } from '@client/i18n/messages'
import { IFormFieldValue, IAttachmentValue } from '@client/forms'

export const handleFileChange = (thisObj: any, uploadedImage: File) => {
  if (!uploadedImage) {
    return
  }
  const allowedDocType = thisObj.props.allowedDocType

  thisObj.setState(() => ({
    filesBeingUploaded: [
      ...thisObj.state.filesBeingUploaded,
      {
        label: uploadedImage.name
      }
    ]
  }))

  thisObj.props.onUploadingStateChanged &&
    thisObj.props.onUploadingStateChanged(true)

  getBase64String(uploadedImage).then((data) => {
    let base64String = data as string
    base64String = base64String.split('base64,')[1]
    Jimp.read(new Buffer(base64String, 'base64'))
      .then((buffer) => {
        if (
          allowedDocType &&
          allowedDocType.length > 0 &&
          !allowedDocType.includes(buffer.getMIME())
        ) {
          throw new Error('File type not supported')
        }
        return data as string
      })
      .then((buffer) => {
        thisObj.props.onUploadingStateChanged &&
          thisObj.props.onUploadingStateChanged(false)
        thisObj.props.onComplete({
          name: uploadedImage.name,
          type: uploadedImage.type,
          data: buffer
        })
        thisObj.setState({
          error: ''
        })
        thisObj.setState({
          filesBeingUploaded: []
        })
      })
      .catch(() => {
        thisObj.props.onUploadingStateChanged &&
          thisObj.props.onUploadingStateChanged(false)
        thisObj.setState({
          filesBeingUploaded: []
        })
        allowedDocType &&
          allowedDocType.length > 0 &&
          thisObj.setState({
            error: thisObj.props.intl.formatMessage(messages.fileUploadError, {
              type: allowedDocType
                .map((docTypeStr: string) => docTypeStr.split('/').pop())
                .join(', ')
            })
          })
      })
  })
}

export const selectForPreview = (
  thisObj: any,
  previewImage: IFormFieldValue
) => {
  thisObj.setState({ previewImage: previewImage as IAttachmentValue })
}

export const closePreviewSection = (thisObj: any) => {
  thisObj.setState({ previewImage: null })
}

export const onDelete = (thisObj: any, image: IFormFieldValue) => {
  thisObj.props.onComplete('')
  thisObj.closePreviewSection()
}
