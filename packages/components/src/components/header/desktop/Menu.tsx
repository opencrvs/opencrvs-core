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
import { MenuItem } from './MenuItem'
import styled from 'styled-components'

export interface IMenuItem {
  key: string
  title: string
  selected?: boolean
  onClick?: () => void
}

interface IProps {
  menuItems: IMenuItem[]
}

const MenuContainer = styled.div`
  align-self: center;
  margin: -2px 0 0 16px;
  display: flex;
`

export class Menu extends React.Component<IProps> {
  render() {
    const menuItems = this.props.menuItems.map((menuItem: IMenuItem) => {
      return (
        <MenuItem
          id={'menu-' + menuItem.key}
          key={menuItem.key}
          selected={menuItem.selected ? menuItem.selected : false}
          onClick={menuItem.onClick}
        >
          {menuItem.title}
        </MenuItem>
      )
    })
    return <MenuContainer>{menuItems}</MenuContainer>
  }
}
