import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'

export interface ICustomProps {
  error?: boolean
  touched?: boolean
  focusInput?: boolean
}

export type ITextInputProps = ICustomProps &
  React.InputHTMLAttributes<HTMLInputElement>

const StyledInput = styled.input.attrs<ITextInputProps>({})`
  width: 100%;
  padding: 10px;
  min-height: 30px;
  transition: border-color 500ms ease-out;
  border: 0px solid;
  border-bottom: solid 1px
    ${({ error, touched, theme }) =>
      error && touched ? theme.colors.error : theme.colors.disabled};
  box-sizing: border-box;
  outline: none;
  ${({ theme }) => theme.fonts.defaultFontStyle};
  color: ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.inputBackground};

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

  @media (min-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 515px;
  }
`

export class TextInput extends React.Component<ITextInputProps> {
  private $element: React.RefObject<HTMLInputElement>
  constructor(props: ITextInputProps, {}) {
    super(props)
    this.$element = React.createRef()
  }
  focusField(): void {
    /*
     * Needs to be run on the next tick
     * so that 'value' prop has enough time to flow back here
     * if the focusInput prop is called right after keydown
     */
    setTimeout(() => {
      this.$element.current!.focus()
    })
  }
  componentWillReceiveProps(nextProps: ITextInputProps) {
    if (!this.props.focusInput && nextProps.focusInput) {
      this.focusField()
    }
  }

  render() {
    const { focusInput, ...props } = this.props

    return <StyledInput innerRef={this.$element} {...this.props} />
  }
}
