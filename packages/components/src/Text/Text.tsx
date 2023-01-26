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
import type { Property } from 'csstype'

type Element = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'

export interface ITextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Typographic variant. Defines how the text looks like */
  variant: IFont
  /** Element type. Required for making semantically correct hierarchies, for example `h2` or `p` */
  element: Element
  /** Color */
  color?: IColor
  /** Setting whether the browser should insert line breaks within an otherwise unbreakable string to prevent text from overflowing its line box */
  overflowWrap?: Property.OverflowWrap
}

const StyledText = styled.span<{
  $variant: IFont
  $color: IColor
  $overflowWrap?: Property.OverflowWrap
}>`
  ${({ $variant }) => fonts[$variant]}
  ${({ $color }) => `color: ${colors[$color]};`}
  ${({ $overflowWrap }) => $overflowWrap && `overflow-wrap: ${$overflowWrap};`}
`

/** Text helps present your content with correct hierarchy and font sizes */
export const Text = ({
  variant,
  element,
  overflowWrap,
  color = 'copy',
  ...props
}: ITextProps) => {
  console.log(React)
  return (
    <StyledText
      $variant={variant}
      $color={color}
      as={element}
      $overflowWrap={overflowWrap}
      {...props}
    />
  )
}
