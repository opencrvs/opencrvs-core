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
import type { Property } from 'csstype'

export interface IStackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap between the stack items in pixels  */
  gap?: number
  /** Stack direction */
  direction?: Property.FlexDirection
  /** Defines how space is distributed between the main direction */
  justifyContent?: Property.JustifyContent
  /** Controls the alignment of items on the cross direction */
  alignItems?: Property.AlignItems
  /** Wraps stack to multiple rows */
  wrap?: boolean
}

export const StyledStack = styled.div<{
  [Property in keyof IStackProps as `$${Property}`]: IStackProps[Property]
}>`
  display: flex;
  flex-wrap: ${({ $wrap }) => ($wrap ? 'wrap' : 'nowrap')};
  flex-direction: ${({ $direction }) => $direction};
  justify-content: ${({ $justifyContent }) => $justifyContent};
  align-items: ${({ $alignItems }) => $alignItems};
  gap: ${({ $gap }) => `${$gap}px`};
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
    $direction={direction}
    $justifyContent={justifyContent}
    $alignItems={alignItems}
    $gap={gap}
    $wrap={wrap}
    {...props}
  />
)
