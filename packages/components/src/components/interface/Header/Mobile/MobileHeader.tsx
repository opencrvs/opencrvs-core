import * as React from 'react'
import styled from 'styled-components'
import { CircleButton } from '../../../buttons'

interface IMenuAction {
  icon: () => React.ReactNode
  handler: () => void
}
export interface IMobileHeaderProps {
  id?: string
  mobileLeft?: IMenuAction
  title: string
  mobileBody?: JSX.Element
  mobileRight?: IMenuAction
}

const HeaderContainer = styled.div`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.headerGradientDark} 0%,
    ${({ theme }) => theme.colors.headerGradientLight} 100%
  );
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
`

const Title = styled.span`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
  line-height: 30px;
  letter-spacing: 0.15px;
  color: ${({ theme }) => theme.colors.white};
  align-self: center;
`

const HeaderBody = styled.div`
  margin: 0 16px;
  flex: 1;
  display: flex;
  height: 40px;

  form {
    width: 100%;
  }

  &:last-child {
    margin-right: 0;
  }
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
    const { id, mobileLeft, mobileRight, title, mobileBody } = this.props
    return (
      <HeaderContainer id={id}>
        {mobileLeft && (
          <EndComponentContainer>
            <CircleButton
              id="mobile_header_left"
              onClick={mobileLeft.handler}
              dark={true}
            >
              {mobileLeft.icon()}
            </CircleButton>
          </EndComponentContainer>
        )}

        <HeaderBody>
          {mobileBody || <Title id="header_title">{title}</Title>}
        </HeaderBody>

        {mobileRight && (
          <EndComponentContainer>
            <CircleButton
              id="mobile_header_right"
              onClick={mobileRight.handler}
              dark={true}
            >
              {mobileRight.icon()}
            </CircleButton>
          </EndComponentContainer>
        )}
      </HeaderContainer>
    )
  }
}

export { MobileHeader }
