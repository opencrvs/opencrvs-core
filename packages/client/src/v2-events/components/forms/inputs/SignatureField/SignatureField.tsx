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

import { useState } from 'react'
import { useIntl } from 'react-intl'
import * as React from 'react'
import styled from 'styled-components'
import { ImageUploader, InputError } from '@opencrvs/components'
import { Stack } from '@opencrvs/components/lib/Stack'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { FileFieldValue, MimeType } from '@opencrvs/commons/client'
import { messages } from '@client/i18n/messages/views/review'
import { buttonMessages, validationMessages } from '@client/i18n/messages'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
import {
  cacheFile,
  getFullDocumentPath,
  getUnsignedFileUrl
} from '@client/v2-events/cache'
import { useOnFileChange } from '../FileInput/useOnFileChange'
import { SignatureCanvasModal } from './components/SignatureCanvasModal'

/** Based on packages/client/src/components/form/SignatureField/SignatureUploader.tsx */

const SignaturePreview = styled.img`
  max-width: 50%;
  display: block;
`

interface SignatureFieldProps {
  name: string
  /**
   * File should be stored in the cache where it is then retrieved by the component.
   */
  value?: FileFieldValue
  onChange: (value: FileFieldValue | null) => void
  required?: boolean
  maxFileSize: number
  acceptedFileTypes?: MimeType[]
  modalTitle: string
  disabled?: boolean
}

/**
 * given a base64 string, convert it to a File object
 * Function intentionally uses atob rather than fetch to allow strict CSP.
 */
function base64ToFile(fileString: string, filename: string) {
  const [header, base64] = fileString.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || MimeType.enum['image/png']

  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

  return new File([bytes], filename, { type: mime })
}

export function SignatureField({
  value,
  onChange,
  required,
  name,
  modalTitle,
  maxFileSize,
  acceptedFileTypes = ['image/png'],
  disabled
}: SignatureFieldProps) {
  const intl = useIntl()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [signature, setSignature] = useState<FileFieldValue | undefined>(value)
  const [touched, setTouched] = useState(false)

  const { uploadFile } = useFileUpload(name, {
    onSuccess: ({ path, originalFilename, type }) => {
      setSignature({
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

  const onComplete = (newFile: File | null) => {
    if (!newFile) {
      return
    }

    uploadFile(newFile)
  }

  const { error: onUploadError, handleFileChange } = useOnFileChange({
    acceptedFileTypes,
    onComplete,
    maxFileSize
  })

  const errorMessage = React.useMemo(() => {
    if (onUploadError) {
      return onUploadError
    }

    if (!signature) {
      return touched && required
        ? intl.formatMessage(validationMessages.required)
        : undefined
    }

    return undefined
  }, [signature, touched, required, onUploadError, intl])

  return (
    <>
      {!signature && (
        <>
          <Stack gap={8}>
            <Button
              disabled={disabled}
              size="medium"
              type="secondary"
              onClick={() => {
                setIsModalOpen(true)

                setTouched(true)
              }}
            >
              <Icon name="Pen" />
              {intl.formatMessage(messages.signatureOpenSignatureInput)}
            </Button>
            <ImageUploader disabled={disabled} onChange={handleFileChange}>
              {intl.formatMessage(buttonMessages.upload)}
            </ImageUploader>
          </Stack>
        </>
      )}
      {signature && (
        <SignaturePreview
          alt={modalTitle}
          src={getUnsignedFileUrl(signature.path)}
        />
      )}
      {signature && !disabled && (
        <Button
          size="medium"
          type="tertiary"
          onClick={() => {
            onChange(null)
            setSignature(undefined)
            setTouched(true)
          }}
        >
          {intl.formatMessage(messages.signatureDelete)}
        </Button>
      )}

      {errorMessage && (
        <InputError id={`${name}_error`}>{errorMessage}</InputError>
      )}
      {isModalOpen && (
        <SignatureCanvasModal
          id={name}
          title={modalTitle}
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (signatureBase64: string) => {
            const signatureFile = base64ToFile(
              signatureBase64,
              `signature-${name}-${Date.now()}.png`
            )
            const path = getFullDocumentPath(signatureFile.name)

            // When we are in offline mode, the actual upload might not happen immediately.
            // Cache the "temporary" file to allow using same functionality for all files.
            await cacheFile({
              url: getUnsignedFileUrl(path),
              file: signatureFile
            })

            setSignature({
              path,
              originalFilename: signatureFile.name,
              type: signatureFile.type
            })

            handleFileChange(signatureFile)
            setIsModalOpen(false)
          }}
        />
      )}
    </>
  )
}
