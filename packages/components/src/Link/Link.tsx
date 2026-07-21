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
import { fonts, IFont } from '../fonts'
import { colors, IColor } from '../colors'
// Direct light-theme token access; dark-mode theme switching lands in a follow-up PR (#12628).
import { lightColors } from '../semantics'
import styled, { css } from 'styled-components'

export interface LinkProps
  extends React.HTMLProps<HTMLAnchorElement | HTMLButtonElement> {
  /** Typographic variant. Defines how the text looks like */
  font?: IFont
  /** Element the button renders as */
  element?: 'a' | 'button'
  /** Color */
  color?: IColor
  /** Disabled */
  disabled?: boolean
  /** Always underline link */
  underline?: boolean
}

const underlineStyles = css`
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
`

const StyledLink = styled.button<{
  $font: IFont
  $color: IColor
  $underline: boolean
}>`
  ${({ $font }) => fonts[$font]};
  ${({ $color }) => `color: ${colors[$color]};`}
  cursor: pointer;
  padding: 0;
  border: 0;
  background: transparent;
  text-decoration: none;
  display: inline;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 100%;

  ${({ $underline, $color }) =>
    $underline
      ? underlineStyles
      : css`
          &:hover,
          &:active {
            ${underlineStyles}
            text-decoration-color: ${colors[$color]};
          }
        `}
  &:hover,
  &:active {
    ${underlineStyles}
    ${({ $color }) => `text-decoration-color: ${colors[$color]};`}
  }

  &:focus-visible {
    background: ${lightColors['feedback/focus']};
    box-shadow: 0 -2px ${lightColors['feedback/focus']},
      0px 2px ${lightColors['feedback/focus']},
      0 4px ${lightColors['text/primary']};
    color: ${lightColors['text/primary']};
    outline: none;
    text-decoration: none;
  }

  &:disabled {
    opacity: 0.5;
    text-decoration: none;
    pointer-events: none;
    user-select: none;
  }
`

export const Link = ({
  element,
  font = 'bold16',
  color = 'primary',
  underline = false,
  ...props
}: LinkProps) => (
  <StyledLink
    $font={font}
    $color={color}
    $underline={underline}
    as={element as any}
    {...props}
  />
)
