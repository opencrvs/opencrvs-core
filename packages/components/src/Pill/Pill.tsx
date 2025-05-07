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

type IPillTheme = 'light' | 'dark'

export interface IPillProps {
  label: React.ReactNode
  type?: IPillType
  size?: IPillSize
  pillTheme?: IPillTheme
}

const heightMap: Record<IPillSize, string> = {
  small: '28px',
  medium: '36px'
}

const fontMap: Record<IPillSize, IFont> = {
  small: 'bold14',
  medium: 'bold16'
}

const StyledPill = styled.span<{
  size: IPillSize
  type: IPillType
  pillTheme: IPillTheme
}>`
  --lighterShade: ${({ type, theme }) => `
    ${type === 'active' ? theme.colors.greenLighter : ''}
    ${type === 'inactive' ? theme.colors.redLighter : ''}
    ${type === 'pending' ? theme.colors.orangeLighter : ''}
    ${type === 'default' ? theme.colors.primaryLighter : ''}
  `};

  --darkerShade: ${({ type, theme }) => `
  ${type === 'active' ? theme.colors.positiveDarker : ''}
  ${type === 'inactive' ? theme.colors.negativeDarker : ''}
  ${type === 'pending' ? theme.colors.neutralDarker : ''}
  ${type === 'default' ? theme.colors.primaryDarker : ''}
`};

  ${({ pillTheme }) =>
    pillTheme === 'dark'
      ? `
    --color: var(--lighterShade);
    --background-color: var(--darkerShade);
    `
      : `
    --color: var(--darkerShade);
    --background-color: var(--lighterShade);
  `}
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
  pillTheme = 'light',
  ...rest
}: IPillProps) {
  return (
    <StyledPill type={type} size={size} pillTheme={pillTheme} {...rest}>
      {label}
    </StyledPill>
  )
}
