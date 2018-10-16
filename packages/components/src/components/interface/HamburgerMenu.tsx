import * as React from 'react'
import animate from 'css-animation'
import styled from 'styled-components'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import { Hamburger } from '../icons'

const animation = {
  enter(node: any, done: (...args: any[]) => void) {
    let height: number
    return animate(node, 'rc-menu-collapse', {
      start() {
        height = node.offsetHeight
        node.style.height = 0
      },
      active() {
        node.style.height = `${height}px`
      },
      end() {
        node.style.height = ''
        done()
      }
    })
  },

  appear() {
    return this.enter.apply(this, arguments)
  },

  leave(node: any, done: (...args: any[]) => void) {
    return animate(node, 'rc-menu-collapse', {
      start() {
        node.style.height = `${node.offsetHeight}px`
      },
      active() {
        node.style.height = 0
      },
      end() {
        node.style.height = ''
        done()
      }
    })
  }
}

const MenuContainer = styled.div`
  top: 0;
  right: 0;
  height: 90px;
  width: 199px;
  background-color: ${({ theme }) => theme.colors.primary};
  z-index: 2;
  position: absolute;

  .rc-menu {
    outline: none;
    margin-bottom: 0;
    padding-left: 0;
    list-style: none;
  }
  .rc-menu-hidden {
    display: none;
  }
  .rc-menu-collapse {
    overflow: hidden;
  }
  .rc-menu-collapse-active {
    transition: height 0.3s ease-out;
  }
  .rc-menu-item-active,
  .rc-menu-item-selected {
    background-color: ${({ theme }) => theme.colors.primary};
    font-weight: bold;
  }
  .rc-menu.rc-menu-root.rc-menu-inline {
    margin-top: 0px;
  }
  .rc-menu.rc-menu-root.rc-menu-inline
    > li.rc-menu-submenu
    > div.rc-menu-submenu-title {
    padding-top: 30px;
  }
  ul li.rc-menu-submenu.rc-menu-submenu-inline.nested-submenu span.icon {
    display: none;
  }
  .rc-menu.rc-menu-root > li.rc-menu-submenu {
    padding: 0 !important;
  }
  .rc-menu-item:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  .rc-menu-item.nested-menu-item {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
  .rc-menu-item,
  .rc-menu-submenu-title {
    margin: 0;
    cursor: pointer;
    position: relative;
    display: block;
    padding: 10px 7px 7px 16px;
    white-space: nowrap;
    min-height: 50px;
    color: rgb(255, 255, 255);
    font-family: ${({ theme }) => theme.fonts.lightFont};
    font-size: 16px;
    letter-spacing: 2px;
    line-height: 19px;
  }
  .rc-menu-submenu > .rc-menu {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  .rc-menu-inline > .rc-menu-item,
  .rc-menu-inline > .rc-menu-submenu.nested-submenu > .rc-menu-submenu-title {
    text-align: right;
    padding: 18px 22px !important;
  }
  .rc-menu-sub.rc-menu-inline {
    padding: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
  .rc-menu-sub.rc-menu-inline > .rc-menu-item,
  .rc-menu-sub.rc-menu-inline > .rc-menu-submenu > .rc-menu-submenu-title {
    padding-top: 8px;
    padding-bottom: 8px;
    padding-right: 0;
  }
  ul.rc-menu.rc-menu-sub li {
    border-top: 1px inset ${({ theme }) => theme.colors.blackAlpha20};
  }
`

const StyledSubMenu = styled(SubMenu)`
  .rc-menu-submenu-open {
    width: 199px;
  }
  > div.rc-menu-submenu-title {
    min-height: 90px;
    font-size: 14px;
  }
  > div.rc-menu-submenu-title > span {
    display: inline-block;
    margin-top: 5px;
    margin-left: 40px;
    font-weight: bold;
    font-size: 14px;
    text-transform: uppercase;
  }
`

const SubMenuTitleWrapper = styled.span`
  height: 20px;
  width: 80px;
  color: rgb(255, 255, 255);
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 16px;
  letter-spacing: 2px;
  line-height: 19px;
  padding-right: 20px;
`

const IconWrapper = styled.span`
  color: ${({ theme }) => theme.colors.white};
  right: 30px;
  margin-left: 20px;
  position: absolute;
`

const IconClose = styled.div`
  font-size: 45px;
  margin-top: 2px;
  margin-right: 2px;
  font-family: ${({ theme }) => theme.fonts.lightFont};
`

interface IMenuItem {
  title: string
  key: string
  isSubMenu?: boolean
  menuItems?: IMenuItem[]
  onClick?: () => void
}

interface IProps {
  menuItems: IMenuItem[]
}

interface IState {
  menuTitle: string
  menuOpen: boolean
}

export class HamburgerMenu extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      menuTitle: 'Menu',
      menuOpen: false
    }
  }

  toggleMenu = () => {
    this.setState(state => ({
      menuOpen: !state.menuOpen
    }))
  }

  expandIcon = () => (
    <IconWrapper className="icon">
      {this.state.menuOpen ? <IconClose>&times;</IconClose> : <Hamburger />}
    </IconWrapper>
  )

  render() {
    const menuOptions = this.props.menuItems.map((menuItem: any) => {
      if (menuItem.isSubMenu) {
        return (
          <SubMenu
            title={<SubMenuTitleWrapper>{menuItem.title}</SubMenuTitleWrapper>}
            className="nested-submenu"
            key={menuItem.key}
          >
            {menuItem.menuItems.map((item: any) => (
              <MenuItem
                key={item.key}
                onClick={item.onClick}
                className="nested-menu-item"
              >
                {item.title}
              </MenuItem>
            ))}
          </SubMenu>
        )
      } else {
        return (
          <MenuItem key={menuItem.key} onClick={menuItem.onClick}>
            {menuItem.title}
          </MenuItem>
        )
      }
    })

    return (
      <MenuContainer>
        <Menu
          mode="inline"
          expandIcon={this.expandIcon}
          openAnimation={animation}
          triggerSubMenuAction="click"
        >
          <StyledSubMenu
            onTitleClick={this.toggleMenu}
            title={
              <SubMenuTitleWrapper>
                {this.state.menuOpen ? '' : this.state.menuTitle}
              </SubMenuTitleWrapper>
            }
          >
            {menuOptions}
          </StyledSubMenu>
        </Menu>
      </MenuContainer>
    )
  }
}
