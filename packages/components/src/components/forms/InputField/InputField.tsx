import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { IInputProps, Input } from './Input'
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'

export interface IProps {
  id: string
  label?: string
  placeholder?: string
  disabled: boolean
  type: string
  meta?: { touched: boolean; error: string }
  maxLength?: number
  min?: number
  focusInput: boolean
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
    const { label, placeholder, meta, focusInput, ...props } = this.props

    return (
      <div>
        {label && <InputLabel disabled={props.disabled}>{label}</InputLabel>}

        <Input
          {...props}
          placeholder={
            placeholder
              ? placeholder
              : applyDefaultIfNotDisabled(props.disabled, label)
          }
          error={Boolean(meta && meta.error)}
          touched={meta && meta.touched}
          focusInput={focusInput}
        />
        {meta &&
          meta.error &&
          meta.touched && (
            <InputError id={props.id + '_error'} centred={!props.maxLength}>
              {meta.error}
            </InputError>
          )}
      </div>
    )
  }
}
