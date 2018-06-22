import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { IInputProps, Input } from './form/Input'
import { InputError } from './form/InputError'
import { InputLabel } from './form/InputLabel'

export interface IProps {
  id: string
  label?: string
  placeholder?: string
  disabled: boolean
  type: string
  meta?: { touched: boolean; error: string }
  maxLength?: number
  min?: number
}

export type IInputFieldProps = IProps & IInputProps

const applyDefaultIfNotDisabled = (
  disabled: boolean,
  label?: string
): string => {
  return !disabled && label ? label : ''
}

export class InputField extends React.Component<IInputFieldProps, {}> {
  render() {
    const { id, label, placeholder, disabled, meta, min, ...props } = this.props

    return (
      <div>
        {label && <InputLabel disabled={disabled}>{label}</InputLabel>}

        <Input
          {...props}
          placeholder={
            placeholder
              ? placeholder
              : applyDefaultIfNotDisabled(disabled, label)
          }
          error={Boolean(meta && meta.error)}
          touched={meta && meta.touched}
        />
        {meta &&
          meta.error &&
          meta.touched && (
            <InputError id={id + '_error'} errorMessage={meta.error} />
          )}
      </div>
    )
  }
}
