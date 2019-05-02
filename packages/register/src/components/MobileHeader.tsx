import * as React from 'react'
import styled from '../styled-components'
import { Hamburger, SearchDark } from '@opencrvs/components/lib/icons'
import { Button } from '@opencrvs/components/lib/buttons'

interface IMobileHeaderProps {
  id?: string
  leftIcon?: () => React.ReactNode
  title: string
  rightIcon?: () => React.ReactNode
}

const HeaderContainer = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.headerGradientLight} 0%,
    ${({ theme }) => theme.colors.headerGradientDark} 100%
  );
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
`

const Title = styled.span`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
  line-height: 30px;
  letter-spacing: 0.15px;
  color: ${({ theme }) => theme.colors.white};
`

const HeaderBody = styled.div`
  margin: 0 16px;
  flex: 1;
  display: flex;
`

const EndComponentContainer = styled.div`
  display: flex;
  flex: 0;

  button {
    padding: 0;
  }
`
class MobileHeader extends React.Component<IMobileHeaderProps> {
  render() {
    const { id, leftIcon, rightIcon, title } = this.props
    return (
      <HeaderContainer id={id}>
        <EndComponentContainer>
          <Button id="mobile_header_left">
            {leftIcon ? leftIcon() : <Hamburger />}
          </Button>
        </EndComponentContainer>
        <HeaderBody>
          <Title id="header_title">{title}</Title>
        </HeaderBody>
        <EndComponentContainer>
          <Button id="mobile_header_right">
            {rightIcon ? rightIcon() : <SearchDark />}
          </Button>
        </EndComponentContainer>
      </HeaderContainer>
    )
  }
}

export { MobileHeader }
