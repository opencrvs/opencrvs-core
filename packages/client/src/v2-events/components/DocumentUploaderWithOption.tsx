/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

import React, { ComponentProps, useState } from 'react'
import styled from 'styled-components'
import {
  FileFieldValueWithOption,
  FileFieldWithOptionValue,
  SelectOption
} from '@opencrvs/commons/client'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
import { Select } from '../features/events/registered-fields/Select'
import { SimpleDocumentUploader } from './forms/inputs/FileInput/SimpleDocumentUploader'
import { DocumentListPreview } from './DocumentListPreview'

const UploadWrapper = styled.div`
  width: 100%;
`

const Flex = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
`

const DocumentUploadButton = styled(SimpleDocumentUploader)`
  height: 60px;
  flex-shrink: 0;
`

function getUpdatedFiles(
  prevFiles: FileFieldValueWithOption[],
  newFile: FileFieldValueWithOption
) {
  return [
    ...prevFiles.filter(
      (prevFile) => prevFile && newFile && prevFile.option !== newFile.option
    ),
    newFile
  ]
}

export function DocumentUploaderWithOption(
  props: Omit<
    ComponentProps<typeof SimpleDocumentUploader>,
    'onComplete' | 'label' | 'error'
  > & {
    value: FileFieldWithOptionValue
    onChange: (value?: FileFieldValueWithOption[]) => void
    options: SelectOption[]
    error?: boolean
  }
) {
  const { value, onChange, name, description, allowedDocType } = props

  const [files, setFiles] = useState(value ?? [])

  console.log({ files, value })

  const [errorMessage, setErrorMessage] = useState('')

  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    undefined
  )

  const { uploadFiles, deleteFile: deleteFileFromBackend } = useFileUpload(
    name,
    {
      onSuccess: ({ type, originalFilename, filename, option }) => {
        const newFile = {
          filename,
          originalFilename: originalFilename,
          type: type,
          option: option
        }

        console.log('uploaded:', { newFile })

        setFiles((prevFiles) => getUpdatedFiles(prevFiles, newFile))
        onChange(getUpdatedFiles(files, newFile))
        setSelectedOption(undefined)
      }
    }
  )

  function deleteFile(fileName: string) {
    deleteFileFromBackend(fileName)
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file && file.filename !== fileName)
    )
    onchange(files.filter((file) => file && file.filename !== fileName))
  }

  const remainingOptions = props.options.filter(
    ({ value }) => !files.some((file) => file && file.option === value)
  )

  const fileFoo = files.length !== 0 ? files[0] : undefined

  return (
    <UploadWrapper>
      {errorMessage && <div id="upload-error">{errorMessage}</div>}
      <DocumentListPreview
        documents={files}
        dropdownOptions={props.options}
        // processingDocuments={filesBeingProcessed}
        onDelete={deleteFile}
        onSelect={() => console.log('not implemented')}
      />
      {props.options.length === 1 ? (
        <SimpleDocumentUploader
          {...props}
          allowedDocType={allowedDocType}
          description={description}
          error={''}
          fullWidth={true}
          name={name}
          onComplete={(newFile) => {
            if (newFile) {
              setFiles((prevFiles) =>
                getUpdatedFiles(prevFiles, {
                  filename: newFile.name,
                  originalFilename: newFile.name,
                  type: newFile.type,
                  option: selectedOption ?? ''
                })
              )

              uploadFiles(newFile)
            }
            if (files.length > 0) {
              deleteFile(fileFoo?.filename ?? 'foo')
            }
            setFiles([])
            onChange([])
          }}
        />
      ) : (
        <Flex>
          <Select
            id={props.name}
            inputId={props.name}
            // isDisabled={filesBeingProcessed.length > 0}
            isDisabled={false}
            options={remainingOptions}
            // placeholder={'Sele'}
            value={selectedOption}
            // onBlur={props.onBlur}
            onChange={(val) => setSelectedOption(val)}
          />
          <DocumentUploadButton
            {...props}
            allowedDocType={allowedDocType}
            description={description}
            error={''}
            name={name}
            onlyButton={true}
            onComplete={(newFile) => {
              if (newFile) {
                setFiles((prevFiles) =>
                  getUpdatedFiles(prevFiles, {
                    filename: newFile.name,
                    originalFilename: newFile.name,
                    type: newFile.type,
                    option: selectedOption ?? ''
                  })
                )

                uploadFiles(newFile, selectedOption)
              } else {
                if (files.length > 0) {
                  deleteFile(fileFoo?.filename ?? 'foo')
                }
                setFiles([])
                onChange([])
              }
            }}
          />
        </Flex>
      )}

      {/* {previewImage && (
        <DocumentPreview
          goBack={closePreviewSection}
          previewImage={previewImage}
          title={getFormattedLabelForDocType(
            previewImage.optionValues[1] as string
          )}
          onDelete={onDelete}
        />
      )} */}
    </UploadWrapper>
  )
}

export const FileOutput = null
