import {
  ImageUploader,
  ISelectOption,
  Select
} from '@opencrvs/components/lib/forms'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { ImagePreview } from '@register/components/form/ImageUploadField/ImagePreview'
import { IFileValue, IFormFieldValue } from '@register/forms'
import { ALLOWED_IMAGE_TYPE, EMPTY_STRING } from '@register/utils/constants'
import * as Jimp from 'jimp'
import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from 'styled-components'
import { DocumentListPreview } from './DocumentListPreview'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  uploadError: {
    id: 'imageUploadOption.upload.error',
    defaultMessage: 'Must be in JPEG/JPG/PNG format',
    description: 'Show error messages while uploading'
  },
  documentTypeRequired: {
    id: 'imageUploadOption.upload.documentType',
    defaultMessage: 'Please select the type of document first',
    description: 'Show error message if the document type is not selected'
  },
  preview: {
    id: 'formFields.imageUpload.preview',
    defaultMessage: 'Preview',
    description: 'label for preview a uploaded item'
  },
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  }
})

const UploaderWrapper = styled.div`
  margin-bottom: 20px;
`
const Label = styled.label`
  position: relative;
  top: -2px;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
`
const Flex = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const ErrorMessage = styled.div`
  margin-bottom: 20px;
`
const DocumentUploader = styled(ImageUploader)`
  color: ${({ theme }) => theme.colors.primary}
  background: ${({ theme }) => theme.colors.white}
  border: ${({ theme }) => `2px solid ${theme.colors.primary}`}
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32)
  border-radius: 2px
  ${({ theme }) => theme.fonts.buttonStyle}
  height: 40px
  text-transform: initial  
  margin-left: 10px
  padding: 0px 30px

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: 0px;
    margin-top: 10px;
  }
`

type IFullProps = {
  name: string
  label: string
  extraValue: IFormFieldValue
  options: ISelectOption[]
  files?: IFileValue[]
  onComplete: (files: IFileValue[]) => void
} & InjectedIntlProps

type DocumentFields = {
  documentType: string
  documentData: string
}
type IState = {
  errorMessage: string
  fields: DocumentFields
  uploadedDocuments: IFileValue[]
  previewImage: IFileValue | null
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

class DocumentUploaderWithOptionComp extends React.Component<
  IFullProps,
  IState
> {
  constructor(props: IFullProps) {
    super(props)
    console.log(props, this.props)
    this.state = {
      errorMessage: EMPTY_STRING,
      previewImage: null,
      uploadedDocuments: this.props.files || [],
      fields: {
        documentType: EMPTY_STRING,
        documentData: EMPTY_STRING
      }
    }
  }

  onChange = (documentType: string) => {
    const currentState = this.state
    currentState.fields.documentType = documentType
    this.setState(currentState)
  }

  isValid = (): boolean => {
    const isValid = !!this.state.fields.documentType

    this.setState({
      errorMessage: isValid
        ? EMPTY_STRING
        : this.props.intl.formatMessage(messages.documentTypeRequired)
    })

    return isValid
  }

  handleFileChange = (uploadedImage: File) => {
    if (!uploadedImage) {
      return
    }
    getBase64String(uploadedImage).then(data => {
      let base64String = data as string
      base64String = base64String.split('base64,')[1]
      Jimp.read(new Buffer(base64String, 'base64'))
        .then(buffer => {
          if (!ALLOWED_IMAGE_TYPE.includes(buffer.getMIME())) {
            console.log(this.props.intl.formatMessage(messages.uploadError))
            this.setState({
              errorMessage: this.props.intl.formatMessage(messages.uploadError)
            })
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
          const optionValues = [
            this.props.extraValue,
            this.state.fields.documentType
          ]
          this.setState(
            prevState => {
              const newDocument: IFileValue = {
                optionValues,
                type: uploadedImage.type,
                data: buffer
              }

              return {
                ...prevState,
                errorMessage: EMPTY_STRING,
                fields: {
                  documentType: EMPTY_STRING,
                  documentData: EMPTY_STRING
                },
                uploadedDocuments: [...prevState.uploadedDocuments, newDocument]
              }
            },
            () => {
              this.props.onComplete(this.state.uploadedDocuments)
            }
          )
        })
        .catch(e => {
          this.setState({
            errorMessage: this.props.intl.formatMessage(messages.uploadError)
          })
        })
    })
  }

  closePreviewSection = () => {
    this.setState({ previewImage: null })
  }

  selectForPreview = (previewImage: IFileValue) => {
    this.setState({ previewImage })
  }

  render() {
    const { label, options, intl } = this.props

    console.log(this.props)
    console.log(this.state)

    return (
      <UploaderWrapper>
        <ErrorMessage>
          {this.state.errorMessage && (
            <ErrorText>{this.state.errorMessage}</ErrorText>
          )}
        </ErrorMessage>

        <Label>{label}</Label>
        <DocumentListPreview
          documents={this.state.uploadedDocuments}
          onSelect={this.selectForPreview}
        />
        <Flex>
          <Select
            options={options}
            value={this.state.fields.documentType}
            onChange={this.onChange}
          />

          <DocumentUploader
            id="upload_document"
            title="Add file"
            onClick={e => !this.isValid() && e.preventDefault()}
            handleFileChange={this.handleFileChange}
          />
        </Flex>

        {this.state.previewImage && (
          <ImagePreview
            previewImage={this.state.previewImage}
            title={intl.formatMessage(messages.preview)}
            backLabel={intl.formatMessage(messages.back)}
            goBack={this.closePreviewSection}
          />
        )}
      </UploaderWrapper>
    )
  }
}

export const DocumentUploaderWithOption = injectIntl<IFullProps>(
  DocumentUploaderWithOptionComp
)
