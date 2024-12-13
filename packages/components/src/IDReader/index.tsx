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
import { Box } from '../Box'
import styled from 'styled-components'
import { Stack } from '../Stack'
import { Divider } from '../Divider'
import { Text } from '../Text'
import { QRReader } from './readers/QRReader/QRReader'
import { ReaderType, ScannableIDReader } from './types'

const StyledBox = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
`

export const IDReader = (props: ScannableIDReader) => {
  const {
    dividerLabel,
    manualInputInstructionLabel,
    readers,
    onScan,
    onError
  } = props
  const renderReader = (reader: ReaderType) => {
    const { type, ...readerProps } = reader
    if (type === 'qr') {
      return (
        <QRReader
          key={type}
          {...readerProps}
          onScan={onScan}
          onError={onError}
        />
      )
    } else return null
  }

  return (
    <StyledBox>
      <Stack direction="column" alignItems="center" gap={0}>
        {readers.map(renderReader)}
        <Divider>
          <Text variant="reg18" element="p" align="center" color="grey500">
            {dividerLabel}
          </Text>
        </Divider>
        <Text variant="reg16" element="span" align="center">
          {manualInputInstructionLabel}
        </Text>
      </Stack>
    </StyledBox>
  )
}
