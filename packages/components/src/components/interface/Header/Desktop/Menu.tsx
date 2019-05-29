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
  margin-left: 16px;
  display: flex;
`

export class Menu extends React.Component<IProps> {
  render() {
    const menuItems = this.props.menuItems.map((menuItem: IMenuItem) => {
      return (
        <MenuItem
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
