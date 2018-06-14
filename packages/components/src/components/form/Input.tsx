import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { colors } from '../colors'
import { fonts } from '../fonts'

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

const styledInput = styled.input.attrs<IInput>({})

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
        ? colors.error
        : colors.disabled};
  padding: 0 2px;
  outline: none;
  ${fonts.defaultFontStyle}
  color: ${colors.secondary};
  &:focus {
    border-bottom: solid 1px ${colors.accent};
  }

  ${fonts.defaultFontStyle} &::-webkit-input-placeholder {
    color: ${colors.placeholder};
  }

  &::-moz-placeholder {
    color: ${colors.placeholder};
  }

  &:-ms-input-placeholder {
    color: ${colors.placeholder};
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

