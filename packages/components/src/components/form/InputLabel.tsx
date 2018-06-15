import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { colors } from '../colors'
import { fonts } from '../fonts'

export type IInputLabel = { disabled?: boolean } & React.LabelHTMLAttributes<
  HTMLLabelElement
>

const styledInputLabel = styled.label.attrs<IInputLabel>({})

const StyledInputLabel = styledInputLabel`
  min-height: 18px;
  width: 100%;
  display: inline-block;
  ${fonts.defaultFontStyle}
  color: ${({ disabled }) => (disabled ? colors.disabled : colors.accent)};
`

export class InputLabel extends React.Component<IInputLabel> {
  render() {
    return <StyledInputLabel {...this.props} />
  }
}
