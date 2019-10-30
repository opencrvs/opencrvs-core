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
import * as React from 'react'
import styled, { StyledFunction, withTheme } from 'styled-components'

import { IGrid } from '../grid'

export interface IBox extends React.HTMLAttributes<HTMLDivElement> {}

const Wrapper = styled.div<IBox>`
  padding: 24px;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: rgba(53, 67, 93, 0.32) 0px 2px 6px;
`

class Component extends React.Component<IBox & { theme: { grid: IGrid } }> {
  render() {
    const { id, title, children, className, theme } = this.props
    return (
      <Wrapper id={id} className={className}>
        {children}
      </Wrapper>
    )
  }
}

export const Box = withTheme(Component)
