/* eslint-disable react/destructuring-assignment */
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
import React, { useState } from 'react'
import { MessageDescriptor, useIntl } from 'react-intl'
import styled from 'styled-components'
import { remove, clone } from 'lodash'
import imageCompression from 'browser-image-compression'
import { ISelectOption, Select } from '@opencrvs/components/lib/Select'
import { ImageUploader } from '@opencrvs/components/lib/ImageUploader'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { DocumentPreview } from '@client/components/form/DocumentUploadField/DocumentPreview'
import { IFileValue, IFormFieldValue, IAttachmentValue } from '@client/forms'
import { ALLOWED_IMAGE_TYPE, EMPTY_STRING } from '@client/utils/constants'
import { formMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/imageUpload'
import { bytesToMB } from '@client/utils/imageUtils'
import { DocumentListPreview } from './DocumentListPreview'

const DEFAULT_MAX_SIZE_MB = 5

const defaultOptions = {
  maxSizeMB: 0.4,
  maxWidthOrHeight: 1920,
  useWebWorker: true
}

const FullWidthImageUploader = styled(ImageUploader)`
  width: 100%;
  height: 46px;
`

const UploadWrapper = styled.div`
  width: 100%;
`

const Flex = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
`

const DocumentUploadButton = styled(ImageUploader)`
  height: 46px;
  flex-shrink: 0;
`

interface IFullProps {
  name: string
  placeholder?: string
  extraValue: IFormFieldValue
  options: ISelectOption[]
  files: IFileValue[]
  hideOnEmptyOption?: boolean
  onComplete: (files: IFileValue[]) => void
  onBlur: React.FocusEventHandler
  touched?: boolean
  onUploadingStateChanged?: (isUploading: boolean) => void
  requiredErrorMessage?: MessageDescriptor
  compressImagesToSizeMB?: number
  maxSizeMB?: number
}

interface DocumentFields {
  documentType: string
  documentData: string
}

async function getBase64String(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (reader.result) {
        return resolve(reader.result.toString())
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

function initializeDropDownOption(
  options: ISelectOption[],
  files: IFileValue[]
): ISelectOption[] {
  const outputOptions = clone(options)
  files &&
    files.forEach((element: IFileValue) => {
      remove(
        outputOptions,
        (option: ISelectOption) => option.value === element.optionValues[1]
      )
    })

  return outputOptions
}

export function DocumentUploaderWithOption(props: IFullProps) {
  const intl = useIntl()
  const [errorMessage, setErrorMessage] = useState(EMPTY_STRING)
  const [previewImage, setPreviewImage] = useState<IFileValue | null>(null)
  const [dropdownOptions, setDropdownOptions] = useState<ISelectOption[]>(
    initializeDropDownOption(props.options, props.files)
  )
  const [filesBeingProcessed, setFilesBeingProcessed] = useState<
    Array<{ label: string }>
  >([])
  const [fields, setFields] = useState<DocumentFields>({
    documentType: EMPTY_STRING,
    documentData: EMPTY_STRING
  })
  const maxSize = props.maxSizeMB ?? DEFAULT_MAX_SIZE_MB

  const onChange = (documentType: string) => {
    setFields((currentFields) => ({
      ...currentFields,
      documentType
    }))
  }

  const isValid = (): boolean => {
    // If there is only one option available then no need to select it
    // and it's not shown either
    const isValid = !!fields.documentType || props.options.length === 1

    setErrorMessage(
      isValid ? EMPTY_STRING : intl.formatMessage(messages.documentTypeRequired)
    )

    return isValid
  }

  const processImage = async (uploadedImage: File) => {
    const options = { ...defaultOptions }
    if (!ALLOWED_IMAGE_TYPE.includes(uploadedImage.type)) {
      setErrorMessage(intl.formatMessage(messages.uploadError, { maxSize }))
      throw new Error('File type not supported')
    }

    if (bytesToMB(uploadedImage.size) > maxSize) {
      setErrorMessage(intl.formatMessage(messages.overSized, { maxSize }))
      throw new Error(intl.formatMessage(messages.overSized, { maxSize }))
    }

    if (props.compressImagesToSizeMB !== undefined) {
      options.maxSizeMB = props.compressImagesToSizeMB
    }
    if (
      !Boolean(options.maxSizeMB) ||
      bytesToMB(uploadedImage.size) <= options.maxSizeMB
    ) {
      return uploadedImage
    }

    const resized = await imageCompression(uploadedImage, options)

    return resized
  }

  const handleFileChange = async (uploadedImage: File) => {
    if (!uploadedImage) {
      return
    }
    // If there is only one option available then it would stay selected
    const documentType = fields.documentType || dropdownOptions[0].value

    let processedFile: File
    const optionValues: [IFormFieldValue, string] = [
      props.extraValue,
      documentType
    ]

    setFilesBeingProcessed((filesCurrentlyBeingProcessed) => [
      ...filesCurrentlyBeingProcessed,
      {
        label: optionValues[1]
      }
    ])

    if (props.onUploadingStateChanged) {
      props.onUploadingStateChanged(true)
    }

    const minimumProcessingTime = new Promise<void>((resolve) =>
      setTimeout(resolve, 2000)
    )

    try {
      // Start processing
      ;[processedFile] = await Promise.all([
        processImage(uploadedImage),
        minimumProcessingTime
      ])
    } catch (error) {
      if (props.onUploadingStateChanged) {
        props.onUploadingStateChanged(false)
      }

      setErrorMessage(
        (msg) => msg || intl.formatMessage(messages.uploadError, { maxSize })
      )
      setFilesBeingProcessed((filesCurrentlyBeingProcessed) =>
        filesCurrentlyBeingProcessed.filter(
          ({ label }) => label !== optionValues[1]
        )
      )
      return
    }

    const tempOptions = dropdownOptions

    remove(
      tempOptions,
      (option: ISelectOption) => option.value === documentType
    )

    const newDocument: IFileValue = {
      optionValues,
      type: processedFile.type,
      data: await getBase64String(processedFile),
      fileSize: processedFile.size
    }

    props.onComplete([...props.files, newDocument])
    if (props.onUploadingStateChanged) {
      props.onUploadingStateChanged(false)
    }

    setErrorMessage(EMPTY_STRING)
    setFields({
      documentType: EMPTY_STRING,
      documentData: EMPTY_STRING
    })
    setDropdownOptions(tempOptions)
    setFilesBeingProcessed((filesCurrentlyBeingProcessed) =>
      filesCurrentlyBeingProcessed.filter(
        ({ label }) => label !== optionValues[1]
      )
    )
  }

  const onDelete = (image: IFileValue | IAttachmentValue) => {
    const previewImage = image as IFileValue
    const addableOption = props.options.find(
      (item: ISelectOption) => item.value === previewImage.optionValues[1]
    ) as ISelectOption
    setDropdownOptions((options) => options.concat(addableOption))
    props.onComplete(props.files.filter((file) => file !== previewImage))
    closePreviewSection()
  }

  const closePreviewSection = () => {
    setPreviewImage(null)
  }

  const selectForPreview = (previewImage: IFileValue | IAttachmentValue) => {
    setPreviewImage(previewImage as IFileValue)
  }

  const getFormattedLabelForDocType = (docType: string) => {
    const matchingOptionForDocType =
      props.options && props.options.find((option) => option.value === docType)
    return matchingOptionForDocType && matchingOptionForDocType.label
  }

  const { requiredErrorMessage } = props

  return (
    <UploadWrapper>
      {errorMessage && (
        <div id="upload-error">
          <ErrorText>
            {(requiredErrorMessage &&
              intl.formatMessage(requiredErrorMessage)) ||
              errorMessage}
          </ErrorText>
        </div>
      )}

      <DocumentListPreview
        documents={props.files}
        dropdownOptions={props.options}
        processingDocuments={filesBeingProcessed}
        onDelete={onDelete}
        onSelect={selectForPreview}
      />
      {props.hideOnEmptyOption && dropdownOptions.length === 0 ? null : props
          .options.length === 1 ? (
        <FullWidthImageUploader
          disabled={filesBeingProcessed.length > 0}
          id="upload_document"
          name={props.name}
          onChange={handleFileChange}
          onClick={(e) => !isValid() && e.preventDefault()}
        >
          {intl.formatMessage(formMessages.addFile)}
        </FullWidthImageUploader>
      ) : (
        <Flex>
          <Select
            id={props.name}
            inputId={props.name}
            isDisabled={filesBeingProcessed.length > 0}
            options={dropdownOptions}
            placeholder={props.placeholder}
            value={fields.documentType}
            onBlur={props.onBlur}
            onChange={onChange}
          />
          <DocumentUploadButton
            disabled={filesBeingProcessed.length > 0}
            id="upload_document"
            name={props.name}
            onChange={handleFileChange}
            onClick={(e) => !isValid() && e.preventDefault()}
          >
            {intl.formatMessage(formMessages.addFile)}
          </DocumentUploadButton>
        </Flex>
      )}

      {previewImage && (
        <DocumentPreview
          goBack={closePreviewSection}
          previewImage={previewImage}
          title={getFormattedLabelForDocType(
            previewImage.optionValues[1] as string
          )}
          onDelete={onDelete}
        />
      )}
    </UploadWrapper>
  )
}
