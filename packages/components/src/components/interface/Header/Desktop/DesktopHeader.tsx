import * as React from 'react'
import styled from 'styled-components'
import { IMenuItem, Menu } from './Menu'
import { HeaderLogo } from '../../../icons'

interface IProps {
  menuItems: IMenuItem[]
}

const HeaderContainer = styled.div`
  padding: 8px 16px;
  display: flex;
  flex-direction: row;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.headerGradientDark} 0%,
    ${({ theme }) => theme.colors.headerGradientLight} 100%
  );
`

export class DesktopHeader extends React.Component<IProps> {
  render() {
    const { menuItems } = this.props

    return (
      <HeaderContainer>
        <HeaderLogo />
        <Menu menuItems={menuItems} />
      </HeaderContainer>
    )
  }
}
