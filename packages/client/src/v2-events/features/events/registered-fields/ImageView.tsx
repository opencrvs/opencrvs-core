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
import React from 'react'
import styled from 'styled-components'
import { ImageViewField } from '@opencrvs/commons/client'

const Container = styled.div<{
  $textAlign?: React.CSSProperties['textAlign']
}>`
  text-align: ${({ $textAlign }) => $textAlign ?? 'left'};
`

const StyledImage = styled.img<{
  $height?: string
  $objectFit?: React.CSSProperties['objectFit']
  $width?: string
}>`
  display: inline-block;
  width: ${({ $width }) => $width ?? '100%'};
  height: ${({ $height }) => $height ?? 'auto'};
  object-fit: ${({ $objectFit }) => $objectFit ?? 'contain'};
`

function ImageViewInput({
  configuration,
  value
}: {
  configuration: ImageViewField['configuration']
  value: string | null
}) {
  const { alt, width, height, objectFit, textAlign } = configuration

  if (!value) {
    return null
  }

  return (
    <Container $textAlign={textAlign}>
      <StyledImage
        $height={height}
        $objectFit={objectFit}
        $width={width}
        alt={alt ?? ''}
        src={value}
      />
    </Container>
  )
}

export const ImageView = {
  Input: ImageViewInput,
  Output: null
}
