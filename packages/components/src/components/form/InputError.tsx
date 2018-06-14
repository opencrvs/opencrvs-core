import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { Colors } from '../Colors'
import { Fonts } from '../Fonts'

export interface IInputError {
  id: string
  errorMessage?: string
}

const InputErrorWrapper = styled.div`
  min-height: 18px;
  width: 100%;
  display: inline-block;
  ${Fonts.infoFontStyle}
  color: ${Colors.error};
`

export class InputError extends React.Component<IInputError> {
  render() {
    const { id, errorMessage } = this.props
    return (
      <InputErrorWrapper id={id}>
        {errorMessage}
      </InputErrorWrapper>
    )
  }
}

