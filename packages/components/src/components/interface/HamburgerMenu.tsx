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
  z-index: 1000;
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
  li.rc-menu-submenu.rc-menu-submenu-inline.main-menu.rc-menu-submenu-open {
    width: 199px;
  }
  ul li.rc-menu-submenu.rc-menu-submenu-inline.nested-submenu span.icon {
    opacity: 0;
  }
  li.rc-menu-submenu.rc-menu-submenu-inline.main-menu
    > div.rc-menu-submenu-title {
    min-height: 90px;
  }
  .rc-menu div.close {
    font-size: 50px;
    margin-top: 2px;
    margin-right: 2px;
    font-family: ${({ theme }) => theme.fonts.lightFont};
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
  .submenu-title-wrapper {
    height: 20px;
    width: 80px;
    color: rgb(255, 255, 255);
    font-family: ${({ theme }) => theme.fonts.lightFont};
    font-size: 16px;
    letter-spacing: 2px;
    line-height: 19px;
  }
  .rc-menu-submenu-inline.main-menu
    > div.rc-menu-submenu-title
    > .submenu-title-wrapper {
    font-size: 14px;
  }
  .rc-menu-submenu.rc-menu-submenu-inline.main-menu
    > div.rc-menu-submenu-title
    > span.submenu-title-wrapper {
    display: inline-block;
    margin-top: 5px;
    margin-left: 40px;
    font-weight: bold;
    text-transform: uppercase;
  }
  .rc-menu-submenu-popup .submenu-title-wrapper {
    padding-right: 20px;
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

const getIcon = (style = {}, icon: any, text?: string) => {
  if (text) {
    return <span style={style}>{text}</span>
  }
  return (
    <span className="icon" style={style}>
      {icon}
    </span>
  )
}

interface IMenuItem {
  title: string
  key: string
  isSubMenu?: boolean
  menuItems?: IMenuItem[]
  onClick?: (...args: any[]) => void
}

interface IProps {
  menuItems: IMenuItem[]
}

interface IState {
  menuTitle: string
  menuOpen: boolean
}

export class HamburgerMenu extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props)
    this.state = {
      menuTitle: 'Menu',
      menuOpen: false
    }
  }

  toggleMenu = () => {
    this.setState(() => ({
      menuOpen: !this.state.menuOpen
    }))
  }

  expandIcon = () => {
    return getIcon(
      {
        color: 'white',
        right: '30px',
        marginLeft: '20px',
        position: 'absolute'
      },
      this.state.menuOpen ? <div className="close">&times;</div> : <Hamburger />
    )
  }

  render() {
    const menuOptions = this.props.menuItems.map((menuItem: any) => {
      if (menuItem.isSubMenu) {
        return (
          <SubMenu
            title={
              <span className="submenu-title-wrapper">{menuItem.title}</span>
            }
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
          <SubMenu
            onTitleClick={this.toggleMenu}
            className="main-menu"
            title={
              <span className="submenu-title-wrapper">
                {this.state.menuOpen ? '' : this.state.menuTitle}
              </span>
            }
          >
            {menuOptions}
          </SubMenu>
        </Menu>
      </MenuContainer>
    )
  }
}
