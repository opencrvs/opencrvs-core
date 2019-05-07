import * as React from 'react'
import { Button } from '../../../buttons'
import styled from 'styled-components'

interface IMenuAction {
  icon: () => React.ReactNode
  handler: () => void
}
export interface IMobileHeaderProps {
  id?: string
  left?: IMenuAction
  title: string
  right?: IMenuAction
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
    const { id, left, right, title } = this.props
    return (
      <HeaderContainer id={id}>
        <EndComponentContainer>
          {left && (
            <Button id="mobile_header_left" onClick={left.handler}>
              {left.icon()}
            </Button>
          )}
        </EndComponentContainer>
        <HeaderBody>
          <Title id="header_title">{title}</Title>
        </HeaderBody>
        <EndComponentContainer>
          {right && (
            <Button id="mobile_header_right" onClick={right.handler}>
              {right.icon()}
            </Button>
          )}
        </EndComponentContainer>
      </HeaderContainer>
    )
  }
}

export { MobileHeader }
