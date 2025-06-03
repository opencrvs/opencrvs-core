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

import React from 'react'
import { FileFieldValue, MimeType } from '@opencrvs/commons/client'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
import { SimpleDocumentUploader } from './SimpleDocumentUploader'

function FileInput({
  width,
  value,
  onChange,
  name,
  description,
  acceptedFileTypes,
  maxFileSize,
  label,
  error,
  touched
}: {
  width?: 'full' | 'auto'
  acceptedFileTypes?: MimeType[]
  maxFileSize: number
  value: FileFieldValue | undefined
  onChange: (file?: FileFieldValue) => void
  name: string
  description?: string
  error?: string
  label: string
  touched?: boolean
}) {
  const [file, setFile] = React.useState(value)

  const { uploadFile } = useFileUpload(name, {
    onSuccess: ({ filename, originalFilename, type }) => {
      setFile({
        filename,
        originalFilename: originalFilename,
        type: type
      })
      onChange({
        filename,
        originalFilename: originalFilename,
        type: type
      })
    }
  })

  return (
    <SimpleDocumentUploader
      acceptedFileTypes={acceptedFileTypes}
      description={description}
      error={error}
      file={file}
      label={label}
      maxFileSize={maxFileSize}
      name={name}
      touched={touched}
      width={width}
      onComplete={(newFile) => {
        if (newFile) {
          setFile({
            filename: newFile.name,
            originalFilename: newFile.name,
            type: newFile.type
          })
          uploadFile(newFile)
        }
        if (!newFile && file) {
          setFile(undefined)
        }
        setFile(undefined)
        onChange(undefined)
      }}
    />
  )
}

export const File = {
  Input: FileInput,
  Output: null
}
