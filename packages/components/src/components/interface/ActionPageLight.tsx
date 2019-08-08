import * as React from 'react'
import styled from 'styled-components'
import { BackArrowDeepBlue } from '../icons'
import { Button } from '../buttons'
import { colors } from '../colors'
const ActionContainer = styled.div`
  width: 100%;
`
const HeaderContainer = styled.div`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.shadows.mistyShadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`
const BodyContent = styled.div`
  max-width: 940px;
  width: 100%;
  height: 64px;
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
  margin-right: 16px;
  padding: 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 24px;
  }
`

const BackButtonIcon = styled(BackArrowDeepBlue)`
  &:hover {
    g {
      stroke: ${colors.tertiary};
    }
  }
`

const BackButtonText = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  text-transform: uppercase;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
const MenuTitle = styled.div`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
`

const Container = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
  ${({ theme }) => theme.shadows.mistyShadow};
  color: ${({ theme }) => theme.colors.copy};
  padding: 24px 32px;
  margin: 32px auto 0;
  max-width: 940px;
  background: ${({ theme }) => theme.colors.white};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 40px 54px;
    padding: 24px 32px;
    min-height: 100vh;
  }
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
              <BackButton icon={icon || (() => <BackButtonIcon />)} />
              <BackButtonText>{backLabel ? backLabel : ''}</BackButtonText>
            </BackButtonContainer>
            {title && <MenuTitle>{title}</MenuTitle>}
          </BodyContent>
        </HeaderContainer>
        <Container>{this.props.children}</Container>
      </ActionContainer>
    )
  }
}
