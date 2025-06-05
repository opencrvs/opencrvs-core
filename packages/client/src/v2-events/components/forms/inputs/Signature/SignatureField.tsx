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
import { validationMessages } from '@client/i18n/messages'
import { dataUrlToFile } from '@client/utils/imageUtils'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
import {
  cacheFile,
  getUnsignedFileUrl
} from '@client/utils/persistence/fileCache'
import { useOnFileChange } from '../FileInput/useOnFileChange'
import { SignatureCanvasModal } from './components/SignatureCanvasModal'

/** Based on packages/client/src/components/form/SignatureField/SignatureUploader.tsx */

const SignaturePreview = styled.img`
  max-width: 50%;
  display: block;
`

export type SignatureFieldProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'value' | 'type'
> & {
  name: string
  /**
   * Value is a file name, which is stored in the cache.
   */
  value?: FileFieldValue
  onChange: (value: FileFieldValue | undefined) => void
  required?: boolean
  maxFileSize: number
  acceptedFileTypes?: MimeType[]
  modalTitle: string
}

export function SignatureField({
  value,
  onChange,
  name,
  modalTitle,
  maxFileSize,
  acceptedFileTypes = ['image/png'],
  ...props
}: SignatureFieldProps) {
  const intl = useIntl()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [signature, setSignature] = useState<FileFieldValue | undefined>(value)

  const requiredError =
    props.required &&
    !Boolean(value) &&
    intl.formatMessage(validationMessages.required)

  const { uploadFile } = useFileUpload(name, {
    onSuccess: ({ filename, originalFilename, type }) => {
      setSignature({
        filename,
        originalFilename,
        type
      })

      onChange({
        filename,
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

  const { error, handleFileChange } = useOnFileChange({
    acceptedFileTypes,
    onComplete,
    maxFileSize
  })

  return (
    <>
      {!value && (
        <>
          <Stack gap={8}>
            <Button
              disabled={props.disabled}
              size="medium"
              type="secondary"
              onClick={() => setIsModalOpen(true)}
            >
              <Icon name="Pen" />
              {intl.formatMessage(messages.signatureOpenSignatureInput)}
            </Button>
            <ImageUploader
              {...props}
              onChange={handleFileChange}
            ></ImageUploader>
          </Stack>
        </>
      )}
      {signature && (
        <SignaturePreview
          alt={modalTitle}
          src={getUnsignedFileUrl(signature.filename)}
        />
      )}
      {value && !props.disabled && (
        <Button
          size="medium"
          type="tertiary"
          onClick={() => {
            onChange(undefined) // @TODO
            setSignature(undefined)
          }}
        >
          {intl.formatMessage(messages.signatureDelete)}
        </Button>
      )}
      {/* @todo */}
      {(requiredError || error) && (
        <InputError id={`${name}_error`}>{requiredError ?? error}</InputError>
      )}
      {isModalOpen && (
        <SignatureCanvasModal
          id={name}
          title={modalTitle}
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (signatureBase64: string) => {
            const signatureFile = await dataUrlToFile(
              signatureBase64,
              `signature-${name}-${Date.now()}.png`
            )

            // When we are in offline mode, the actual upload might not happen immediately.
            // Cache the "temporary" file to allow using same functionality for all files.
            await cacheFile({
              filename: signatureFile.name,
              file: signatureFile
            })

            setSignature({
              filename: signatureFile.name,
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
