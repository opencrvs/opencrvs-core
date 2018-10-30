import * as React from 'react'
import styled, { keyframes } from 'styled-components'

export interface IStatus extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: () => React.ReactNode
  classNames?: string
}

const StyledStatus = styled.div.attrs<IStatus>({})

const StatusContainer = StyledStatus`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  background-color: rgba(150, 150, 150, 0.1);
  border-radius: 17px;
  padding: 5px 10px 5px 7px;
  margin: 2px 5px 2px 0;
  display: flex;
  align-items:center;
  text-transform: uppercase;
  font-size: 13px;
  & span {     
    margin-left: 5px;
    &.white {
        color: #FFFFFF;
    }
    & strong {
        font-family: ${({ theme }) => theme.fonts.boldFont};
      } 
  }
`

export class Status extends React.Component<IStatus> {
  render() {
    const { icon, children, classNames } = this.props
    return (
      <StatusContainer>
        {icon && icon()}
        <span className={classNames}>{children}</span>
      </StatusContainer>
    )
  }
}
