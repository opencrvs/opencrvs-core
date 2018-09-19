import React = require('react')
import styled from 'styled-components'
import { Cross } from '../icons'

interface IProps {
  title: string
  actions: JSX.Element[]
  show: boolean
  handleClose: () => void
}

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(53, 73, 93, 0.78);
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ModalContent = styled.div`
  width: 70%;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 50px;
  color: ${({ theme }) => theme.colors.copy};
  text-align: center;
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  position: relative;
`

const Heading = styled.h3`
  color: ${({ theme }) => theme.colors.copy};
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 24px;
  font-family: ${({ theme }) => theme.fonts.regularFont};
`

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 24px;
  align-items: center;
`

const ActionItems = styled.div`
  margin: 12px 0;

  &:first-of-type {
    margin-top: 0;
  }
  &:last-of-type {
    margin-bottom: 0;
  }
`

const TopRight = styled.span`
  position: absolute;
  top: 15px;
  right: 15px;
`

export class Modal extends React.Component<IProps> {
  render() {
    const { title, actions, show, handleClose } = this.props

    if (!show) {
      return null
    }

    return (
      <Backdrop>
        <ModalContent>
          {title && <Heading>{title}</Heading>}
          <TopRight onClick={handleClose}>
            <Cross />
          </TopRight>
          {this.props.children}
          <Actions>
            {actions.map((action, i) => (
              <ActionItems key={i}>{action}</ActionItems>
            ))}
          </Actions>
        </ModalContent>
      </Backdrop>
    )
  }
}
