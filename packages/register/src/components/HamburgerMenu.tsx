import * as React from 'react'
import Menu, { SubMenu, MenuItem } from 'rc-menu'

const HamburgerMenu = () => {
  return (
    <Menu>
      <MenuItem>1</MenuItem>
      <SubMenu title="2">
        <MenuItem>2-1</MenuItem>
      </SubMenu>
    </Menu>
  )
}

export default HamburgerMenu
