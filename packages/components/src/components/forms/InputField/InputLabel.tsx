import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'

export type IInputLabel = {
  disabled?: boolean
  ignoreMediaQuery?: boolean
  color?: string
} & React.LabelHTMLAttributes<HTMLLabelElement>

const styledInputLabel = styled.label.attrs<IInputLabel>({})

const StyledInputLabel = styledInputLabel`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
  color: ${({ color, disabled, theme }) =>
    disabled ? theme.colors.disabled : color ? color : theme.colors.secondary} ;
  width: 100%;
  margin-bottom: 5px;
  display: inline-block;

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`

export class InputLabel extends React.Component<IInputLabel> {
  render() {
    return <StyledInputLabel {...this.props} />
  }
}
