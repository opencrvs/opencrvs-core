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
import { IFont } from '../fonts'

type IPillType = 'active' | 'inactive' | 'pending' | 'default'

type IPillSize = 'small' | 'medium'

export interface IPillProps {
  label: string
  type?: IPillType
  size?: IPillSize
}

const heightMap: Record<IPillSize, string> = {
  small: '28px',
  medium: '36px'
}

const fontMap: Record<IPillSize, IFont> = {
  small: 'bold14',
  medium: 'bold16'
}

const StyledPill = styled.span<{ size: IPillSize; type: IPillType }>`
  --background-color: ${({ type, theme }) => `
    ${type === 'active' ? theme.colors.greenLighter : ''}
    ${type === 'inactive' ? theme.colors.redLighter : ''}
    ${type === 'pending' ? theme.colors.orangeLighter : ''}
    ${type === 'default' ? theme.colors.primaryLighter : ''}
  `};

  --color: ${({ type, theme }) => `
  ${type === 'active' ? theme.colors.positiveDarker : ''}
  ${type === 'inactive' ? theme.colors.negativeDarker : ''}
  ${type === 'pending' ? theme.colors.neutralDarker : ''}
  ${type === 'default' ? theme.colors.primaryDarker : ''}
`};

  color: var(--color);
  background: var(--background-color);
  height: ${({ size }) => heightMap[size]};
  ${({ size, theme }) => theme.fonts[fontMap[size]]}
  display: inline-flex;
  padding: 0 0.8em;
  align-items: center;
  border-radius: 100px;
`

export function Pill({
  label,
  type = 'default',
  size = 'small',
  ...rest
}: IPillProps) {
  return (
    <StyledPill type={type} size={size} {...rest}>
      {label}
    </StyledPill>
  )
}
