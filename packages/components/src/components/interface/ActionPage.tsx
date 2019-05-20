import * as React from 'react'
import styled from 'styled-components'
import { ArrowBack } from '../icons'
import { PrimaryButton } from '../buttons'
const ActionContainer = styled.div`
  width: 100%;
`
const HeaderContainer = styled.div`
  ${({ theme }) => theme.gradients.gradientNightshade};
  color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.5);
  height: 90px;
  display: block;
  justify-content: space-between;
  align-items: center;
  position: relative;
`
const HeaderContent = styled.div`
  max-width: 940px;
  margin: auto;
  padding: 20px 10px;
`
const BackButtonContainer = styled.div`
  float: left;
  cursor: pointer;
  margin-left: ${({ theme }) => theme.grid.margin}px;
`
const BackButton = styled(PrimaryButton)`
  width: 69px;
  height: 42px;
  background: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  border-radius: 21px;
`
const BackButtonText = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  text-transform: uppercase;
  margin-left: 14px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
const MenuTitle = styled.span`
  ${({ theme }) => theme.fonts.h4Style};
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`
interface IProps {
  title?: string
  backLabel?: string
  icon?: () => React.ReactNode
}

export class ActionPage extends React.Component<
  IProps & {
    goBack: () => void
  }
> {
  render() {
    const { title, icon, goBack, backLabel } = this.props

    return (
      <ActionContainer>
        <HeaderContainer>
          <HeaderContent>
            <BackButtonContainer id="action_page_back_button" onClick={goBack}>
              <BackButton icon={icon || (() => <ArrowBack />)} />
              <BackButtonText>{backLabel ? backLabel : ''}</BackButtonText>
            </BackButtonContainer>
            {title && <MenuTitle>{title}</MenuTitle>}
          </HeaderContent>
        </HeaderContainer>
        {this.props.children}
      </ActionContainer>
    )
  }
}
