import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { Colors } from '../Colors'
import { Fonts } from '../Fonts'

export interface IInputLabel {
  disabled: boolean
}

const styledInputLabel = styled.label.attrs<IInputLabel>({})

const StyledInputLabel = styledInputLabel`
  min-height: 18px;
  width: 100%;
  display: inline-block;
  ${Fonts.defaultFontStyle}
  color: ${({ disabled }) => (disabled ? Colors.disabled : Colors.accent)};
`

export class InputLabel extends React.Component<IInputLabel> {
  render() {
    return (
      <StyledInputLabel {...this.props} />
    )
  }
}
