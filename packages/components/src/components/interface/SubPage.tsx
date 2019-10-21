import * as React from 'react'
import styled from 'styled-components'
import { BackArrow } from '../icons'
import { Button } from '../buttons'
import { Box } from './Box'

const SubPageContainer = styled.div`
  width: 100%;
  height: 100vh;
  ${({ theme }) => theme.fonts.bodyStyle};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
`

const HeaderBlock = styled.div`
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
  background: '#35495d00';
  justify-content: center;
  cursor: pointer;
  margin-left: ${({ theme }) => theme.grid.margin}px;
`
const MenuTitle = styled.span`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
  margin-left: 30px;
`
const EmptyTitle = styled(MenuTitle)`
  color: ${({ theme }) => theme.colors.error};
`
const BodyContainer = styled(Box)`
  max-width: 940px;
  height: inherit;
  margin: auto;
`
interface IProps {
  title?: string
  emptyTitle: string
  goBack: () => void
}

export class SubPage extends React.Component<IProps> {
  render() {
    const { title, emptyTitle, goBack } = this.props

    return (
      <SubPageContainer>
        <HeaderBlock>
          <BackButton
            id="sub_page_back_button"
            onClick={goBack}
            icon={() => <BackArrow />}
          />
          {(title && <MenuTitle>{title}</MenuTitle>) || (
            <EmptyTitle>{emptyTitle}</EmptyTitle>
          )}
        </HeaderBlock>
        <BodyContainer>{this.props.children}</BodyContainer>π{' '}
      </SubPageContainer>
    )
  }
}
