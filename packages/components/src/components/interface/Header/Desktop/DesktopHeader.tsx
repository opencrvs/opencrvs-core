import * as React from 'react'
import styled from 'styled-components'
import { IMenuItem, Menu } from './Menu'
import { HeaderLogo } from '../../../icons'

export interface IRightMenu {
  element: JSX.Element
}
export interface IDesktopHeaderProps {
  menuItems: IMenuItem[]
  desktopRightMenu?: IRightMenu[]
}

const HeaderContainer = styled.div`
  padding: 8px 16px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.headerGradientDark} 0%,
    ${({ theme }) => theme.colors.headerGradientLight} 100%
  );
`
const HeaderLeft = styled.div`
  display: flex;
`
const HeaderRight = styled.div`
  display: flex;
  & > * {
    margin-left: 8px;
  }
`

export class DesktopHeader extends React.Component<IDesktopHeaderProps> {
  render() {
    const { menuItems, desktopRightMenu } = this.props

    return (
      <HeaderContainer>
        <HeaderLeft>
          <HeaderLogo />
          <Menu menuItems={menuItems} />
        </HeaderLeft>
        <HeaderRight>
          {desktopRightMenu &&
            desktopRightMenu.map((item: IRightMenu) => item.element)}
        </HeaderRight>
      </HeaderContainer>
    )
  }
}
