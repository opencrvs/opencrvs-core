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
import { Text } from '../Text'
import { Stack } from '../Stack'
import styled from 'styled-components'

const HideOnLargeScreen = styled(Stack)`
  display: none;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: block;
  }
`

export const Row: React.FC<{
  label: React.ReactNode
  heading: { right: string; left: string }
  leftValue: React.ReactNode
  rightValue: React.ReactNode
}> = ({ label, leftValue, rightValue, heading }) => {
  return (
    <React.Fragment>
      <Stack>{label}</Stack>
      <Stack style={{ gap: '50%' }}>
        <HideOnLargeScreen>
          <Text variant="reg16" element="span" color="redDark">
            {heading.left}
          </Text>
        </HideOnLargeScreen>
        {leftValue}
      </Stack>
      <Stack style={{ gap: '50%' }}>
        <HideOnLargeScreen>
          <Text variant="reg16" element="span" color="grey600">
            {heading.right}
          </Text>
        </HideOnLargeScreen>
        {rightValue}
      </Stack>
    </React.Fragment>
  )
}
