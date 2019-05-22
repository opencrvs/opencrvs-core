import * as React from 'react'
import styled from 'styled-components'
import { IMenuItem, Menu } from './Menu'
import { HeaderLogo } from 'src/components/icons'

interface IProps {
  menuItems: IMenuItem[]
}

const HeaderContainer = styled.div`
  padding: 8px 16px;
  max-height: 60px;
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  ${({ theme }) => theme.gradients.gradientNightshade};
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
