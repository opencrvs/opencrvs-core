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

type ImageUploaderProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'type'
> & {
  onChange?: (file: File) => void
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  children,
  onChange,
  onClick,
  ...props
}) => {
  const fileUploader = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    if (files) {
      onChange?.(files[0])
    }
    // Required to select the same file again
    event.target.value = ''
  }

  return (
    <Button
      {...props}
      type="secondary"
      size="medium"
      onClick={(event) => {
        if (onClick) {
          onClick(event)
        }
        fileUploader.current!.click()
      }}
    >
      <Icon name="UploadSimple" />
      {children}
      <HiddenInput
        name={props.name}
        data-testid={props.name}
        ref={fileUploader}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </Button>
  )
}
