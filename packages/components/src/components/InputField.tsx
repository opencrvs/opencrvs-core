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
  focusInput?: () => void
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
    const {
      id,
      label,
      placeholder,
      disabled,
      maxLength,
      meta,
      focusInput,
      ...props
    } = this.props

    return (
      <div>
        {label && <InputLabel disabled={disabled}>{label}</InputLabel>}

        <Input
          {...props}
          id={id}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={
            placeholder
              ? placeholder
              : applyDefaultIfNotDisabled(disabled, label)
          }
          error={Boolean(meta && meta.error)}
          touched={meta && meta.touched}
          focusInput={focusInput}
        />
        {meta &&
          meta.error &&
          meta.touched && (
            <InputError
              id={id + '_error'}
              errorMessage={meta.error}
              centred={!maxLength}
            />
          )}
      </div>
    )
  }
}
