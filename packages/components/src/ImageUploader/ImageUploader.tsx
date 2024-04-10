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
import { Button } from '../Button'
import { Icon } from '../Icon'

const HiddenInput = styled.input`
  display: none;
`

type IImagePickerProps = {
  id: string
  title: string
  icon?: () => React.ReactNode
  handleFileChange: (file: File) => void
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  disabled?: boolean
}

export const ImageUploader = (props: IImagePickerProps) => {
  const fileUploader = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    if (files) {
      props.handleFileChange(files[0])
    }
    // Required to select the same file again
    event.target.value = ''
  }

  const { icon, title, disabled = false, ...otherProps } = props
  return (
    <Button
      type="secondary"
      size="medium"
      {...otherProps}
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
        accept="image/*"
        onChange={handleFileChange}
      />
    </Button>
  )
}
