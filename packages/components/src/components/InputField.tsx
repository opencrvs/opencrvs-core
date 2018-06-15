import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { IInputProps, Input } from './form/Input'
import { InputError } from './form/InputError'
import { InputLabel } from './form/InputLabel'

export interface IInputFieldProps {
  label: string
  meta: {
    touched: boolean
    error?: string
  }
  maxLength?: number
}

export class InputField extends React.Component<
  IInputFieldProps & IInputProps
> {
  render() {
    const { id, meta, disabled, label, placeholder, ...props } = this.props

    const defaultLabel = disabled ? '' : label

    return (
      <div>
        {label && <InputLabel disabled={disabled}>{label}</InputLabel>}
        <Input
          {...this.props}
          placeholder={placeholder ? placeholder : defaultLabel}
          error={Boolean(meta.error)}
          touched={meta.touched}
        />
        {meta.touched &&
          meta.error && (
            <InputError id={id + '_error'} errorMessage={meta.error} />
          )}
      </div>
    )
  }
}
