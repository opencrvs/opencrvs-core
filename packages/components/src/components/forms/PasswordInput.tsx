import * as React from 'react'
import styled from 'styled-components'
import { EyeOn, EyeOff } from '../icons'

interface ICustomProps {
  error?: boolean
  touched?: boolean
  focusInput?: boolean
  ignoreMediaQuery?: boolean
  hideBorder?: boolean
  ignoreVisibility?: boolean
  showIcon?: React.ReactNode
  hideIcon?: React.ReactNode
}

interface IPasswordInputState {
  isVisible: boolean
}

export type IPasswordInputProps = ICustomProps &
  React.InputHTMLAttributes<HTMLInputElement>

const StyledInput = styled.input.attrs<IPasswordInputProps>({})`
  width: 100%;
  padding: 8px 10px;
  min-height: 30px;
  transition: border-color 500ms ease-out;
  border: solid ${({ hideBorder }) => (hideBorder ? '0px' : '1px')}
    ${({ error, touched, theme }) =>
      error && touched ? theme.colors.error : theme.colors.secondary};
  box-sizing: border-box;
  outline: none;
  ${({ theme }) => theme.fonts.defaultFontStyle};
  color: ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.inputBackground};

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

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`

const IconButton = styled.button`
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.background};
`

export class PasswordInput extends React.Component<
  IPasswordInputProps,
  IPasswordInputState
> {
  private $element: React.RefObject<HTMLInputElement>
  constructor(props: IPasswordInputProps) {
    super(props)
    this.$element = React.createRef()
    this.state = {
      isVisible: false
    }
    this.toggleVisibility = this.toggleVisibility.bind(this)
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
  componentWillReceiveProps(nextProps: IPasswordInputProps) {
    if (!this.props.focusInput && nextProps.focusInput) {
      this.focusField()
    }
  }
  toggleVisibility(event: React.MouseEvent) {
    event.preventDefault()
    this.setState({
      isVisible: !this.state.isVisible
    })
  }

  render() {
    const { showIcon, hideIcon, ignoreVisibility } = this.props
    return (
      <>
        <StyledInput
          innerRef={this.$element}
          {...this.props}
          type={this.state.isVisible ? 'text' : 'password'}
        />
        {!ignoreVisibility && (
          <IconButton onClick={this.toggleVisibility}>
            {this.state.isVisible ? (
              hideIcon ? (
                hideIcon
              ) : (
                <EyeOff />
              )
            ) : showIcon ? (
              showIcon
            ) : (
              <EyeOn />
            )}
          </IconButton>
        )}
      </>
    )
  }
}
