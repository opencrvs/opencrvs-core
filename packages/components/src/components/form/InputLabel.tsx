import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { Colors } from '../Colors'

export interface IInputLabel {
  disabled: boolean
}

const styledInputLabel: StyledFunction<
IInputLabel & React.HTMLProps<HTMLInputElement>
> = styled.label

const StyledInputLabel = styledInputLabel`
  min-height: 18px;
  width: 100%;
  display: inline-block;
  font-size: 18px;
  color: ${({ disabled }) => (disabled ? Colors.disabled : Colors.accent)};
`

export class InputLabel extends React.Component<IInputLabel> {
  render() {
    return (
      <StyledInputLabel {...this.props} />
    )
  }
}
