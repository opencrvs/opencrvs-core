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
import React from 'react'
import { fonts, IFont } from '../fonts'
import { colors, IColor } from '../colors'
import styled from 'styled-components'

export interface LinkProps extends React.HTMLAttributes<HTMLButtonElement> {
  /** Typographic variant. Defines how the text looks like */
  font?: IFont
  /** Element the button renders as */
  element?: 'a' | 'button'
  /** Color */
  color?: IColor
  /** Disabled */
  disabled?: boolean
}

const StyledLink = styled.a<{ $font: IFont; $color: IColor }>`
  ${({ $font }) => fonts[$font]};
  ${({ $color }) => `color: ${colors[$color]};`}
  cursor: pointer;
  padding: 0;
  border: 0;
  background: transparent;
  text-decoration: none;
  display: inline;

  &:hover,
  &:active {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
  }

  &:focus-visible {
    background: ${({ theme }) => theme.colors.yellow};
    box-shadow: 0 -2px ${({ theme }) => theme.colors.yellow},
      0px 2px ${({ theme }) => theme.colors.yellow},
      0 4px ${({ theme }) => theme.colors.copy};
    color: ${({ theme }) => theme.colors.grey600};
    outline: none;
    text-decoration: none;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.grey400};
  }
`

export const Link = ({
  element = 'button',
  font = 'bold16',
  color = 'primary',
  ...props
}: LinkProps) => (
  <StyledLink $font={font} $color={color} as={element} {...props} />
)
