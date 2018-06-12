import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { Colors } from '../Colors'
import { Fonts } from '../Fonts'

export interface IInput {
  id: string
  className?: string
  error?: boolean
  touched?: boolean
  type: string
  maxLength: number
  placeholder: string
  disabled: boolean
}

const styledInput: StyledFunction<
IInput & React.HTMLProps<HTMLInputElement>
> = styled.input

const StyledInput = styledInput`
  width: 100%;
  min-height: 30px;
  transition: border-color 500ms ease-out;
  border: 0px solid;
  border-bottom: solid 1px
    ${(
      props
    ) =>
      props.error && props.touched
        ? Colors.error
        : Colors.disabled};
  padding: 0 2px;
  outline: none;
  font-size: 18px;
  color: ${Colors.secondary};
  &:focus {
    border-bottom: solid 1px ${Colors.accent};
  }

  ${Fonts.defaultFontStyle} &::-webkit-input-placeholder {
    color: ${Colors.placeholder};
  }

  &::-moz-placeholder {
    color: ${Colors.placeholder};
  }

  &:-ms-input-placeholder {
    color: ${Colors.placeholder};
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  &[type='number'] {
    -moz-appearance: textfield;
    padding: 0;
    text-indent: 20px;
  }
`

export class Input extends React.Component<IInput> {
  render() {
    return (
      <StyledInput {...this.props} />
    )
  }
}

