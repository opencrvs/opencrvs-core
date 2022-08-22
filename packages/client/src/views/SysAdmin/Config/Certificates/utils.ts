import {
  ERROR_TYPES,
  validateCertificateTemplate
} from '@client/utils/imageUtils'
import { messages as imageUploadMessages } from '@client/i18n/messages/views/imageUpload'
import { IAttachmentValue, IFormFieldValue, IForm } from '@client/forms'

export const blobToBase64 = (
  blob: Blob
): Promise<string | null | ArrayBuffer> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

export const updatePreviewSvgWithSampleSignature = async (
  svgCode: string
): Promise<string> => {
  const html = document.createElement('html')
  html.innerHTML = svgCode
  const certificateImages = html.querySelectorAll('image')
  const signatureImage = Array.from(certificateImages).find(
    (image) => image.getAttribute('data-content') === 'signature'
  )
  if (signatureImage) {
    const res = await fetch('/assets/sample-signature.png')
    const blob = await res.blob()
    const base64signature = await blobToBase64(blob)
    signatureImage.setAttribute('xlink:href', base64signature as string)
  }

  svgCode = html.getElementsByTagName('svg')[0].outerHTML
  return unescape(encodeURIComponent(svgCode))
}
export const simpleFunction = (thisObj: any) => {
  console.log('called simple function', thisObj)
}

export const toggleNotification = (thisObj: any) => {
  thisObj.setState((state: { showNotification: any }) => ({
    showNotification: !state.showNotification
  }))
}

export const togglePrompt = (thisObj: any) => {
  thisObj.setState((prevState: { showPrompt: any }) => ({
    showPrompt: !prevState.showPrompt
  }))
}

export const selectForPreview = (
  thisObj: any,
  previewImage: IAttachmentValue
) => {
  thisObj.setState({ previewImage: previewImage })
}

export const closePreviewSection = (thisObj: any) => {
  thisObj.setState({ previewImage: null })
}

export const onDelete = (thisObj: any, image: IFormFieldValue) => {
  thisObj.closePreviewSection()
}
