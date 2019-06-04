import * as React from 'react'
import styled from '@register/styledComponents'
import { ActionPage, Box } from '@opencrvs/components/lib/interface'
import { ImageUploader } from '@opencrvs/components/lib/forms'
import { ArrowForward } from '@opencrvs/components/lib/icons'
import { FormFieldGenerator } from '@register/components/form'
import { IFormSection, IFormSectionData, IFileValue } from '@register/forms'
import { hasFormError } from '@register/forms/utils'
import { BodyContent } from '@opencrvs/components/lib/layout'
import * as Jimp from 'jimp'
import { ALLOWED_IMAGE_TYPE } from '@register/utils/constants'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'

const FormContainer = styled.div`
  padding: 35px 25px;
`
export const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`
const FormAction = styled.div`
  display: flex;
  justify-content: center;
`
const FormImageUploader = styled(ImageUploader)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`
const UploadErrorSec = styled.div`
  display: flex;
  justify-content: center;
  color: ${({ theme }) => theme.colors.error};
  margin-top: 10px;
`

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  uploadError: {
    id: 'imageUploadOption.upload.error',
    defaultMessage: 'Must be in JPEG/JPG/PNG format',
    description: 'Show error messages while uploading'
  }
})

type State = {
  data: IFormSectionData
  showUploadButton: boolean
  errorOnUpload: boolean
}

const getBase64String = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (reader.result) {
        return resolve(reader.result)
      }
    }
    reader.onerror = error => reject(error)
  })
}

type IProps = {
  option: IFormSection
  backLabel?: string
  title?: string
  onComplete: (file: IFileValue) => void
  toggleNestedSection: () => void
}

type IFullProps = InjectedIntlProps & IProps

export class ImageUploadOptionClass extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      data: {},
      showUploadButton: false,
      errorOnUpload: false
    }
  }

  storeData = (documentData: IFormSectionData) => {
    const showUploadButton = this.shouldShowUploadButton(documentData)
    this.setState({
      data: documentData,
      showUploadButton
    })
  }

  shouldShowUploadButton = (documentData: IFormSectionData) => {
    return documentData && !hasFormError(this.props.option.fields, documentData)
  }

  handleFileChange = (uploadedImage: File) => {
    getBase64String(uploadedImage).then(data => {
      let base64String = data as string
      base64String = base64String.split('base64,')[1]
      Jimp.read(new Buffer(base64String, 'base64'))
        .then(buffer => {
          if (!ALLOWED_IMAGE_TYPE.includes(buffer.getMIME())) {
            throw new Error('File type not supported')
          } else if (uploadedImage.size > 2097152) {
            return buffer
              .resize(2000, Jimp.AUTO)
              .quality(70)
              .getBase64Async(buffer.getMIME())
          }
          return data as string
        })
        .then(buffer => {
          this.props.onComplete({
            optionValues: Object.values(this.state.data),
            type: uploadedImage.type,
            data: buffer
          })
        })
        .catch(() => {
          this.setState({
            errorOnUpload: true
          })
        })
    })
  }

  render = () => {
    const { option, title, backLabel, intl } = this.props
    return (
      <OverlayContainer>
        <ActionPage
          title={title ? title : 'Upload'}
          backLabel={backLabel}
          goBack={this.props.toggleNestedSection}
        >
          <BodyContent>
            <FormContainer>
              <Box>
                <FormFieldGenerator
                  id={option.id}
                  onChange={this.storeData}
                  setAllFieldsDirty={false}
                  fields={option.fields}
                />
                {this.state.showUploadButton && (
                  <FormAction>
                    <FormImageUploader
                      id="upload_document"
                      title={title ? title : 'Upload'}
                      icon={() => <ArrowForward />}
                      handleFileChange={this.handleFileChange}
                    />
                  </FormAction>
                )}
                {this.state.showUploadButton && this.state.errorOnUpload && (
                  <UploadErrorSec id="upload-error-sec">
                    {intl.formatMessage(messages.uploadError)}
                  </UploadErrorSec>
                )}
              </Box>
            </FormContainer>
          </BodyContent>
        </ActionPage>
      </OverlayContainer>
    )
  }
}
export const ImageUploadOption = injectIntl<IFullProps>(ImageUploadOptionClass)
