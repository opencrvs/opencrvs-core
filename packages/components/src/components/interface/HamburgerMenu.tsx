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
import animate from 'css-animation'
import styled from 'styled-components'
import Menu, { SubMenu, MenuItem } from 'rc-menu'
import { Hamburger } from '../icons'

const animation = {
  enter(node: HTMLElement, done: () => void) {
    let height: number
    return animate(node, 'rc-menu-collapse', {
      start() {
        height = node.offsetHeight
        node.style.height = '0'
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

  leave(node: HTMLElement, done: () => void) {
    return animate(node, 'rc-menu-collapse', {
      start() {
        node.style.height = `${node.offsetHeight}px`
      },
      active() {
        node.style.height = '0'
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
  width: 199px;
  background-color: ${({ theme }) => theme.colors.primary};
  z-index: 3;
  position: absolute;

  .rc-menu {
    background-color: ${({ theme }) => theme.colors.primary};
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
  .rc-menu-item-selected,
  .rc-menu-submenu-active > .rc-menu-submenu-title {
    background-color: ${({ theme }) => theme.colors.primary};
    ${({ theme }) => theme.fonts.bodyBoldStyle};
  }

  .rc-menu-vertical.rc-menu-sub {
    min-width: 199px;
    margin-top: 0;
  }

  .rc-menu-item,
  .rc-menu-submenu-title {
    ${({ theme }) => theme.fonts.bodyStyle};
    cursor: pointer;
    padding: 18px 22px;
    min-height: 30px;
    text-align: right;
    width: 199px;
  }

  .rc-menu-submenu-popup {
    position: absolute;
    z-index: 1;
    top: 92px !important;
  }

  .rc-menu-submenu-placement-leftTop {
    position: static;
  }

  ul.rc-menu.rc-menu-sub.rc-menu-vertical > li {
    border-top: 1px inset ${({ theme }) => theme.colors.placeholderCopy};
  }

  li.rc-menu-submenu.rc-menu-submenu-vertical > div:nth-child(2) {
    position: relative !important;
  }

  li.rc-menu-submenu.rc-menu-submenu-vertical > div:nth-child(2) > div > div {
    position: static !important;
  }
`
const StyledSubMenu = styled(SubMenu)`
  .rc-menu-submenu-open {
    width: 199px;
  }
  > div.rc-menu-submenu-title {
    min-height: 76px;
    text-align: center;
  }
`
const StyledNestedSubMenu = styled(SubMenu)`
  span:last-child {
    display: none;
  }
  > .rc-menu-submenu-title {
    text-align: right;
    padding: 18px 22px !important;
  }
  .rc-menu-item:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
  .rc-menu-item-selected {
    background-color: ${({ theme }) => theme.colors.secondary};
    ${({ theme }) => theme.fonts.bigBodyStyle};
  }
`
const StyledNestedMenuItem = styled(MenuItem)`
  background-color: ${({ theme }) => theme.colors.secondary};
`
const SubMenuTitleWrapper = styled.span`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bodyStyle};
`

const MenuTitleWrapper = styled.span`
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.subtitleStyle};
  text-transform: uppercase;
  padding-right: 40px;
`
const IconWrapper = styled.i`
  color: ${({ theme }) => theme.colors.white};
  right: 30px;
  margin-left: 20px;
  position: absolute;
`
const IconClose = styled.div`
  margin-top: 0px;
  margin-right: 2px;
  ${({ theme }) => theme.fonts.h1Style};
`
interface IMenuItem {
  title: string
  key: string
  isSubMenu?: boolean
  menuItems?: IMenuItem[]
  onClick?: () => void
}
interface IProps {
  menuTitle: string
  menuItems: IMenuItem[]
}
export class HamburgerMenu extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)
  }

  getPopupMenu = () => document.getElementById('menu-container')

  render() {
    const menuOptions = this.props.menuItems.map((menuItem: IMenuItem) => {
      if (menuItem.isSubMenu) {
        return (
          <StyledNestedSubMenu
            id={`${menuItem.title.replace(/\s/g, '')}-nested-menu`}
            title={<SubMenuTitleWrapper>{menuItem.title}</SubMenuTitleWrapper>}
            key={menuItem.key}
          >
            {menuItem.menuItems &&
              menuItem.menuItems.map((item: IMenuItem) => (
                <StyledNestedMenuItem
                  id={`${item.title.replace(/\s/g, '')}-nested-menu-item`}
                  key={item.key}
                  onClick={item.onClick}
                >
                  {item.title}
                </StyledNestedMenuItem>
              ))}
          </StyledNestedSubMenu>
        )
      } else {
        return (
          <MenuItem
            id={`${menuItem.title.replace(/\s/g, '')}-menu-item`}
            key={menuItem.key}
            onClick={menuItem.onClick}
          >
            {menuItem.title}
          </MenuItem>
        )
      }
    })

    return (
      <MenuContainer id="menu-container">
        <Menu
          mode="horizontal"
          id="hamburger-menu"
          openAnimation={animation}
          triggerSubMenuAction="click"
          getPopupContainer={this.getPopupMenu}
        >
          <StyledSubMenu
            id="sub-menu"
            title={
              <>
                <MenuTitleWrapper id="sub-menu-wrapper">
                  {this.props.menuTitle}
                </MenuTitleWrapper>
                <IconWrapper>{<Hamburger />}</IconWrapper>
              </>
            }
          >
            {menuOptions}
          </StyledSubMenu>
        </Menu>
      </MenuContainer>
    )
  }
}
