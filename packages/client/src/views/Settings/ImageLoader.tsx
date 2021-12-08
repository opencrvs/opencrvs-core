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
import * as React from 'react'
import styled from '@client/styledComponents'
import { IImage } from '@client/utils/imageUtils'

const HiddenInput = styled.input`
  display: none;
`

type IProps = {
  children: React.ReactNode
  onImageLoaded: (image: IImage) => void
}

export function ImageLoader({ children, onImageLoaded, ...props }: IProps) {
  const fileUploader = React.useRef<HTMLInputElement>(null)

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    if (files && files.length > 0) {
      const reader = new FileReader()
      reader.onload = () => {
        onImageLoaded({
          type: files[0].type,
          data: reader.result as string
        })
        fileUploader.current!.value = ''
      }
      reader.readAsDataURL(files[0])
    }
  }

  return (
    <div {...props} onClick={() => fileUploader.current!.click()}>
      {children}
      <HiddenInput
        ref={fileUploader}
        id="image_file_uploader_field"
        type="file"
        accept="image/*"
        onChange={handleSelectFile}
      />
    </div>
  )
}
