import { certificateTemplateMutations } from '@client/certificate/mutations'
import { ICertificateTemplateData } from '@client/utils/referenceApi'
import { messages as imageUploadMessages } from '@client/i18n/messages/views/imageUpload'
import {
  ERROR_TYPES,
  validateCertificateTemplate
} from '@client/utils/imageUtils'

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

export const closePreviewSection = (thisObj: any) => {
  thisObj.setState({ previewImage: null })
}

export const onDelete = (thisObj: any) => {
  thisObj.closePreviewSection()
}

export const updateCertificateTemplate = async (
  thisObj: any,
  id: string,
  svgCode: string,
  svgFilename: string,
  user: string,
  status: string,
  event: string
) => {
  try {
    const res = await certificateTemplateMutations.updateCertificateTemplate(
      id,
      svgCode,
      svgFilename,
      user,
      status,
      event
    )
    if (res && res.createOrUpdateCertificateSVG) {
      thisObj.setState({ imageUploading: false })
      thisObj.props.updateOfflineCertificate(
        res.createOrUpdateCertificateSVG as ICertificateTemplateData
      )
    }
  } catch (err) {
    thisObj.setState({
      imageLoadingError: thisObj.props.intl.formatMessage(
        imageUploadMessages.imageFormat
      )
    })
  }
}

// export const handleSelectFile = async (
//   thisObj: any,
//   event: React.ChangeEvent<HTMLInputElement>
// ) => {
//   console.log('handle select')
//   const { id, files } = event.target
//   const eventName: string = id.split('_')[0]
//   const certificateId: string = id.split('_')[4]
//   const status = 'ACTIVE'
//   const userMgntUserID =
//     thisObj.props.userDetails && thisObj.props.userDetails.userMgntUserID
//   thisObj.setState({
//     imageUploading: true,
//     imageLoadingError: ''
//   })
//   thisObj.toggleNotification()

//   if (files && files.length > 0) {
//     try {
//       const svgCode = await validateCertificateTemplate(files[0])
//       updateCertificateTemplate.bind(
//         certificateId,
//         svgCode,
//         files[0].name,
//         userMgntUserID as string,
//         status,
//         eventName
//       )
//       thisObj.birthCertificatefileUploader.current!.value = ''
//       thisObj.deathCertificatefileUploader.current!.value = ''
//     } catch (error) {
//       if (error.message === ERROR_TYPES.IMAGE_TYPE) {
//         thisObj.setState(() => ({
//           imageUploading: false,
//           imageLoadingError: thisObj.props.intl.formatMessage(
//             imageUploadMessages.imageFormat
//           )
//         }))
//         thisObj.birthCertificatefileUploader.current!.value = ''
//         thisObj.deathCertificatefileUploader.current!.value = ''
//       }
//     }
//   }
// }
