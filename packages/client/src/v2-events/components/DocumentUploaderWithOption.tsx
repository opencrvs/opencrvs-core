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

import React, { ComponentProps } from 'react'
import {
  FileFieldValueWithOption,
  FileFieldWithOptionValue
} from '@opencrvs/commons/client'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
import { SimpleDocumentUploader } from './forms/inputs/FileInput/SimpleDocumentUploader'

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
    error?: boolean
  }
) {
  const { value, onChange, name, description, allowedDocType } = props

  const [files, setFiles] = React.useState(value ?? [])

  const { uploadFiles, deleteFile } = useFileUpload(name, {
    onSuccess: ({ type, originalFilename, filename, option }) => {
      const newFile = {
        filename,
        originalFilename: originalFilename,
        type: type,
        option: option
      }

      setFiles((prevFiles) => getUpdatedFiles(prevFiles, newFile))
      onChange(getUpdatedFiles(files, newFile))
    }
  })

  const fileFoo = files.length !== 0 ? files[0] : undefined

  return (
    <SimpleDocumentUploader
      {...props}
      allowedDocType={allowedDocType}
      description={description}
      error={''}
      file={fileFoo}
      label={fileFoo?.originalFilename}
      name={name}
      onComplete={(newFile) => {
        if (newFile) {
          setFiles((prevFiles) =>
            getUpdatedFiles(prevFiles, {
              filename: newFile.name,
              originalFilename: newFile.name,
              type: newFile.type,
              option: ''
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
  )
}

export const FileOutput = null
