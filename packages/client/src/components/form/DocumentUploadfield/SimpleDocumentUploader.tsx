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
import { ImageUploader } from '@opencrvs/components/lib/ImageUploader'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { DocumentPreview } from '@client/components/form/DocumentUploadfield/DocumentPreview'
import { IFormFieldValue, IAttachmentValue } from '@client/forms'
import React, { useState } from 'react'
import {
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  MessageDescriptor
} from 'react-intl'
import styled from 'styled-components'
import { DocumentListPreview } from './DocumentListPreview'
import { buttonMessages, formMessages as messages } from '@client/i18n/messages'
import { getBase64String, ErrorMessage } from './DocumentUploaderWithOption'

const DocumentUploader = styled(ImageUploader)`
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => `2px solid ${theme.colors.primary}`};
  border-radius: 4px;
  ${({ theme }) => theme.fonts.bold14};
  height: 40px;
  text-transform: initial;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: 0px;
    margin-top: 10px;
  }
`

const FieldDescription = styled.div`
  margin-top: 0px;
  margin-bottom: 6px;
`

type IFullProps = {
  name: string
  label: string
  files?: IAttachmentValue
  description?: string
  allowedDocType?: string[]
  error?: string
  disableDeleteInPreview?: boolean
  onComplete: (files: IAttachmentValue | {}) => void
  touched?: boolean
  onUploadingStateChanged?: (isUploading: boolean) => void
  requiredErrorMessage?: MessageDescriptor
  previewTransformer?: (files: IAttachmentValue) => IAttachmentValue
} & IntlShapeProps

const SimpleDocumentUploaderComponent = ({
  allowedDocType,
  onUploadingStateChanged,
  intl,
  previewTransformer,
  onComplete,
  label,
  files,
  description,
  error: errorProps,
  disableDeleteInPreview,
  requiredErrorMessage,
  touched
}: IFullProps) => {
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState<IAttachmentValue | null>(
    null
  )
  const [filesBeingUploaded, setFilesBeingUploaded] = useState<
    { label: string }[]
  >([])

  const handleFileChange = async (uploadedImage: File) => {
    if (!uploadedImage) {
      return
    }

    setFilesBeingUploaded([
      ...filesBeingUploaded,
      { label: uploadedImage.name }
    ])

    onUploadingStateChanged && onUploadingStateChanged(true)

    if (
      allowedDocType &&
      allowedDocType.length > 0 &&
      !allowedDocType.includes(uploadedImage.type)
    ) {
      onUploadingStateChanged && onUploadingStateChanged(false)
      setFilesBeingUploaded([])
      const newErrorMessage = intl.formatMessage(messages.fileUploadError, {
        type: allowedDocType
          .map((docTypeStr) => docTypeStr.split('/').pop())
          .join(', ')
      })

      setError(newErrorMessage)
    } else {
      onUploadingStateChanged && onUploadingStateChanged(false)
      onComplete({
        name: uploadedImage.name,
        type: uploadedImage.type,
        data: await getBase64String(uploadedImage)
      })
      setError('')
      setFilesBeingUploaded([])
    }
  }

  const selectForPreview = (previewImage: IFormFieldValue) => {
    if (previewTransformer) {
      return setPreviewImage(
        previewTransformer(previewImage as IAttachmentValue)
      )
    }
    setPreviewImage(previewImage as IAttachmentValue)
  }

  const closePreviewSection = () => {
    setPreviewImage(null)
  }

  const onDelete = (image: IFormFieldValue) => {
    onComplete('')
    closePreviewSection()
  }

  const errorMessage =
    (requiredErrorMessage && intl.formatMessage(requiredErrorMessage)) ||
    error ||
    errorProps ||
    ''

  return (
    <>
      {description && <FieldDescription>{description}</FieldDescription>}
      <ErrorMessage>
        {errorMessage && (touched || error) && (
          <ErrorText ignoreMediaQuery id="field-error">
            {errorMessage}
          </ErrorText>
        )}
      </ErrorMessage>
      <DocumentListPreview
        attachment={files}
        onSelect={selectForPreview}
        label={label}
        onDelete={onDelete}
        processingDocuments={filesBeingUploaded}
      />
      {previewImage && (
        <DocumentPreview
          previewImage={previewImage}
          disableDelete={disableDeleteInPreview}
          title={intl.formatMessage(buttonMessages.preview)}
          goBack={closePreviewSection}
          onDelete={onDelete}
        />
      )}
      {(!files || !files.data) && (
        <DocumentUploader
          id="upload_document"
          title={intl.formatMessage(messages.uploadFile)}
          handleFileChange={handleFileChange}
        />
      )}
    </>
  )
}

export const SimpleDocumentUploader = injectIntl<'intl', IFullProps>(
  SimpleDocumentUploaderComponent
)
