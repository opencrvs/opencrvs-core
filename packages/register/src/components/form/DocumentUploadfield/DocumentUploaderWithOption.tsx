import {
  ImageUploader,
  ISelectOption,
  Select
} from '@opencrvs/components/lib/forms'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { DocumentPreview } from '@register/components/form/DocumentUploadfield/DocumentPreview'
import { IFileValue, IFormFieldValue, IAttachmentValue } from '@register/forms'
import { ALLOWED_IMAGE_TYPE, EMPTY_STRING } from '@register/utils/constants'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import styled from 'styled-components'
import { getBase64Strings as resizeAndRotate } from 'exif-rotate-js/lib'
import { DocumentListPreview } from './DocumentListPreview'
import { remove, clone } from 'lodash'
import { buttonMessages } from '@register/i18n/messages'
import { messages } from '@register/i18n/messages/views/imageUpload'

const MAX_IMAGE_WIDTH_OR_HEIGHT = 2500

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
export const ErrorMessage = styled.div`
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
  margin-left: 10px;
  padding: 0px 30px;

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
} & IntlShapeProps

type DocumentFields = {
  documentType: string
  documentData: string
}

type IState = {
  errorMessage: string
  fields: DocumentFields
  uploadedDocuments: IFileValue[]
  previewImage: IFileValue | null
  filesBeingProcessed: Array<{ label: string }>
  dropDownOptions: ISelectOption[]
}

export const getBase64String = (file: File) => {
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
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
    this.state = {
      errorMessage: EMPTY_STRING,
      previewImage: null,
      uploadedDocuments: this.props.files || [],
      dropDownOptions: this.initializeDropDownOption(),
      filesBeingProcessed: [],
      fields: {
        documentType: EMPTY_STRING,
        documentData: EMPTY_STRING
      }
    }
  }

  initializeDropDownOption = (): ISelectOption[] => {
    const options = clone(this.props.options)
    this.props.files &&
      this.props.files.forEach((element: IFileValue) => {
        remove(
          options,
          (option: ISelectOption) => option.value === element.optionValues[1]
        )
      })

    return options
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

  processImage = async (uploadedImage: File) => {
    if (!ALLOWED_IMAGE_TYPE.includes(uploadedImage.type)) {
      this.setState({
        errorMessage: this.props.intl.formatMessage(messages.uploadError)
      })
      throw new Error('File type not supported')
    }

    if (uploadedImage.size > 5242880) {
      this.setState({
        errorMessage: this.props.intl.formatMessage(messages.overSized)
      })
      throw new Error(this.props.intl.formatMessage(messages.overSized))
    }

    if (uploadedImage.size > 2097152) {
      const [resized] = await resizeAndRotate([uploadedImage], {
        maxSize: MAX_IMAGE_WIDTH_OR_HEIGHT
      })
      return resized
    }

    const fileAsBase64 = await getBase64String(uploadedImage)
    return fileAsBase64.toString()
  }

  handleFileChange = async (uploadedImage: File) => {
    if (!uploadedImage) {
      return
    }

    let fileAsBase64: string
    const optionValues: [IFormFieldValue, string] = [
      this.props.extraValue,
      this.state.fields.documentType
    ]

    this.setState(state => ({
      filesBeingProcessed: [
        ...state.filesBeingProcessed,
        {
          label: optionValues[1]
        }
      ]
    }))

    const minimumProcessingTime = new Promise(resolve =>
      setTimeout(resolve, 2000)
    )
    try {
      // Start processing
      ;[fileAsBase64] = await Promise.all([
        this.processImage(uploadedImage),
        minimumProcessingTime
      ])
    } catch (error) {
      console.error(error)

      this.setState({
        errorMessage:
          this.state.errorMessage ||
          this.props.intl.formatMessage(messages.uploadError),
        // Remove from processing files
        filesBeingProcessed: this.state.filesBeingProcessed.filter(
          ({ label }) => label !== optionValues[1]
        )
      })
      return
    }

    let tempOptions = this.state.dropDownOptions

    remove(
      tempOptions,
      (option: ISelectOption) => option.value === this.state.fields.documentType
    )

    this.setState(
      prevState => {
        const newDocument: IFileValue = {
          optionValues,
          type: uploadedImage.type,
          data: fileAsBase64.toString()
        }

        return {
          ...prevState,
          errorMessage: EMPTY_STRING,
          fields: {
            documentType: EMPTY_STRING,
            documentData: EMPTY_STRING
          },
          uploadedDocuments: [...prevState.uploadedDocuments, newDocument],
          dropDownOptions: tempOptions,
          // Remove from processing files
          filesBeingProcessed: this.state.filesBeingProcessed.filter(
            ({ label }) => label !== optionValues[1]
          )
        }
      },
      () => {
        this.props.onComplete(this.state.uploadedDocuments)
      }
    )
  }

  onDelete = (image: IFileValue | IAttachmentValue) => {
    const previewImage = image as IFileValue
    const addableOption = this.props.options.find(
      (item: ISelectOption) => item.value === previewImage.optionValues[1]
    ) as ISelectOption
    const dropDownOptions = this.state.dropDownOptions.concat(addableOption)
    this.setState(() => ({ dropDownOptions }))
    remove(
      this.state.uploadedDocuments,
      (item: IFileValue) => item === previewImage
    )

    this.props.onComplete(this.state.uploadedDocuments)
    this.closePreviewSection()
  }

  closePreviewSection = () => {
    this.setState({ previewImage: null })
  }

  selectForPreview = (previewImage: IFileValue | IAttachmentValue) => {
    this.setState({ previewImage: previewImage as IFileValue })
  }

  render() {
    const { label, intl } = this.props

    return (
      <UploaderWrapper>
        <ErrorMessage>
          {this.state.errorMessage && (
            <ErrorText>{this.state.errorMessage}</ErrorText>
          )}
        </ErrorMessage>

        <Label>{label}</Label>
        <DocumentListPreview
          processingDocuments={this.state.filesBeingProcessed}
          documents={this.state.uploadedDocuments}
          onSelect={this.selectForPreview}
        />
        <Flex>
          <Select
            options={this.state.dropDownOptions}
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

export const DocumentUploaderWithOption = injectIntl<'intl', IFullProps>(
  DocumentUploaderWithOptionComp
)
