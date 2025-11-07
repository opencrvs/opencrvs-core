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
import { useIntl } from 'react-intl'
import {
  FileFieldValue,
  MimeType,
  File as FileConfig,
  SignatureField as SignatureFieldConfig
} from '@opencrvs/commons/client'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
import { getFullDocumentPath } from '@client/v2-events/cache'
import { buttonMessages } from '@client/i18n/messages'
import { SimpleDocumentUploader } from './SimpleDocumentUploader'
import { DocumentPreview } from './DocumentPreview'
import { SingleDocumentPreview } from './SingleDocumentPreview'

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
  touched,
  disabled
}: {
  width?: 'full' | 'auto'
  acceptedFileTypes?: MimeType[]
  maxFileSize: number
  value: FileFieldValue | undefined
  onChange: (file: FileFieldValue | null) => void
  name: string
  description?: string
  error?: string
  label: string
  touched?: boolean
  disabled?: boolean
}) {
  const [file, setFile] = React.useState(value)

  const { uploadFile } = useFileUpload(name, {
    onSuccess: ({ path, originalFilename, type }) => {
      setFile({
        path,
        originalFilename,
        type
      })

      onChange({
        path,
        originalFilename,
        type
      })
    }
  })

  return (
    <SimpleDocumentUploader
      acceptedFileTypes={acceptedFileTypes}
      description={description}
      disabled={disabled}
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
            path: getFullDocumentPath(newFile.name),
            originalFilename: newFile.name,
            type: newFile.type
          })

          uploadFile(newFile)
        }
        if (!newFile && file) {
          setFile(undefined)
        }
        setFile(undefined)
        onChange(null)
      }}
    />
  )
}

function FileOutput({
  value,
  config
}: {
  value?: FileFieldValue
  config: FileConfig | SignatureFieldConfig
}) {
  const intl = useIntl()
  const [previewImage, setPreviewImage] = useState<boolean>(false)

  if (!value) {
    return null
  }

  return (
    <>
      <SingleDocumentPreview
        attachment={value}
        label={
          'fileName' in config.configuration && config.configuration.fileName
            ? intl.formatMessage(config.configuration.fileName)
            : intl.formatMessage(config.label)
        }
        onSelect={() => setPreviewImage(true)}
      />
      {previewImage && (
        <DocumentPreview
          disableDelete={true}
          goBack={() => {
            setPreviewImage(false)
          }}
          previewImage={value}
          title={intl.formatMessage(buttonMessages.preview)}
          onDelete={() => setPreviewImage(false)}
        />
      )}
    </>
  )
}

export const File = {
  Input: FileInput,
  Output: FileOutput
}
