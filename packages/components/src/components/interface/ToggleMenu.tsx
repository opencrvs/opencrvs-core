import React = require('react')
import styled from 'styled-components'

const ToggleMenuContainer = styled.div`
  position: relative;
  display: inline-block;
`
const ToggleButtonContainer = styled.div`
  display: block;
  cursor: pointer;
`

const MenuContainer = styled.ul`
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  text-align: left;
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.regularFont};
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
  padding: 0;
  margin: 0;
  list-style: none;
`

const MenuHeader = styled.li`
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  padding: 16px 11px 5px 13px;
  letter-spacing: 0.4px;
  border-bottom: 1px solid rgb(244, 244, 244);
  font-feature-settings: 'pnum' on, 'lnum' on;
`
const MenuItem = styled.li`
  color: ${({ theme }) => theme.colors.copy};
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid rgb(244, 244, 244);
  cursor: pointer;
  letter-spacing: 0.2px;
  font-feature-settings: 'pnum' on, 'lnum' on;
  &:hover {
    background-color: rgb(244, 244, 244);
  }
  &:last-child {
    border: 0;
  }
`
const MenuItemIcon = styled.span`
  margin: 13px;
  margin-right: 0;
`

const MenuItemLabel = styled.span`
  height: 21px;
  line-height: 24px;
  margin: 13px;
`
export interface IMenuItem {
  label: string
  icon: JSX.Element
  handler: () => void
}

interface IProps {
  id: string
  menuHeader: JSX.Element
  toggleButton: JSX.Element
  menuItems: IMenuItem[]
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
          <ToggleButtonContainer
            id={`${id}ToggleButton`}
            onClick={this.showMenu}
          >
            {toggleButton}
          </ToggleButtonContainer>
          {this.state.showSubmenu && (
            <MenuContainer id={`${id}SubMenu`}>
              {menuHeader && <MenuHeader>{menuHeader}</MenuHeader>}
              {menuItems.map((mi: IMenuItem, index) => (
                <MenuItem key={`${id}-${index}`} onClick={mi.handler}>
                  {mi.icon && <MenuItemIcon>{mi.icon}</MenuItemIcon>}
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
