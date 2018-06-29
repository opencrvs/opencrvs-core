import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'

export interface IInputError {
  id: string
  errorMessage?: string
  centred: boolean
}

const styledErrorWrapper = styled.div.attrs<IInputError>({})

const InputErrorWrapper = styledErrorWrapper`
  min-height: 18px;
  width: 100%;
  display: inline-block;
  ${({ theme }) => theme.fonts.infoFontStyle}
  color: ${({ theme }) => theme.colors.error};
  text-align: ${({ centred }) => (!centred ? 'center' : 'left')};
`

export class InputError extends React.Component<IInputError> {
  render() {
    const { id, errorMessage, centred } = this.props
    return (
      <InputErrorWrapper id={id} centred={centred}>
        {errorMessage}
      </InputErrorWrapper>
    )
  }
}
