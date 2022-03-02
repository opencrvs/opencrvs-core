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
import styled from 'styled-components'

const TopBarWrapper = styled.div`
  padding: 0 24px;
  height: 48px;
  background: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.shadows.lightShadow};
  display: flex;
  overflow-x: auto;
  justify-content: flex-start;
  align-items: center;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0 16px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.sm}px) {
    padding: 0 8px;
  }
`
export class TopBar extends React.Component<{ id?: string }> {
  render() {
    const { id, children } = this.props
    return <TopBarWrapper id={id || 'top-bar'}>{children}</TopBarWrapper>
  }
}
