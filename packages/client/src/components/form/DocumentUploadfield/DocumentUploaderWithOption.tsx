/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { ISelectOption, Select } from '@opencrvs/components/lib/Select'
import { ImageUploader } from '@opencrvs/components/lib/ImageUploader'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { DocumentPreview } from '@client/components/form/DocumentUploadfield/DocumentPreview'
import { IFileValue, IFormFieldValue, IAttachmentValue } from '@client/forms'
import { ALLOWED_IMAGE_TYPE, EMPTY_STRING } from '@client/utils/constants'
import * as React from 'react'
import {
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  MessageDescriptor
} from 'react-intl'
import styled from 'styled-components'
import { DocumentListPreview } from './DocumentListPreview'
import { remove, clone } from 'lodash'
import { buttonMessages, formMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/imageUpload'
import imageCompression from 'browser-image-compression'

const options = {
  maxSizeMB: 0.4,
  maxWidthOrHeight: 1920,
  useWebWorker: true
}

const UploaderWrapper = styled.div`
  width: 520px;
  margin-bottom: 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`

const Label = styled.label`
  position: relative;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.h4};
`

const Flex = styled.div<{ splitView?: boolean }>`
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
`
export const ErrorMessage = styled.div`
  margin-bottom: 8px;
`

type IFullProps = {
  name: string
  label: string
  placeholder?: string
  extraValue: IFormFieldValue
  options: ISelectOption[]
  splitView?: boolean
  files: IFileValue[]
  hideOnEmptyOption?: boolean
  onComplete: (files: IFileValue[]) => void
  touched?: boolean
  onUploadingStateChanged?: (isUploading: boolean) => void
  requiredErrorMessage?: MessageDescriptor
} & IntlShapeProps

type DocumentFields = {
  documentType: string
  documentData: string
}

type IState = {
  errorMessage: string
  fields: DocumentFields
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
    reader.onerror = (error) => reject(error)
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

    const resized =
      uploadedImage.size > 512000 &&
      (await imageCompression(uploadedImage, options))

    const fileAsBase64 = await getBase64String(resized || uploadedImage)

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

    this.setState((state) => ({
      filesBeingProcessed: [
        ...state.filesBeingProcessed,
        {
          label: optionValues[1]
        }
      ]
    }))

    this.props.onUploadingStateChanged &&
      this.props.onUploadingStateChanged(true)

    const minimumProcessingTime = new Promise<void>((resolve) =>
      setTimeout(resolve, 2000)
    )

    try {
      // Start processing
      ;[fileAsBase64] = await Promise.all([
        this.processImage(uploadedImage),
        minimumProcessingTime
      ])
    } catch (error) {
      this.props.onUploadingStateChanged &&
        this.props.onUploadingStateChanged(false)

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

    const tempOptions = this.state.dropDownOptions

    remove(
      tempOptions,
      (option: ISelectOption) => option.value === this.state.fields.documentType
    )

    const newDocument: IFileValue = {
      optionValues,
      type: uploadedImage.type,
      data: fileAsBase64.toString(),
      fileSize: uploadedImage.size
    }

    this.props.onComplete([...this.props.files, newDocument])
    this.props.onUploadingStateChanged &&
      this.props.onUploadingStateChanged(false)

    this.setState((prevState) => {
      return {
        ...prevState,
        errorMessage: EMPTY_STRING,
        fields: {
          documentType: EMPTY_STRING,
          documentData: EMPTY_STRING
        },
        dropDownOptions: tempOptions,
        // Remove from processing files
        filesBeingProcessed: this.state.filesBeingProcessed.filter(
          ({ label }) => label !== optionValues[1]
        )
      }
    })
  }

  onDelete = (image: IFileValue | IAttachmentValue) => {
    const previewImage = image as IFileValue
    const addableOption = this.props.options.find(
      (item: ISelectOption) => item.value === previewImage.optionValues[1]
    ) as ISelectOption
    const dropDownOptions = this.state.dropDownOptions.concat(addableOption)
    this.setState(() => ({ dropDownOptions }))
    this.props.onComplete(
      this.props.files.filter((file) => file !== previewImage)
    )
    this.closePreviewSection()
  }

  closePreviewSection = () => {
    this.setState({ previewImage: null })
  }

  selectForPreview = (previewImage: IFileValue | IAttachmentValue) => {
    this.setState({ previewImage: previewImage as IFileValue })
  }

  getFormattedLabelForDocType = (docType: string) => {
    const matchingOptionForDocType =
      this.props.options &&
      this.props.options.find((option) => option.value === docType)
    return matchingOptionForDocType && matchingOptionForDocType.label
  }

  renderDocumentUploaderWithDocumentTypeBlock = () => {
    const { name, intl, placeholder } = this.props
    return this.props.splitView ? (
      this.state.dropDownOptions.map((opt, idx) => (
        <Flex splitView key={idx}>
          <Select
            id={`${name}${idx}`}
            placeholder={placeholder}
            options={[opt]}
            value={opt.value}
            onChange={this.onChange}
          />

          <ImageUploader
            id={`upload_document${idx}`}
            title={intl.formatMessage(formMessages.addFile)}
            onClick={(e) => {
              this.onChange(opt.value)
              return !this.isValid() && e.preventDefault()
            }}
            handleFileChange={this.handleFileChange}
            disabled={this.state.filesBeingProcessed.length > 0}
          />
        </Flex>
      ))
    ) : (
      <Flex>
        <Select
          id={name}
          placeholder={placeholder}
          options={this.state.dropDownOptions}
          value={this.state.fields.documentType}
          onChange={this.onChange}
          isDisabled={this.state.filesBeingProcessed.length > 0}
        />

        <ImageUploader
          id="upload_document"
          title={intl.formatMessage(formMessages.addFile)}
          onClick={(e) => !this.isValid() && e.preventDefault()}
          handleFileChange={this.handleFileChange}
          disabled={this.state.filesBeingProcessed.length > 0}
        />
      </Flex>
    )
  }

  render() {
    const { label, intl, requiredErrorMessage } = this.props

    return (
      <UploaderWrapper>
        <ErrorMessage id="upload-error">
          {this.state.errorMessage && (
            <ErrorText>
              {(requiredErrorMessage &&
                intl.formatMessage(requiredErrorMessage)) ||
                this.state.errorMessage}
            </ErrorText>
          )}
        </ErrorMessage>

        <Label>{label}</Label>
        <DocumentListPreview
          processingDocuments={this.state.filesBeingProcessed}
          documents={this.props.files}
          onSelect={this.selectForPreview}
          dropdownOptions={this.props.options}
          onDelete={this.onDelete}
        />
        {this.props.hideOnEmptyOption && this.state.dropDownOptions.length === 0
          ? null
          : this.renderDocumentUploaderWithDocumentTypeBlock()}

        {this.state.previewImage && (
          <DocumentPreview
            previewImage={this.state.previewImage}
            title={this.getFormattedLabelForDocType(
              this.state.previewImage.optionValues[1] as string
            )}
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
