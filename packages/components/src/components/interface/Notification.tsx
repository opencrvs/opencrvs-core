import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import { Button } from '../buttons'
export enum NOTIF_TYPE {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}
interface IProps {
  show: boolean
  type?: NOTIF_TYPE
  callback?: any
  children?: any
}

const styledNotif = styled.div.attrs<IProps>({})

const slideUp = keyframes`
  from { bottom: -80px; }
  to { bottom: 0; }
`

const NotifContainer = styledNotif`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height:80px;
  width: 100%;
  background: ${({ theme }) => theme.colors.accent};
  z-index: 1;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  transition: visibility 0s, opacity 0.5s linear;
  display: ${({ show }) => (show ? 'flex' : 'none')};
  animation: ${slideUp} 500ms;

  &.success, &.error, &.warning {
    background: ${({ theme }) => theme.colors.placeholder};
    border-top: 10px solid;
  }

  &.success {
    border-color: ${({ theme }) => theme.colors.success};  
  }

  &.error {  
    border-color: ${({ theme }) => theme.colors.error};  
  }
  &.warning {  
    border-color: ${({ theme }) => theme.colors.warning};  
  }
`

const NotifButton = styled(Button)`
  background: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.boldFont};
  border-radius: 21px;
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.95rem;
  padding: 5px 10px;
  margin: 5px;
`

export class Notification extends React.Component<IProps> {
  render() {
    const { type, show, children, callback } = this.props

    return (
      <NotifContainer className={type} show={show}>
        <NotifButton onClick={callback}>{children}</NotifButton>
      </NotifContainer>
    )
  }
}
