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
import styled from 'styled-components'
import { MimeType, FieldValue, FileFieldValue } from '@opencrvs/commons/client'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { ImageUploader } from '@opencrvs/components/lib/ImageUploader'
import { buttonMessages, formMessages as messages } from '@client/i18n/messages'
import { DocumentPreview } from './DocumentPreview'
import { SingleDocumentPreview } from './SingleDocumentPreview'
import { useOnFileChange } from './useOnFileChange'

export const DocumentUploader = styled(ImageUploader)<{ fullWidth?: boolean }>`
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => `2px solid ${theme.colors.primary}`};
  border-radius: 4px;
  ${({ theme }) => theme.fonts.bold16};
  height: 46px;
  text-transform: initial;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: 0px;
  }
`

const FieldDescription = styled.div`
  margin-top: 0px;
  margin-bottom: 6px;
`

interface SimpleDocumentUploaderProps {
  name: string
  label?: string
  file?: FileFieldValue
  description?: string
  width?: 'full' | 'auto'
  acceptedFileTypes?: MimeType[]
  error?: string
  disableDeleteInPreview?: boolean
  onComplete: (file: File | null) => void
  touched?: boolean
  onUploadingStateChanged?: (isUploading: boolean) => void
  previewTransformer?: (files: FileFieldValue) => FileFieldValue
  maxFileSize: number
}

export function SimpleDocumentUploader({
  acceptedFileTypes = [],
  name,
  onUploadingStateChanged,
  previewTransformer,
  onComplete,
  label,
  file,
  description,
  error: errorProps,
  disableDeleteInPreview,
  touched,
  width,
  maxFileSize
}: SimpleDocumentUploaderProps) {
  const intl = useIntl()
  const [previewImage, setPreviewImage] = useState<FileFieldValue | null>(null)

  const { error, handleFileChange } = useOnFileChange({
    acceptedFileTypes,
    onComplete,
    onUploadingStateChanged,
    maxFileSize
  })

  function selectForPreview(selectedPreviewImage: FieldValue) {
    if (previewTransformer) {
      return setPreviewImage(
        previewTransformer(selectedPreviewImage as FileFieldValue)
      )
    }
    setPreviewImage(selectedPreviewImage as FileFieldValue)
  }

  function closePreviewSection() {
    setPreviewImage(null)
  }

  function onDelete() {
    onComplete(null)
    closePreviewSection()
  }

  const errorMessage = error || errorProps || ''

  return (
    <>
      {description && <FieldDescription>{description}</FieldDescription>}
      {errorMessage && (touched || error) && (
        <ErrorText id="field-error">{errorMessage}</ErrorText>
      )}
      <SingleDocumentPreview
        attachment={file}
        label={label}
        onDelete={onDelete}
        onSelect={selectForPreview}
      />
      {previewImage && (
        <DocumentPreview
          disableDelete={disableDeleteInPreview}
          goBack={closePreviewSection}
          previewImage={previewImage}
          title={intl.formatMessage(buttonMessages.preview)}
          onDelete={onDelete}
        />
      )}
      {!file && (
        <DocumentUploader
          fullWidth={width === 'full'}
          id={name}
          name={name}
          onChange={handleFileChange}
        >
          {intl.formatMessage(messages.uploadFile)}
        </DocumentUploader>
      )}
    </>
  )
}
