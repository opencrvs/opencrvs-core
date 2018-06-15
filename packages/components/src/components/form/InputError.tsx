import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'

export interface IInputError {
  id: string
  errorMessage?: string
}

const InputErrorWrapper = styled.div`
  min-height: 18px;
  width: 100%;
  display: inline-block;
  ${({ theme }) => theme.fonts.infoFontStyle}
  color: ${({ theme }) => theme.colors.error};
`

export class InputError extends React.Component<IInputError> {
  render() {
    const { id, errorMessage } = this.props
    return <InputErrorWrapper id={id}>{errorMessage}</InputErrorWrapper>
  }
}
