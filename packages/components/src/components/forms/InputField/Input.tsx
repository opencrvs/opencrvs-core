import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'

export interface ICustomProps {
  error?: boolean
  touched?: boolean
  focusInput: boolean
}

export type IInputProps = ICustomProps &
  React.InputHTMLAttributes<HTMLInputElement>

const styledInput = styled.input.attrs<IInputProps>({})

const StyledInput = styledInput`
  width: 100%;
  min-height: 30px;
  transition: border-color 500ms ease-out;
  border: 0px solid;
  border-bottom: solid 1px
    ${({ error, touched, theme }) =>
      error && touched ? theme.colors.error : theme.colors.disabled};
  padding: 0 2px;
  outline: none;
  ${({ theme }) => theme.fonts.defaultFontStyle};
  color: ${({ theme }) => theme.colors.secondary};
  &:focus {
    border-bottom: solid 1px ${({ theme }) => theme.colors.accent};
  }

  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &::-moz-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  &[maxlength='1'] {
    -moz-appearance: textfield;
    display: block;
    float: left;
    padding: 0;
    text-align: center;
  }
`

export class Input extends React.Component<IInputProps> {
  private textInput: React.RefObject<HTMLInputElement>
  constructor(props: IInputProps, {}) {
    super(props)
    this.textInput = React.createRef()
  }
  focusField(): void {
    this.textInput.current!.focus()
  }
  onBlur(e: any) {
    e.preventDefault()
  }
  componentWillReceiveProps(nextProps: IInputProps) {
    if (nextProps.focusInput) {
      this.focusField()
    }
  }
  render() {
    const { focusInput, ...props } = this.props

    return (
      <StyledInput
        innerRef={this.textInput}
        {...this.props}
        onBlur={this.onBlur}
      />
    )
  }
}
