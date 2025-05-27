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
import { MimeType } from '@opencrvs/commons/client'
import { messages } from '@client/i18n/messages/views/review'
import { validationMessages } from '@client/i18n/messages'
import { dataUrlToFile, getBase64String } from '@client/utils/imageUtils'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
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
  value?: string
  onChange: (fileSrc: string) => void
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

  /**
   * source can be a base64 string or external url.
   * When page is refreshed, value is read in from props. At this point, we know that cache has been updated with the file URL if we uploaded anything.
   * @see onComplete
   */
  const [dataUrl, setDataUrl] = useState<string | undefined>(value)

  const requiredError =
    props.required &&
    !Boolean(value) &&
    intl.formatMessage(validationMessages.required)

  const { uploadFile, getFullUrl } = useFileUpload(name, {
    onSuccess: ({ filename }) => {
      onChange(getFullUrl(filename))
    }
  })

  const onComplete = async (newFile: File | null) => {
    if (!newFile) {
      return
    }

    const newFileSrc = (await getBase64String(newFile)).toString()
    // To keep the file visible in read mode, we convert it to base64 and use the local state reference.
    setDataUrl(newFileSrc)

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
      {value && <SignaturePreview alt={modalTitle} src={dataUrl} />}
      {value && !props.disabled && (
        <Button
          size="medium"
          type="tertiary"
          onClick={() => {
            onChange('') // @TODO
            setDataUrl(undefined)
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
          onSubmit={async (signature: string) => {
            const signatureFile = await dataUrlToFile(
              signature,
              `signature-${name}-${Date.now()}.png`
            )

            setDataUrl(dataUrl)
            handleFileChange(signatureFile)

            setIsModalOpen(false)
          }}
        />
      )}
    </>
  )
}
