import * as React from 'react'
import styled from 'styled-components'

export type IInputLabel = {
  disabled?: boolean
  ignoreMediaQuery?: boolean
  color?: string
  required?: boolean
  hideAsterisk?: boolean
} & React.LabelHTMLAttributes<HTMLLabelElement>

const StyledInputLabel = styled.label<IInputLabel>`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  color: ${({ color, disabled, theme }) =>
    disabled ? theme.colors.disabled : color ? color : theme.colors.copy};
  width: 100%;
  margin-bottom: 5px;
  display: inline-block;

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 615px;
      }`
      : ''
  }}
`

const Required = styled.span<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.error};
  flex-grow: 0;
`

export class InputLabel extends React.Component<IInputLabel> {
  render() {
    const { required, hideAsterisk, children } = this.props
    return (
      <StyledInputLabel {...this.props}>
        {children}
        {required && !hideAsterisk && (
          <Required disabled={this.props.disabled}>&nbsp;*</Required>
        )}
      </StyledInputLabel>
    )
  }
}
