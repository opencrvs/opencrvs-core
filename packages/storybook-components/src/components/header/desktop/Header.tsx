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
import { HeaderLogo } from '../../icons'

interface IProps {
  menuItems: IMenuItem[]
}

const HeaderContainer = styled.div`
  padding: 8px 16px;
  max-height: 60px;
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  ${({ theme }) => theme.gradients.gradientNightshade};
`

export class Header extends React.Component<IProps> {
  render() {
    const { menuItems } = this.props

    return (
      <HeaderContainer>
        <HeaderLogo />
        <Menu menuItems={menuItems} />
      </HeaderContainer>
    )
  }
}
