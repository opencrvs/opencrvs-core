import * as React from 'react'
import styled, { StyledFunction } from 'styled-components'
import { IInputProps, Input } from './Input'
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'

export interface IProps extends IInputProps {
  id: string
  label?: string
  meta?: { touched: boolean; error: string }
}

export type IInputFieldProps = IProps & IInputProps

const applyDefaultIfNotDisabled = (
  disabled?: boolean,
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
