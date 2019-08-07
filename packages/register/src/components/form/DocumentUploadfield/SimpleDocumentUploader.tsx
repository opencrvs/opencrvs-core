import { ImageUploader } from '@opencrvs/components/lib/forms'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { DocumentPreview } from '@register/components/form/DocumentUploadfield/DocumentPreview'
import { IFormFieldValue, IAttachmentValue } from '@register/forms'
import { ALLOWED_IMAGE_TYPE, EMPTY_STRING } from '@register/utils/constants'
import * as Jimp from 'jimp'
import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import styled from 'styled-components'
import { DocumentListPreview } from './DocumentListPreview'
import { buttonMessages } from '@register/i18n/messages'

const UploaderWrapper = styled.div`
  margin-bottom: 20px;
`
const Flex = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const ErrorMessage = styled.div`
  margin-bottom: 20px;
`
const DocumentUploader = styled(ImageUploader)`
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => `2px solid ${theme.colors.primary}`};
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  border-radius: 2px;
  ${({ theme }) => theme.fonts.buttonStyle};
  height: 40px;
  text-transform: initial;
  padding: 0px 25px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: 0px;
    margin-top: 10px;
  }
`

const FieldDescription = styled.div`
  margin-top: -8px;
  margin-bottom: 24px;
`

type IFullProps = {
  name: string
  label: string
  files?: IAttachmentValue
  description?: string
  onComplete: (files: IAttachmentValue | {}) => void
} & InjectedIntlProps

type IState = {
  errorMessage: string
  previewImage: IAttachmentValue | null
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

class SimpleDocumentUploaderComponent extends React.Component<
  IFullProps,
  IState
> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      errorMessage: EMPTY_STRING,
      previewImage: null
    }
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
            type: uploadedImage.type,
            data: buffer
          })
        })
        .catch(() => {
          this.setState({
            errorMessage: 'error'
          })
        })
    })
  }

  selectForPreview = (previewImage: IFormFieldValue) => {
    this.setState({ previewImage: previewImage as IAttachmentValue })
  }

  closePreviewSection = () => {
    this.setState({ previewImage: null })
  }

  onDelete = (image: IFormFieldValue) => {
    this.props.onComplete({})
    this.closePreviewSection()
  }

  render() {
    const { label, intl, files, description } = this.props

    return (
      <UploaderWrapper>
        {description && <FieldDescription>{description}</FieldDescription>}
        <ErrorMessage>
          {this.state.errorMessage && (
            <ErrorText>{this.state.errorMessage}</ErrorText>
          )}
        </ErrorMessage>
        <DocumentListPreview
          attachment={files}
          onSelect={this.selectForPreview}
          label={label}
        />
        <Flex>
          <DocumentUploader
            id="upload_document"
            title="Add file"
            handleFileChange={this.handleFileChange}
          />
        </Flex>

        {this.state.previewImage && (
          <DocumentPreview
            previewImage={this.state.previewImage}
            title={intl.formatMessage(buttonMessages.preview)}
            goBack={this.closePreviewSection}
            onDelete={this.onDelete}
          />
        )}
      </UploaderWrapper>
    )
  }
}

export const SimpleDocumentUploader = injectIntl<IFullProps>(
  SimpleDocumentUploaderComponent
)
