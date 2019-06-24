import styled from 'styled-components'

import React = require('react')

const ToggleMenuContainer = styled.div`
  position: relative;
  display: flex;
  button {
    padding: 0;
    height: auto;
  }
`
const MenuContainer = styled.ul`
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  text-align: left;
  ${({ theme }) => theme.fonts.bigBodyStyle};
  min-width: 200px;
  width: auto;
  white-space: nowrap;
  position: absolute;
  z-index: 999999;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 2px 8px rgba(53, 67, 93, 0.54);
  top: 100%;
  right: 0;
  padding: 8px 0;
  margin: 0;
  list-style: none;
`

const MenuHeader = styled.li`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
  padding: 8px 32px 8px 16px;
  border-bottom: 1px solid rgb(244, 244, 244);
  font-feature-settings: 'pnum' on, 'lnum' on;
`
const MenuItem = styled.li`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid rgb(244, 244, 244);
  cursor: pointer;
  font-feature-settings: 'pnum' on, 'lnum' on;
  padding: 12px 16px;
  height: 48px;
  &:hover {
    background-color: ${({ theme }) => theme.colors.dropdownHover};
  }
  &:last-child {
    border: 0;
  }
`

const MenuItemLabel = styled.span`
  padding-left: 16px;
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
}

interface IState {
  showSubmenu: boolean
}

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
    const { id, toggleButton, menuHeader, menuItems } = this.props

    return (
      <>
        <ToggleMenuContainer>
          <Button id={`${id}ToggleButton`} onClick={this.showMenu}>
            {toggleButton}
          </Button>
          {this.state.showSubmenu && (
            <MenuContainer id={`${id}SubMenu`}>
              {menuHeader && <MenuHeader>{menuHeader}</MenuHeader>}
              {menuItems.map((mi: IToggleMenuItem, index) => (
                <MenuItem key={`${id}-${index}`} onClick={mi.handler}>
                  {mi.icon && mi.icon}
                  <MenuItemLabel>{mi.label}</MenuItemLabel>
                </MenuItem>
              ))}
            </MenuContainer>
          )}
        </ToggleMenuContainer>
      </>
    )
  }
}

const Button = styled.span`
  cursor: pointer;
`
