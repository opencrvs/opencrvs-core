import * as React from 'react'
import styled, { css } from 'styled-components'
import { Avatar } from '../../icons'

const MenuMainWrapper = styled.div.attrs<{ expand?: boolean }>({})`
  @keyframes fadeIn {
    0% {
      background: ${({ theme }) => theme.colors.menuBackgroundTransparent};
    }
    100% {
      background: ${({ theme }) => theme.colors.menuBackground};
    }
  }
  @keyframes fadeOut {
    0% {
      background: ${({ theme }) => theme.colors.menuBackground};
    }
    99% {
      background: ${({ theme }) => theme.colors.menuBackgroundTransparent};
    }
    100% {
      width: 0%;
    }
  }

  background: ${({ theme, expand }) =>
    expand ? theme.colors.menuBackground : 'none'};
  width: ${({ expand }) => (expand ? '100%' : '0%')};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.secondary};
  height: 100vh;
  z-index: 99999;
  animation: 300ms ease-out 0s 1
    ${({ expand }) => (expand ? 'fadeIn' : 'fadeOut')};
  position: fixed;
  top: 0px;
`
const MenuContainer = styled.div.attrs<{ expand?: boolean }>({})`
  @keyframes slideInFromLeft {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(0);
    }
  }
  @keyframes slideInFromRight {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
  width: 320px;
  height: 100vh;
  animation: 300ms ease-out 0s 1
    ${({ expand }) => (expand ? 'slideInFromLeft' : 'slideInFromRight')};
  transform: ${({ expand }) =>
    expand ? 'translateX(0)' : 'translateX(-100%)'};
`
const UserInfo = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: 30px 24px;
`
const UserName = styled.p`
  font-size: 20px;
  font-weight: bold;
  margin: 25px 0px 5px;
`
const Role = styled.p`
  font-size: 15px;
  font-weight: bold;
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
  font-weight: bold;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.cardGradientEnd};
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
}
interface IState {
  showMenu: boolean
}

export class ExpandingMenu extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      showMenu: this.props.showMenu
    }
  }
  toggleMenu = () => {
    this.setState(prevState => ({ showMenu: !prevState.showMenu }))
  }
  render() {
    return (
      <MenuMainWrapper onClick={this.toggleMenu} expand={this.state.showMenu}>
        <MenuContainer
          onClick={e => e.stopPropagation()}
          expand={this.state.showMenu}
        >
          <UserInfo>
            <Avatar />
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
                    <MenuItem key={index} onClick={item.onClick}>
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
  }
}
