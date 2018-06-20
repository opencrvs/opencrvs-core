import * as React from 'react'
import { InjectedIntl } from 'react-intl'
import { FormattedMessage } from 'react-intl'
import styled, { StyledFunction } from 'styled-components'
import { Input } from './form/Input'
import { InputError } from './form/InputError'
import { InputLabel } from './form/InputLabel'
import { substituteDynamicIntlProps } from './utils/intlUtils'
import { IIntlDynamicProps } from './utils/intlUtils'
export interface IPhoneInputFieldProps {
  input?: any
  intl: InjectedIntl
  id: string
  label?: string | undefined
  placeholder?: string
  disabled: boolean
  type: string
  meta?: { touched: boolean; error: FormattedMessage.MessageDescriptor }
  maxLength?: number
  dynamicErrors?: IIntlDynamicProps
}

export const PhoneInputField = ({
  input,
  intl,
  id,
  label,
  type,
  placeholder,
  disabled,
  meta,
  maxLength = 50,
  dynamicErrors
}: IPhoneInputFieldProps) => (
  <div>
    {label && <InputLabel disabled={disabled}>{label}</InputLabel>}
    <Input
      {...input}
      placeholder={placeholder ? placeholder : disabled ? '' : label}
      error={meta && meta.error}
      touched={meta && meta.touched}
    />
    {meta &&
      dynamicErrors &&
      meta.error &&
      meta.error.defaultMessage &&
      meta.touched && (
        <InputError
          id={id + '_error'}
          errorMessage={substituteDynamicIntlProps(
            intl,
            meta.error,
            dynamicErrors
          )}
        />
      )}
  </div>
)
