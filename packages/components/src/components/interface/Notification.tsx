import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import { Button } from '../buttons'
export enum NOTIFICATION_TYPE {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}
interface IProps {
  show: boolean
  type?: NOTIFICATION_TYPE
  callback?: any
  children?: any
}

const styledNotification = styled.div.attrs({})

const NotificationContainer = styledNotification`
  position: fixed;
  left: 0;
  right: 0;
  bottom: -80px;
  height:80px;
  width: 100%;
  display:flex;
  background: ${({ theme }) => theme.colors.accent};
  z-index: 1;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  transition: bottom .5s ease-in-out;

  &.show {
    bottom: 0;
  }

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

const NotificationMessage = styled.div`
  background: ${({ theme }) => theme.colors.copyAlpha80};
  border-radius: 21px;
  padding: 5px 10px;
  margin: 5px;
  color: ${({ theme }) => theme.colors.white};
`

export class Notification extends React.Component<IProps> {
  render() {
    const { type, show, children, callback } = this.props

    return (
      <NotificationContainer
        className={(type ? type : '') + (show ? ' show' : '')}
      >
        <NotificationMessage onClick={callback}>{children}</NotificationMessage>
      </NotificationContainer>
    )
  }
}
