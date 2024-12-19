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
import { FileFieldValue } from '@opencrvs/commons/client'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
import { SimpleDocumentUploader } from './SimpleDocumentUploader'

export function FileInput(
  props: Omit<
    ComponentProps<typeof SimpleDocumentUploader>,
    'onComplete' | 'label' | 'error'
  > & {
    value: FileFieldValue | undefined
    onChange: (value?: FileFieldValue) => void
    error?: boolean
  }
) {
  const { value, onChange, name, description, allowedDocType } = props

  const [file, setFile] = React.useState(value)

  const { uploadFiles } = useFileUpload(name, {
    onSuccess: ({ filename }) => {
      if (!file) {
        throw new Error('File is not defined. This should never happen')
      }
      setFile({
        filename,
        originalFilename: file.originalFilename,
        type: file.type
      })

      onChange({
        filename,
        originalFilename: file.originalFilename,
        type: file.type
      })
    }
  })

  return (
    <SimpleDocumentUploader
      {...props}
      allowedDocType={allowedDocType}
      description={description}
      error={''}
      file={file ? file : undefined}
      label={file ? file.originalFilename : ''}
      name={name}
      onComplete={(newFile) => {
        if (newFile) {
          setFile({
            filename: newFile.name,
            originalFilename: newFile.name,
            type: newFile.type
          })
          uploadFiles(newFile)
        } else {
          setFile(undefined)
          onChange(undefined)
        }
      }}
    />
  )
}

export const FileOutput = null
