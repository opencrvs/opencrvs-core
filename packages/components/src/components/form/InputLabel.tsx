import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'

export type IInputLabel = { disabled?: boolean } & React.LabelHTMLAttributes<
  HTMLLabelElement
>

const styledInputLabel = styled.label.attrs<IInputLabel>({})

const StyledInputLabel = styledInputLabel`
  min-height: 18px;
  width: 100%;
  display: inline-block;
  ${({ theme }) => theme.fonts.defaultFontStyle}
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.accent};
`

export class InputLabel extends React.Component<IInputLabel> {
  render() {
    return <StyledInputLabel {...this.props} />
  }
}
