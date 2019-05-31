import React = require('react')
import styled from 'styled-components'
import { Cross } from '../icons'

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
`
const ScreenBlocker = styled.div`
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.menuBackground};
  opacity: 0.8;
`
const ModalContent = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.copy};
  background-color: ${({ theme }) => theme.colors.white};
  width: 448px;
  display: flex;
  flex-direction: column;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 100%;
    height: 100vh;
  }
`
const Header = styled.div`
  ${({ theme }) => theme.fonts.regularFont};
  height: 64px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    ${({ theme }) => theme.shadows.mistyShadow};
    margin-bottom: 16px;
  }
`
const Title = styled.h1`
  ${({ theme }) => theme.fonts.h4Style};
`
const Right = styled.span`
  cursor: pointer;
`

const Body = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
  padding: 0 24px 16px;
  padding-right: 64px;
  display: flex;
  flex-direction: column;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-grow: 1;
  }
`
const Footer = styled.div`
  ${({ theme }) => theme.fonts.buttonStyle};
  padding: 16px 3px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  border-top: 2px solid ${({ theme }) => theme.colors.dividerLight};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-direction: column-reverse;
    border-top: 0px;
  }
`

const Action = styled.div`
  margin: 0 12px;
  & button {
    width: 100%;
  }
`
interface IProps {
  id?: string
  title: string
  show: boolean
  actions: JSX.Element[]
  handleClose?: () => void
}

export class ResponsiveModal extends React.Component<IProps> {
  render() {
    const { title, show, handleClose, id, actions } = this.props

    if (!show) {
      return null
    }

    return (
      <ModalContainer id={id}>
        <ScreenBlocker />
        <ModalContent>
          <Header>
            <Title>{title}</Title>
            <Right>
              <Cross onClick={handleClose} />
            </Right>
          </Header>
          <Body>{this.props.children}</Body>
          <Footer>
            {actions.map((action, i) => (
              <Action key={i}>{action}</Action>
            ))}
          </Footer>
        </ModalContent>
      </ModalContainer>
    )
  }
}
