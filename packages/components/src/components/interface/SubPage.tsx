import * as React from 'react'
import styled from 'styled-components'
import { BackArrow } from '../icons'
import { Button } from '../buttons'
import { Box } from './Box'

const SubPageContainer = styled.div`
  width: 100%;
  height: 100vh;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
`

const HeaderContainer = styled.div`
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  height: 64px;
  max-width: 940px;
  margin: auto;
  padding: 20px 10px;
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 1px;
`
const BackButton = styled(Button)`
  width: 24px;
  height: 24px;
  padding: 0px;
  background: ${({ theme }) => theme.colors.menuBackgroundTransparent};
  justify-content: center;
  cursor: pointer;
  margin-left: ${({ theme }) => theme.grid.margin}px;
`
const MenuTitle = styled.span`
  font-size: 18px;
  font-weight: 600;
  line-height: 27px;
  margin-left: 35px;
`
const BodyContainer = styled(Box)`
  max-width: 940px;
  height: inherit;
  margin: auto;
  padding: 30px 0px 30px 65px;
  font-size: 16px;
`
interface IProps {
  title: string
  goBack: () => void
}

export class SubPage extends React.Component<IProps> {
  render() {
    const { title, goBack } = this.props

    return (
      <SubPageContainer>
        <HeaderContainer>
          <BackButton
            id="sub_page_back_button"
            onClick={goBack}
            icon={() => <BackArrow />}
          />
          <MenuTitle>{title}</MenuTitle>
        </HeaderContainer>
        <BodyContainer>{this.props.children}</BodyContainer>
      </SubPageContainer>
    )
  }
}
