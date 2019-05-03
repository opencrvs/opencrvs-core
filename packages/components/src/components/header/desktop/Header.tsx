import { Menu } from '@opencrvs/components/lib/header'
import { HeaderLogo } from '@opencrvs/components/lib/icons'
import * as React from 'react'
import styled from 'styled-components'
import { IMenuItem } from './Menu'

interface IProps {
  menuItems: IMenuItem[]
}

const HeaderContainer = styled.div`
  padding: 8px 16px;
  display: flex;
  flex-direction: row;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.hoverGradientDark} 0%,
    ${({ theme }) => theme.colors.hoverGradientLight} 100%
  );
`

export class Header extends React.Component<IProps> {
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
