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
import { useImageEditorModal } from '@client/v2-events/components/ImageEditorModal'
import { useImageProcessing } from '@client/utils/imageUtils'
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
  disabled,
  maxImageSize
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
  maxImageSize?: FileConfig['configuration']['maxImageSize']
}) {
  const [file, setFile] = React.useState(value)
  const [modal, openModal] = useImageEditorModal()
  const { processImageFile } = useImageProcessing()

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

  const handleOnComplete = async (newFile: File | null) => {
    if (!newFile) {
      setFile(undefined)
      onChange(null)
      return
    }

    const processedFile = await processImageFile(
      newFile,
      openModal,
      maxImageSize,
      error
    )

    if (!processedFile) {
      return
    }

    setFile({
      path: getFullDocumentPath(processedFile.name),
      originalFilename: processedFile.name,
      type: processedFile.type
    })
    uploadFile(processedFile)
  }

  return (
    <>
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
        onComplete={handleOnComplete}
      />
      {modal}
    </>
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

function stringify(value: FileFieldValue | undefined) {
  const parsed = FileFieldValue.safeParse(value)

  if (parsed.success) {
    return new URL(parsed.data.path, window.config.MINIO_BASE_URL).href
  }

  return ''
}

export const File = {
  Input: FileInput,
  Output: FileOutput,
  stringify
}
