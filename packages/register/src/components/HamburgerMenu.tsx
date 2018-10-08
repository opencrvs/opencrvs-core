import * as React from 'react'
import animate from 'css-animation'
import styled from '../styled-components'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import { Cross, Hamburger } from '@opencrvs/components/lib/icons'

const animation = {
  enter(node: any, done: any) {
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

  leave(node: any, done: any) {
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
  width: 180px;
  z-index: 1000;
  background: ${({ theme }) => theme.colors.primary};
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
  }
  ul li.rc-menu-submenu.rc-menu-submenu-inline.nested-submenu i {
    opacity: 0;
  }
  .rc-menu.rc-menu-root > li.rc-menu-submenu {
    padding: 0 !important;
  }
  .rc-menu-item:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  .rc-menu-item.nested-menu-item {
    background-color: rgb(45, 44, 44);
  }
  .rc-menu-item,
  .rc-menu-submenu-title {
    margin: 0;
    position: relative;
    display: block;
    padding: 7px 7px 7px 16px;
    white-space: nowrap;
    min-height: 50px;
  }
  .rc-menu > .rc-menu-item-divider {
    height: 1px;
    margin: 1px 0;
    overflow: hidden;
    padding: 0;
    line-height: 0;
    background-color: rgb(229, 229, 229);
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
    padding: 8px 15px 8px 10px !important;
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
    border-top: 1px inset rgba(25, 24, 24, 0.12);
  }
`

const getIcon = (style = {}, icon: any, text?: string) => {
  if (text) {
    return <i style={style}>{text}</i>
  }
  return <i style={style}>{icon}</i>
}

function expandIcon(menuOpen: boolean, props: any) {
  return getIcon(
    {
      right: '20px',
      marginLeft: '20px',
      position: 'absolute'
    },
    menuOpen ? <Cross /> : <Hamburger />
  )
}

interface IMenuItem {
  title: string
  key: string
  isSubMenu?: boolean
  menuItems?: IMenuItem[]
  onClick?: (...args: any[]) => void
}

export interface IProps {
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
      menuOpen: !this.state.menuOpen,
      menuTitle: this.state.menuOpen ? 'Menu' : ''
    }))
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
          expandIcon={expandIcon.bind(null, this.state.menuOpen)}
          openAnimation={animation}
          triggerSubMenuAction="click"
        >
          <SubMenu
            onTitleClick={this.toggleMenu}
            className="main-menu"
            title={
              <span className="submenu-title-wrapper">
                {this.state.menuTitle}
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
