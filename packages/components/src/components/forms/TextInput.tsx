import * as React from 'react'
import styled from 'styled-components'

export interface ICustomProps {
  error?: boolean
  touched?: boolean
  focusInput?: boolean
  ignoreMediaQuery?: boolean
  hideBorder?: boolean
  autocomplete?: boolean
  isSmallSized?: boolean
}

export type ITextInputProps = ICustomProps &
  React.InputHTMLAttributes<HTMLInputElement>

const StyledInput = styled.input.attrs<ITextInputProps>({})`
  width: 100%;
  padding: 8px 10px;
  height: 40px;
  transition: border-color 500ms ease-out;
  box-sizing: border-box;
  outline: none;
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.background};

  ${({ hideBorder, error, touched, theme }) =>
    hideBorder
      ? `
      border:none;
      ${
        error && touched
          ? `box-shadow: 0 0 0px 2px ${theme.colors.error};`
          : 'box-shadow: none;'
      }
      &:focus {
        box-shadow: 0 0 0px 2px ${
          error && touched ? theme.colors.error : theme.colors.focus
        };
      }
        `
      : `
      border: 2px solid ${
        error && touched ? theme.colors.error : theme.colors.copy
      };
      &:focus {
        box-shadow: 0 0 0px 3px ${theme.colors.focus};
      }
      `}

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

  ${({ ignoreMediaQuery, isSmallSized, theme }) => {
    return !ignoreMediaQuery
      ? isSmallSized
        ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 234px;
      }`
        : `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 535px;
      }`
      : ''
  }}
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
      if (this.$element.current) {
        this.$element.current!.focus()
      }
    })
  }
  componentWillReceiveProps(nextProps: ITextInputProps) {
    if (!this.props.focusInput && nextProps.focusInput) {
      this.focusField()
    }
  }

  render() {
    const { focusInput, ...props } = this.props

    return (
      <StyledInput
        innerRef={this.$element}
        name={props.id}
        {...this.props}
        autocomplete={false}
      />
    )
  }
}
