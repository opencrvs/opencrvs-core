import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { Input } from './form/Input'
import { InputError } from './form/InputError'
import { InputLabel } from './form/InputLabel'

export interface IInputField {
  id: string
  label: string
  type: string
  placeholder?: string
  disabled: boolean
  meta: {
    touched: boolean
    error: boolean
  }
  errorMessage?: string
  maxLength?: number
}

export class InputField extends React.Component<IInputField> {
  render() {
    const {
      id,
      label,
      type,
      placeholder,
      disabled,
      meta,
      errorMessage,
      maxLength = 50
    } = this.props

    return (
      <div>
        {label && <InputLabel disabled={disabled}>{label}</InputLabel>}
        <Input
          id={id}
          type={type}
          maxLength={maxLength}
          placeholder={placeholder ? placeholder : label}
          error={meta.error}
          touched={meta.touched}
          disabled={disabled}/>
          {meta.touched &&
          meta.error && (
          <InputError
            id={id + 'error'}
            errorMessage={errorMessage}
          />
        )}
      </div>
    )
  }
}
