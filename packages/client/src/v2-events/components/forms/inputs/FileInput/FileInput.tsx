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

import { SimpleDocumentUploader } from './SimpleDocumentUploader'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
import { FileFieldValue } from '@opencrvs/commons/client'
import React, { ComponentProps, useEffect } from 'react'

export function FileInput(
  props: Omit<
    ComponentProps<typeof SimpleDocumentUploader>,
    'onComplete' | 'label'
  > & {
    value: FileFieldValue
    onChange: (value: FileFieldValue | null) => void
  }
) {
  const { value, error, onChange, name, description, allowedDocType } = props

  const {
    getFullURL,
    uploadFiles,
    filename: uploadedFileName
  } = useFileUpload(name)
  const [file, setFile] = React.useState<FileFieldValue | null>(
    value ? value : null
  )

  useEffect(() => {
    if (file === null) {
      return onChange(file)
    }
    if (uploadedFileName && file) {
      return onChange({ ...file, filename: uploadedFileName })
    }
  }, [file, uploadedFileName, onChange])

  return (
    <SimpleDocumentUploader
      {...props}
      name={name}
      label={file ? file.originalFilename : ''}
      description={description}
      allowedDocType={allowedDocType}
      files={
        value
          ? {
              name: value.originalFilename,
              type: value.type,
              data: getFullURL(value.filename),
              uri: getFullURL(value.filename)
            }
          : undefined
      }
      error={error}
      onComplete={(file) => {
        if (file) {
          setFile({
            filename: file.name,
            originalFilename: file.name,
            type: file.type
          })
          uploadFiles(file)
        }
      }}
    />
  )
}

export const FileOutput = null
