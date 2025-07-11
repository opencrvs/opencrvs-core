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
import * as React from 'react'
import styled from 'styled-components'
import {
  IImage,
  validateImage,
  ERROR_TYPES,
  IMAGE_UPLOAD_MAX_SIZE_IN_BYTES,
  bytesToMB
} from '@client/utils/imageUtils'
import { ALLOWED_IMAGE_TYPE } from '@client/utils/constants'
import { messages } from '@client/i18n/messages/views/imageUpload'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'

const HiddenInput = styled.input`
  display: none;
`

type IProps = {
  children: React.ReactNode
  onImageLoaded: (image: IImage) => void
  onLoadingStarted?: () => void
  onError: (error: string) => void
} & IntlShapeProps

function ImageLoaderComp({
  children,
  onImageLoaded,
  onLoadingStarted,
  onError,
  intl
}: IProps) {
  const fileUploader = React.useRef<HTMLInputElement>(null)

  const handleSelectFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { files } = event.target
    if (files && files.length > 0) {
      try {
        onLoadingStarted && onLoadingStarted()
        const image = await validateImage(files[0])
        onImageLoaded({ type: files[0].type, data: image })
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === ERROR_TYPES.OVERSIZED) {
            onError(
              intl.formatMessage(messages.overSized, {
                maxSize: bytesToMB(IMAGE_UPLOAD_MAX_SIZE_IN_BYTES)
              })
            )
          } else {
            onError(
              intl.formatMessage(messages.imageFormat, {
                maxSize: bytesToMB(IMAGE_UPLOAD_MAX_SIZE_IN_BYTES)
              })
            )
          }
        }
      } finally {
        fileUploader.current!.value = ''
      }
    }
  }

  return (
    /* eslint-disable jsx-a11y/click-events-have-key-events */
    /* eslint-disable jsx-a11y/no-static-element-interactions */
    <div onClick={() => fileUploader.current!.click()}>
      {children}
      <HiddenInput
        ref={fileUploader}
        id="image_file_uploader_field"
        type="file"
        accept={ALLOWED_IMAGE_TYPE.join(',')}
        onChange={handleSelectFile}
      />
    </div>
  )
}

export const ImageLoader = injectIntl(ImageLoaderComp)
