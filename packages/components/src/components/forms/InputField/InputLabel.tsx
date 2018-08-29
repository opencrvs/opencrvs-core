import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'

export type IInputLabel = { disabled?: boolean } & React.LabelHTMLAttributes<
  HTMLLabelElement
>

const styledInputLabel = styled.label.attrs<IInputLabel>({})

const StyledInputLabel = styledInputLabel`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 16px;
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.accent};

  width: 100%;
  margin-bottom: 5px;
  display: inline-block;
`

export class InputLabel extends React.Component<IInputLabel> {
  render() {
    return <StyledInputLabel {...this.props} />
  }
}
