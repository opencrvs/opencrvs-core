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

const MenuMainWrapper = styled.div`
  width: 100%;
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.copy};
  height: 100vh;
  z-index: 99999;
  position: fixed;
  top: 0px;
  left: 0px;
`

const Backdrop = styled.div`
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 0.8;
    }
  }
  background: ${({ theme }) => theme.colors.menuBackground};
  opacity: 0.8;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: -1;
  animation: 300ms ease-out 0s 1 fadeIn;
`
const MenuContainer = styled.div`
  @keyframes slideInFromLeft {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(0);
    }
  }
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
  width: 320px;
  height: 100vh;
  animation: 300ms ease-out 0s 1 slideInFromLeft;
`
const UserInfo = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 30px 24px;
  text-align: justify;
`
const UserName = styled.p`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
  margin: 25px 0px 5px;
`
const Role = styled.p`
  ${({ theme }) => theme.fonts.captionStyle};
  margin: 0px;
`
const MenuItems = styled.ul`
  list-style: none;
  padding: 0px;
  flex-grow: 1;
  overflow: auto;
  scrollbar-width: none;
`
const LogoutMenu = styled(MenuItems)`
  margin-top: 0px;
  flex-grow: 0;
  overflow: unset;
`
const Icon = styled.span`
  display: flex;
  margin-right: 10px;
`
const IconHover = styled(Icon)`
  display: none;
`
const MenuItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px 30px;
  cursor: pointer;
  ${({ theme }) => theme.fonts.subtitleStyle};
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
  &:hover ${Icon} {
    display: none;
  }
  &:hover ${IconHover} {
    display: flex;
  }
`
interface IUserDetails {
  name: string
  role: string
}
interface IMenuItem {
  icon: React.ReactNode
  iconHover?: React.ReactNode
  label: string
  secondary?: boolean
  onClick: (e: React.MouseEvent) => void
}
interface IProps {
  showMenu: boolean
  userDetails: IUserDetails
  menuItems: IMenuItem[]
  avatar: React.ReactNode
  menuCollapse: () => void
}

export class ExpandingMenu extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      showMenu: this.props.showMenu
    }
  }
  render() {
    return (
      this.props.showMenu && (
        <MenuMainWrapper onClick={() => this.props.menuCollapse()}>
          <Backdrop />
          <MenuContainer onClick={e => e.stopPropagation()}>
            <UserInfo>
              {this.props.avatar}
              <UserName>{this.props.userDetails.name}</UserName>
              <Role>{this.props.userDetails.role}</Role>
            </UserInfo>
            <MenuItems>
              {this.props.menuItems.map(
                (item: IMenuItem, index: number) =>
                  !item.secondary && (
                    <MenuItem key={index} onClick={item.onClick}>
                      <Icon>{item.icon}</Icon>
                      <IconHover>{item.iconHover || item.icon}</IconHover>
                      {item.label}
                    </MenuItem>
                  )
              )}
            </MenuItems>
            <LogoutMenu>
              <MenuItems>
                {this.props.menuItems.map(
                  (item: IMenuItem, index: number) =>
                    item.secondary && (
                      <MenuItem
                        id={`mobile_menu_item_${index}`}
                        key={index}
                        onClick={item.onClick}
                      >
                        <Icon>{item.icon}</Icon>
                        <IconHover>{item.iconHover || item.icon}</IconHover>
                        {item.label}
                      </MenuItem>
                    )
                )}
              </MenuItems>
            </LogoutMenu>
          </MenuContainer>
        </MenuMainWrapper>
      )
    )
  }
}
