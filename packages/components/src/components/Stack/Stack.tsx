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
import styled from 'styled-components'

export interface IStackProps {
  /** Gap between the stack items in pixels  */
  gap?: number
  /** Stack direction */
  direction?: 'row' | 'column'
  /** Defines how space is distributed between the main direction */
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | undefined
  /** Controls the alignment of items on the cross direction */
  alignItems?: 'flex-start' | 'flex-end' | 'center' | undefined
  /** Wraps stack to multiple rows */
  wrap?: boolean
  children?: React.ReactNode
}

export const StyledStack = styled.div<IStackProps>`
  display: flex;
  flex-wrap: ${({ wrap }) => (wrap ? 'wrap' : 'nowrap')};
  flex-direction: ${({ direction }) => direction};
  justify-content: ${({ justifyContent }) => justifyContent};
  align-items: ${({ alignItems }) => alignItems};
  gap: ${({ gap }) => `${gap}px`};
`

/**
 * Use to vertically or horizontally center non-complex lists of items.
 * Stack can either wrap to multiple rows, or stretch in one row.
 * Don't use for page layouting or complex templating.
 */
export const Stack = ({
  direction = 'row',
  justifyContent = 'flex-start',
  alignItems = 'center',
  gap = 8,
  wrap = false,
  ...props
}: IStackProps) => (
  <StyledStack
    direction={direction}
    justifyContent={justifyContent}
    alignItems={alignItems}
    gap={gap}
    wrap={wrap}
    {...props}
  />
)
