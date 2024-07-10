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
import React, { useRef } from 'react'
import styled from 'styled-components'
import { Link } from '../Link'

const ImageBase = styled(Link)`
  width: auto;
  ${({ theme }) => theme.fonts.bold16};
  align-items: center;
  display: inline-flex;
  border: 0;
  justify-content: space-between;
  cursor: pointer;
`

const HiddenInput = styled.input`
  display: none;
`

type IImagePickerProps = {
  id: string
  title: string
  handleFileChange: (file: File) => void
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  disabled?: boolean
  accept?: string
}

export const FileSelectLink = (props: IImagePickerProps) => {
  const { title, disabled = false, accept = 'image/*', ...otherProps } = props

  const fileUploader = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    if (files) {
      props.handleFileChange(files[0])
    }
    // Required to select the same file again
    event.target.value = ''
  }

  return (
    <ImageBase
      {...otherProps}
      element={'button'}
      onClick={(event) => {
        if (props.onClick) {
          props.onClick(event)
        }
        fileUploader.current!.click()
      }}
      disabled={disabled}
    >
      {title}
      <HiddenInput
        ref={fileUploader}
        id="image_file_uploader_field"
        type="file"
        accept={accept}
        onChange={handleFileChange}
      />
    </ImageBase>
  )
}
