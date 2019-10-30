import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'

export interface IInputError {
  id: string
  centred?: boolean
  ignoreMediaQuery?: boolean
  color?: string
}

const InputErrorWrapper = styled.div<IInputError>`
  min-height: 18px;
  width: 100%;
  padding-top:4px;
  display: inline-block;
  ${({ theme }) => theme.fonts.subtitleStyle}
  color: ${({ theme, color }) => (color ? color : theme.colors.error)};
  text-align: ${({ centred }) => (centred ? 'center' : 'left')};

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`

export class InputError extends React.Component<IInputError> {
  render() {
    const { children, centred, ...props } = this.props
    return (
      <InputErrorWrapper centred={centred} {...props}>
        {children}
      </InputErrorWrapper>
    )
  }
}
