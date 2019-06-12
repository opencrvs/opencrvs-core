import * as React from 'react'
import styled from 'styled-components'
import { BackArrowDeepBlue } from '../icons'
import { Button } from '../buttons'
const ActionContainer = styled.div`
  width: 100%;
`
const HeaderContainer = styled.div`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.5);
  height: 90px;
  display: block;
  justify-content: space-between;
  align-items: center;
  position: relative;
`
const BodyContent = styled.div`
  max-width: 940px;
  margin: auto;
  padding: 24px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
`
const BackButtonContainer = styled.div`
  cursor: pointer;
`
const BackButton = styled(Button)`
  height: 42px;
  background: ${({ theme }) => theme.colors.white};
  justify-content: center;
  margin: 0;
`
const BackButtonText = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  text-transform: uppercase;
  margin-left: 14px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
const MenuTitle = styled.div`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
`
interface IProps {
  title?: string
  backLabel?: string
  icon?: () => React.ReactNode
}

export class ActionPageLight extends React.Component<
  IProps & {
    goBack: () => void
  }
> {
  render() {
    const { title, icon, goBack, backLabel } = this.props

    return (
      <ActionContainer>
        <HeaderContainer>
          <BodyContent>
            <BackButtonContainer id="action_page_back_button" onClick={goBack}>
              <BackButton icon={icon || (() => <BackArrowDeepBlue />)} />
              <BackButtonText>{backLabel ? backLabel : ''}</BackButtonText>
            </BackButtonContainer>
            {title && <MenuTitle>{title}</MenuTitle>}
          </BodyContent>
        </HeaderContainer>
        {this.props.children}
      </ActionContainer>
    )
  }
}
