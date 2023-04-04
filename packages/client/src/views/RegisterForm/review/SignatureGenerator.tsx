/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/review'
import {
  ErrorText,
  ImageUploader,
  InputField,
  ResponsiveModal
} from '@opencrvs/components'
import {
  SecondaryButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { buttonMessages, formMessages } from '@client/i18n/messages'
import { getBase64String } from '@client/utils/imageUtils'
import {
  ApplyButton,
  CancelButton
} from '@client/views/SysAdmin/Config/Application/Components'
import * as React from 'react'
import styled from '@client/styledComponents'
import SignatureCanvas from 'react-signature-canvas'
import { isBase64FileString } from '@client/utils/commonUtils'
import { EMPTY_STRING } from '@client/utils/constants'

const InputWrapper = styled.div`
  margin-top: 56px;
`

const SignatureContainer = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.grey600};
  border-radius: 4px;
  width: 100%;
`
const SignatureInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`
const SignaturePreview = styled.img`
  max-width: 50%;
  display: block;
`
const ErrorMessage = styled.div`
  margin-top: 16px;
`

const SignatureDescription = styled.p`
  margin-top: 0;
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.grey500};
`

const CustomImageUpload = styled(ImageUploader)`
  border: 0 !important;
`

export interface SignatureInputProps {
  id: string
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  isRequired?: boolean
  label: string
  description?: string
}

export function SignatureGenerator({
  id,
  value,
  onChange,
  disabled,
  label,
  description,
  isRequired
}: SignatureInputProps) {
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)
  const [signatureValue, setSignatureValue] = useState(EMPTY_STRING)
  const [signatureError, setSignatureError] = useState(EMPTY_STRING)
  const intl = useIntl()
  const allowedSignatureFormat = ['image/png']

  const signatureData =
    value && !isBase64FileString(value)
      ? `${window.config.MINIO_URL}${value}`
      : value

  function apply() {
    setSignatureDialogOpen(false)
    onChange(signatureValue)
  }

  return (
    <InputWrapper>
      <InputField id={id} touched={false} required={isRequired} label={label}>
        <div>
          {description && (
            <SignatureDescription>{description}</SignatureDescription>
          )}
          <ErrorMessage id="signature-upload-error">
            {signatureError && <ErrorText>{signatureError}</ErrorText>}
          </ErrorMessage>
          {!signatureData && (
            <>
              <SecondaryButton
                onClick={() => setSignatureDialogOpen(true)}
                disabled={disabled}
              >
                {intl.formatMessage(messages.signatureOpenSignatureInput)}
              </SecondaryButton>
              <CustomImageUpload
                id="signature-file-upload"
                title="Upload"
                handleFileChange={async (file) => {
                  const fileSizeMB = file.size / (1024 * 1024) // convert bytes to megabytes
                  if (fileSizeMB > 2) {
                    setSignatureError(
                      intl.formatMessage(formMessages.fileSizeError)
                    )
                    return
                  }
                  if (!allowedSignatureFormat.includes(file.type)) {
                    setSignatureError(
                      intl.formatMessage(formMessages.fileUploadError, {
                        type: allowedSignatureFormat
                          .map((signatureFormat) =>
                            signatureFormat.split('/').pop()
                          )
                          .join(', ')
                      })
                    )
                    return
                  }
                  onChange((await getBase64String(file)).toString())
                  setSignatureError('')
                }}
                disabled={disabled}
              />
            </>
          )}
          {signatureData && (
            <SignaturePreview alt={label} src={signatureData} />
          )}
          {signatureData && (
            <TertiaryButton onClick={() => onChange('')}>
              {intl.formatMessage(messages.signatureDelete)}
            </TertiaryButton>
          )}

          <ResponsiveModal
            id={`${id}_modal`}
            title={label}
            autoHeight={true}
            titleHeightAuto={true}
            width={600}
            show={signatureDialogOpen}
            actions={[
              <CancelButton
                key="cancel"
                id="modal_cancel"
                onClick={() => setSignatureDialogOpen(false)}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </CancelButton>,
              <ApplyButton
                key="apply"
                id="apply_change"
                disabled={false}
                onClick={apply}
              >
                {intl.formatMessage(buttonMessages.apply)}
              </ApplyButton>
            ]}
            handleClose={() => setSignatureDialogOpen(false)}
          >
            <SignatureDescription>
              {intl.formatMessage(messages.signatureInputDescription)}
            </SignatureDescription>
            <SignCanvas value={value} onChange={setSignatureValue} />
          </ResponsiveModal>
        </div>
      </InputField>
    </InputWrapper>
  )
}

function SignCanvas({
  value,
  onChange
}: {
  value?: string
  onChange: (value: string) => void
}) {
  const [canvasWidth, setCanvasWidth] = useState(300)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<SignatureCanvas>(null)
  const intl = useIntl()

  useEffect(() => {
    function handleResize() {
      if (canvasContainerRef.current) {
        setCanvasWidth(canvasContainerRef.current.offsetWidth)
      }
    }

    window.addEventListener('resize', handleResize)

    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [canvasContainerRef])

  useEffect(() => {
    if (canvasRef.current && value) {
      canvasRef.current.fromDataURL(value)
    }
  }, [value])

  function emitValueToParent() {
    const data = canvasRef.current?.toDataURL()
    if (!data) {
      return
    }
    onChange(data)
  }

  function clear() {
    canvasRef.current?.clear()
    onChange('')
  }

  return (
    <SignatureInputContainer>
      <SignatureContainer ref={canvasContainerRef}>
        <SignatureCanvas
          ref={canvasRef}
          onEnd={() => {
            emitValueToParent()
          }}
          penColor="black"
          canvasProps={{
            width: canvasWidth,
            height: 200
          }}
        />
      </SignatureContainer>
      <TertiaryButton onClick={clear}>
        {intl.formatMessage(messages.clear)}
      </TertiaryButton>
    </SignatureInputContainer>
  )
}
