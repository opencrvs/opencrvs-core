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
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import {
  FileFieldValueWithOption,
  FileFieldWithOptionValue,
  MimeType,
  SelectOption
} from '@opencrvs/commons/client'
import { ErrorText } from '@opencrvs/components'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
import { Select } from '@client/v2-events/features/events/registered-fields/Select'
import { formMessages as messages } from '@client/i18n/messages'
import { DocumentUploader } from './SimpleDocumentUploader'
import { DocumentListPreview } from './DocumentListPreview'
import { DocumentPreview } from './DocumentPreview'
import { File } from './FileInput'
import { useOnFileChange } from './useOnFileChange'

const UploadWrapper = styled.div`
  width: 100%;
`

const DropdownContainer = styled.div`
  flex-grow: 1;
`
const Flex = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
`

function getUpdatedFiles(
  prevFiles: FileFieldValueWithOption[],
  newFile: FileFieldValueWithOption
) {
  return [
    ...prevFiles.filter((prevFile) => prevFile.option !== newFile.option),
    newFile
  ]
}

const DocumentTypeRequiredError = {
  id: 'imageUploadOption.upload.documentType',
  defaultMessage: 'Please select the type of document first',
  description: 'Show error message if the document type is not selected'
}

function DocumentUploaderWithOption({
  value,
  onChange,
  name,
  description,
  acceptedFileTypes = [],
  options,
  error,
  hideOnEmptyOption,
  autoSelectOnlyOption,
  maxFileSize
}: {
  name: string
  description?: string
  acceptedFileTypes?: MimeType[]
  options: SelectOption[]
  value: FileFieldWithOptionValue
  onChange: (file?: FileFieldValueWithOption[]) => void
  error?: string
  hideOnEmptyOption?: boolean
  autoSelectOnlyOption?: boolean
  maxFileSize: number
}) {
  const intl = useIntl()
  const documentTypeRequiredErrorMessage = intl.formatMessage(
    DocumentTypeRequiredError
  )

  const [files, setFiles] = useState(value)
  const [filesBeingProcessed, setFilesBeingProcessed] = useState<
    Array<{ label: string }>
  >([])

  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    undefined
  )
  const [unselectedOptionError, setUnselectedOptionError] = useState('')

  const [previewImage, setPreviewImage] =
    useState<FileFieldValueWithOption | null>(null)

  const { uploadFile, deleteFile: deleteFileFromBackend } = useFileUpload(
    name,
    {
      onSuccess: ({ type, originalFilename, filename, id }) => {
        const newFile = {
          filename,
          originalFilename: originalFilename,
          type: type,
          option: id
        }

        setFilesBeingProcessed((prev) =>
          prev.filter(({ label }) => label !== id)
        )

        setFiles((prevFiles) => getUpdatedFiles(prevFiles, newFile))
        onChange(getUpdatedFiles(files, newFile))
        setSelectedOption(undefined)
      }
    }
  )

  const getLabelForDocumentOption = (docType: string) => {
    const label = options.find(({ value: val }) => val === docType)?.label
    return label && intl.formatMessage(label)
  }

  const onComplete = (newFile: File | null) => {
    if (newFile) {
      if (selectedOption) {
        setFilesBeingProcessed((prev) => [...prev, { label: selectedOption }])

        uploadFile(newFile, selectedOption)
      } else {
        setUnselectedOptionError(documentTypeRequiredErrorMessage)
      }
    }
  }

  const { error: fileChangeError, handleFileChange } = useOnFileChange({
    acceptedFileTypes,
    onComplete,
    maxFileSize
  })

  const onDeleteFile = (fileName: string) => {
    deleteFileFromBackend(fileName)
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.filename !== fileName)
    )
    onChange(files.filter((file) => file.filename !== fileName))
    setPreviewImage(null)
  }

  const remainingOptions = options.filter(
    ({ value: val }) => !files.some((file) => file.option === val)
  )

  if (hideOnEmptyOption && remainingOptions.length === 0) {
    return null
  }

  if (options.length === 1) {
    const [onlyOption] = options
    return (
      <File.Input
        acceptedFileTypes={acceptedFileTypes}
        description={description}
        error={error}
        label={intl.formatMessage(onlyOption.label)}
        maxFileSize={maxFileSize}
        name={name}
        value={value[0]}
        width={'full'}
        onChange={(file) => {
          if (file) {
            onChange([{ ...file, option: onlyOption.value }])
          }
        }}
      />
    )
  }

  if (
    autoSelectOnlyOption &&
    remainingOptions.length === 1 &&
    remainingOptions[0].value !== selectedOption
  ) {
    setSelectedOption(remainingOptions[0].value)
  }

  const errorMessage = error || unselectedOptionError || fileChangeError || ''

  return (
    <UploadWrapper>
      {errorMessage && (
        <div id="upload-error">
          <ErrorText>{errorMessage}</ErrorText>
        </div>
      )}
      <DocumentListPreview
        documents={files}
        dropdownOptions={options}
        processingDocuments={filesBeingProcessed}
        onDelete={onDeleteFile}
        onSelect={(document) =>
          setPreviewImage(document as FileFieldValueWithOption)
        }
      />

      <Flex>
        <DropdownContainer>
          <Select.Input
            id={name}
            options={remainingOptions}
            type={'SELECT'}
            value={selectedOption}
            onChange={(val) => {
              setSelectedOption(val)
              setUnselectedOptionError('')
            }}
          />
        </DropdownContainer>
        <DocumentUploader
          disabled={Boolean(error)}
          id={name}
          name={name}
          onChange={error ? undefined : handleFileChange}
        >
          {intl.formatMessage(messages.uploadFile)}
        </DocumentUploader>
      </Flex>

      {previewImage && (
        <DocumentPreview
          goBack={() => setPreviewImage(null)}
          previewImage={previewImage}
          title={getLabelForDocumentOption(previewImage.option)}
          onDelete={(file) => {
            onDeleteFile(file.filename)
          }}
        />
      )}
    </UploadWrapper>
  )
}

const DocumentWithOptionOutput = null

export const FileWithOption = {
  Input: DocumentUploaderWithOption,
  Output: DocumentWithOptionOutput
}
