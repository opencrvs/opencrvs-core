import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { Colors } from './Colors'
import { Fonts } from './Fonts'

export interface IButton {
  id: string
  secondary?: boolean
  children?: any
}

const styledButton = styled.button.attrs<IButton>({})

export const StyledButton = styledButton`
  width: auto;
  min-height: 44px;
  color: ${({ secondary }) => (secondary ? Colors.accent : '#FFFFFF')};
  background: ${({ secondary }) => (secondary ? '#FFFFFF' : Colors.primary)};
  border: ${({ secondary }) => (secondary ? `2px solid ${Colors.accent}` : '#FFFFFF')};
  border-radius: 2px;
  ${Fonts.capsFontStyle}
  cursor: pointer;
  padding: 4px 35px 0px 35px;
  &:hover {
    background: linear-gradient(${Colors.hoverGradientDark}, ${Colors.primary});
    color: '#FFFFFF';
  }

  &:active {
    color: ${Colors.accentGradientDark};
    outline: none;
  }

  &:disabled {
    background-color: '#FFFFFF';
    cursor: not-allowed;
    color: ${Colors.disabled};
  }
`
export class Button extends React.Component<IButton> {
  render() {
    const { children } = this.props
    return (
      <StyledButton {...this.props}>
      {children}
      </StyledButton>
    )
  }
}
