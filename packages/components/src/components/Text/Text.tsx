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
import { fonts } from '../fonts'
import styled from 'styled-components'

type Element = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'

type Variant =
  | 'heading-hero'
  | 'heading-xl'
  | 'heading-l'
  | 'heading-m'
  | 'heading-s'

const fontStyle: { [variant in Variant]: string } = {
  'heading-hero': fonts().h1,
  'heading-xl': fonts().h1,
  'heading-l': fonts().h2,
  'heading-m': fonts().h3,
  'heading-s': fonts().h3
}

export interface ITextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Typographic variant of the text */
  variant: Variant
  /** Element type */
  as: Element
}

const StyledText = styled.span<{ variant: Variant }>`
  ${({ variant }) => fontStyle[variant]}
`

/** Text helps present your content with correct hierarchy and font sizes */
export const Text = ({ variant, as, ...props }: ITextProps) => {
  const Component = StyledText.withComponent(as)
  return <Component variant={variant} {...props} />
}
