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
import { IMenuItem, Menu } from './Menu'
import { HeaderLogo } from '../../../icons'

export interface IRightMenu {
  element: JSX.Element
}
export interface IDesktopHeaderProps {
  menuItems: IMenuItem[]
  desktopRightMenu?: IRightMenu[]
}

const HeaderContainer = styled.div`
  padding: 8px 16px;
  height: 64px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  margin-left: 249px;
  z-index: 2;
  ${({ theme }) => theme.gradients.gradientNightshade};
`
const HeaderRight = styled.div`
  margin-left: auto;
  display: flex;
  & > * {
    margin-left: 8px;
  }
`

export class DesktopHeader extends React.Component<IDesktopHeaderProps> {
  render() {
    const { menuItems, desktopRightMenu } = this.props

    return (
      <HeaderContainer>
        <HeaderRight>
          {desktopRightMenu &&
            desktopRightMenu.map((item: IRightMenu) => item.element)}
        </HeaderRight>
      </HeaderContainer>
    )
  }
}
