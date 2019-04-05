import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'

export interface IInputError {
  id: string
  centred: boolean
  ignoreMediaQuery?: boolean
  color?: string
}

const styledErrorWrapper = styled.div.attrs<IInputError>({})

const InputErrorWrapper = styledErrorWrapper`
  min-height: 18px;
  width: 100%;
  display: inline-block;
  ${({ theme }) => theme.fonts.infoFontStyle}
  color: ${({ theme, color }) => (color ? color : theme.colors.error)};
  text-align: ${({ centred }) => (!centred ? 'center' : 'left')};

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
