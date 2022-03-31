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
import styled from 'styled-components'
import React from 'react'
import { CircleButton } from '../buttons'

const ToggleMenuContainer = styled.div`
  position: relative;
  height: 40px;
  display: flex;
  margin-left: auto;
  button {
    padding: 0;
    height: auto;
  }
`
const MenuContainer = styled.ul`
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bigBodyStyle};
  ${({ theme }) => theme.shadows.light};
  text-align: left;
  min-width: 240px;
  width: auto;
  white-space: nowrap;
  position: absolute;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  top: 100%;
  right: 0;
  padding: 8px 0;
  margin: 0;
  list-style: none;
`

const MenuHeader = styled.li`
  ${({ theme }) => theme.fonts.bodyStyle};
  padding: 8px 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  font-feature-settings: 'pnum' on, 'lnum' on;
`
const MenuItem = styled.li`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.reg16};
  display: flex;
  flex-direction: row;
  cursor: pointer;
  align-items: center;
  font-feature-settings: 'pnum' on, 'lnum' on;
  padding: 16px 16px;
  height: 40px;
  gap: 12px;
  &:hover {
    background-color: ${({ theme }) => theme.colors.grey100};
  }
  &:last-child {
    border: 0;
  }
`

export interface IToggleMenuItem {
  label: string
  icon?: JSX.Element
  handler: () => void
}

interface IProps {
  id: string
  menuHeader?: JSX.Element
  toggleButton: JSX.Element
  menuItems: IToggleMenuItem[]
  hasFocusRing?: boolean
  hide?: boolean
}

interface IState {
  showSubmenu: boolean
}

type ToggleButtonProps = Pick<IProps, 'hasFocusRing'>

export class ToggleMenu extends React.Component<IProps, IState> {
  constructor(props: IProps & IState) {
    super(props)
    this.state = {
      showSubmenu: false
    }
    this.showMenu = this.showMenu.bind(this)
    this.closeMenu = this.closeMenu.bind(this)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.closeMenu)
    document.removeEventListener('click', this.showMenu)
  }
  showMenu() {
    this.setState(() => ({
      showSubmenu: true
    }))
    document.addEventListener('click', this.closeMenu)
  }

  closeMenu() {
    this.setState(() => ({
      showSubmenu: false
    }))
    document.removeEventListener('click', this.closeMenu)
  }

  render() {
    const { id, toggleButton, menuHeader, menuItems, hasFocusRing, hide } =
      this.props
    if (hide) {
      return null
    }
    return (
      <>
        <ToggleMenuContainer>
          <Button
            id={`${id}ToggleButton`}
            onClick={this.showMenu}
            hasFocusRing={hasFocusRing}
          >
            {toggleButton}
          </Button>
          {this.state.showSubmenu && (
            <MenuContainer id={`${id}SubMenu`}>
              {menuHeader && <MenuHeader>{menuHeader}</MenuHeader>}
              {menuItems.map((mi: IToggleMenuItem, index) => (
                <MenuItem
                  id={`${id}Item${index}`}
                  key={`${id}-${index}`}
                  onClick={mi.handler}
                >
                  {mi.icon && mi.icon}
                  {mi.label}
                </MenuItem>
              ))}
            </MenuContainer>
          )}
        </ToggleMenuContainer>
      </>
    )
  }
}

const Button = styled((props) => (
  <CircleButton {...props} />
))<ToggleButtonProps>`
  height: 40px;
  width: 40px;
  &:hover {
    background-color: transparent;
  }
  &:hover:not([data-focus-visible-added]):not(:active) {
    background-color: transparent;
  }
  &:focus {
    outline: none;
    box-shadow: ${({ theme, hasFocusRing }) =>
      hasFocusRing ? `0 0 0 2pt ${theme.colors.yellow}` : 'none'};
  }
  &:focus:not([data-focus-visible-added]) {
    outline: none;
    box-shadow: none;
  }
  &:active:not([data-focus-visible-added]) {
    outline: none;
    box-shadow: ${({ theme, hasFocusRing }) =>
      hasFocusRing ? `0 0 0 2pt ${theme.colors.yellow}` : 'none'};
  }
`
