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

type Element = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'

export interface ITextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Typographic variant */
  variant: IFont
  /** Element type. Required for making semantically correct hierarchies, for example `h2` or `p` */
  as: Element
  /** Color */
  color?: IColor
}

const StyledText = styled.span<{ variant: IFont }>`
  ${({ variant }) => fonts[variant]}
  ${({ color }) => color && `color: ${colors[color]};`}
`

/** Text helps present your content with correct hierarchy and font sizes */
export const Text = ({ variant, as, color = 'copy', ...props }: ITextProps) => {
  const Component = StyledText.withComponent(as)
  return <Component variant={variant} color={color} {...props} />
}
