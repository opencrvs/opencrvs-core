import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { Colors } from '../Colors'

export interface IInputError {
  id: string
  errorMessage?: string
}

const InputErrorWrapper = styled.div`
  min-height: 18px;
  width: 100%;
  display: inline-block;
  font-size: 14px;
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

