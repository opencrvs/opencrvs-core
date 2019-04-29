import * as React from 'react'
import styled from 'styled-components'
import { ArrowBack } from '../icons'
import { ButtonIcon, PrimaryButton, IconAction } from '../buttons'

const ActionContainer = styled.div`
  width: 100%;
`
const HeaderContainer = styled.div`
  background: linear-gradient(
    270deg,
    ${({ theme }: any) => theme.colors.headerGradientLight} 0%,
    ${({ theme }: any) => theme.colors.headerGradientDark} 100%
  );
  color: ${({ theme }: any) => theme.colors.white};
  font-weight: bold;
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
  margin-left: ${({ theme }: any) => theme.grid.margin}px;
`
const BackButton = styled(PrimaryButton)`
  width: 69px;
  height: 42px;
  background: ${({ theme }: any) => theme.colors.primary};
  justify-content: center;
  border-radius: 21px;
  /* stylelint-disable */
  ${ButtonIcon} {
    /* stylelint-enable */
    margin-left: 0em;
  }
`
const BackButtonText = styled.span`
  font-family: ${({ theme }: any) => theme.fonts.boldFont};
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 2px;
  margin-left: 14px;
  @media (max-width: ${({ theme }: any) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
const MenuTitle = styled.span`
  font-family: ${({ theme }: any) => theme.fonts.lightFont};
  font-size: 25px;
  font-weight: 300;
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
