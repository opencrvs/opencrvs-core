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
import { IDReaderProps } from './types'

const StyledBox = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
`

const StyledStack = styled(Stack)`
  width: 100%;

  & > * {
    flex: 1;
  }
`
export const IDReader = (props: IDReaderProps) => {
  const { dividerLabel, manualInputInstructionLabel, children } = props

  return (
    <StyledBox>
      <Stack direction="column" alignItems="center" gap={0}>
        <StyledStack direction="row" wrap>
          {children}
        </StyledStack>
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
