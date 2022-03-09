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

export interface IRightMenu {
  element: JSX.Element
}
export interface IDesktopHeaderProps {
  desktopRightMenu?: IRightMenu[]
}

const HeaderContainer = styled.div`
  padding: 8px 16px;
  height: 56px;
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  flex-direction: row;
  justify-content: space-between;
  position: sticky;
  align-items: center;
  top: 0;
  margin-left: 249px;
  z-index: 2;
  background: ${({ theme }) => theme.colors.white};
`
export class DesktopHeader extends React.Component<IDesktopHeaderProps> {
  render() {
    const { desktopRightMenu } = this.props

    return (
      <HeaderContainer>
        {desktopRightMenu &&
          desktopRightMenu.map((item: IRightMenu, index) => (
            <React.Fragment key={index}> {item.element}</React.Fragment>
          ))}
      </HeaderContainer>
    )
  }
}
