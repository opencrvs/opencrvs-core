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
import styled from 'styled-components'
import type { Property } from 'csstype'

type Element = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
type Align = 'left' | 'center'

export interface ITextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Typographic variant. Defines how the text looks like */
  variant: IFont
  /** Element type. Required for making semantically correct hierarchies, for example `h2` or `p` */
  element: Element
  /** Color */
  color?: IColor
  /** Text alignment */
  align?: Align
  /** Setting whether the browser should insert line breaks within an otherwise unbreakable string to prevent text from overflowing its line box */
  overflowWrap?: Property.OverflowWrap
}

const StyledText = styled.span<{
  $variant: IFont
  $color: IColor
  $overflowWrap?: Property.OverflowWrap
  $align: Align
}>`
  ${({ $variant }) => fonts[$variant]}
  ${({ $align }) => `text-align: ${$align};`}
  ${({ $color }) => `color: ${colors[$color]};`}
  ${({ $overflowWrap }) => $overflowWrap && `overflow-wrap: ${$overflowWrap};`}
`

/** Text helps present your content with correct hierarchy and font sizes */
export const Text = ({
  variant,
  element,
  overflowWrap,
  color = 'copy',
  align = 'left',
  ...props
}: ITextProps) => (
  <StyledText
    $variant={variant}
    $color={color}
    as={element}
    $align={align}
    $overflowWrap={overflowWrap}
    {...props}
  />
)
