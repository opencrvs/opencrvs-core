import * as React from 'react'
import styled from 'styled-components'
import { Avatar } from '../../icons'

const MenuMainWrapper = styled.div`
  @keyframes fadeIn {
    0% {
      background: ${({ theme }) => theme.colors.menuBackgroundTransparent};
    }
    100% {
      background: ${({ theme }) => theme.colors.menuBackground};
    }
  }
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.menuBackground};
  position: absolute;
  width: 100%;
  height: 100vh;
  z-index: 99999;
  animation: 300ms ease-out 0s 1 fadeIn;
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
  background: ${({ theme }) => theme.colors.background};
  width: 320px;
  height: 100vh;
  animation: 300ms ease-out 0s 1
    ${({ expand }) => (expand ? 'slideInFromLeft' : 'slideInFromRight')};
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
`
const MenuItem = styled.li`
  padding: 10px 30px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.cardGradientEnd};
  }
`
const Logout = styled.div`
  position: absolute;
  bottom: 50px;
  left: 50px;
`

interface IUserDetails {
  name: string
  role: string
}
interface IMenuItem {
  icon: React.ReactNode
  label: string
  href: string
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
      this.state.showMenu && (
        <MenuMainWrapper onClick={this.toggleMenu}>
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
              {this.props.menuItems.map((item: IMenuItem, index: number) => (
                <MenuItem key={index}>
                  {item.icon}
                  {item.label}
                </MenuItem>
              ))}
            </MenuItems>
            <Logout />
          </MenuContainer>
        </MenuMainWrapper>
      )
    )
  }
}
