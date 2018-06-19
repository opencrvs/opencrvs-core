import * as React from 'react'
import { InjectedIntl } from 'react-intl'
import styled, { StyledFunction } from 'styled-components'
import { Input } from './form/Input'
import { InputError } from './form/InputError'
import { InputLabel } from './form/InputLabel'

export interface IInputFieldProps {
  input?: any
  intl: InjectedIntl
  id: string
  label?: string | undefined
  placeholder?: string
  disabled: boolean
  type: string
  meta?: { touched: boolean; error: any }
  maxLength?: number
}

export const InputField = ({
  input,
  intl,
  id,
  label,
  type,
  placeholder,
  disabled,
  meta,
  maxLength = 50
}: IInputFieldProps) => (
  <div>
    {label && <InputLabel disabled={disabled}>{label}</InputLabel>}
    <Input
      {...input}
      placeholder={placeholder ? placeholder : disabled ? '' : label}
      error={meta && meta.error ? true : false}
      touched={meta && meta.touched ? true : false}
    />
    {meta &&
      meta.error &&
      (meta && meta.touched) && (
        <InputError
          id={id + '_error'}
          errorMessage={intl.formatMessage(meta.error)}
        />
      )}
  </div>
)
