import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { colors } from './colors'
import { fonts } from './fonts'

export interface IButton {
  id: string
  secondary?: boolean
  children?: any
  className?: string
}

const styledButton = styled.button.attrs<IButton>({})

const StyledButton = styledButton`
  width: auto;
  min-height: 44px;
  color: ${({ secondary }) => (secondary ? colors.accent : '#FFFFFF')};
  background: ${({ secondary }) => (secondary ? '#FFFFFF' : colors.primary)};
  border: ${({ secondary }) => (secondary ? `1px solid ${colors.accent}` : '#FFFFFF')};
  border-radius: 2px;
  ${fonts.capsFontStyle}
  cursor: pointer;
  padding: 4px 35px 0px 35px;
  &:hover {
    background: linear-gradient(${colors.hoverGradientDark}, ${colors.primary});
    color: ${({ secondary }) => (secondary ? '#FFFFFF' : '#FFFFFF')};
    border: ${({ secondary }) => (secondary ? '#FFFFFF' : '#FFFFFF')};
  }

  &:active {
    color: ${colors.accentGradientDark};
    outline: none;
  }

  &:disabled {
    background-color: '#FFFFFF';
    cursor: not-allowed;
    color: ${colors.disabled};
  }
`
export class Button extends React.Component<IButton> {
  render() {
    const { children, secondary, id, className } = this.props
    return (
      <StyledButton id={id} secondary={secondary} className={className}>
      {children}
      </StyledButton>
    )
  }
}
