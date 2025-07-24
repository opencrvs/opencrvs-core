import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ITextInputProps, TextInput } from '../TextInput/TextInput'
import { Select } from '../Select/Select'
import { InputLabel } from '../InputField/InputLabel'

const PhoneWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
`

type IProps = {
  id: string
  country: string
  options: { value: string; label: string }[]
  disabled?: boolean
  meta?: { touched: boolean; error: string }
  focusInput?: boolean
  label?: string
  onChange: (phoneNumber: string) => void
  'data-testid'?: string
}

export type IIntlPhoneFieldProps = IProps & Omit<ITextInputProps, 'onChange'>

export const IntlPhoneField = ({
  id,
  disabled,
  meta,
  focusInput,
  label,
  options,
  country,
  value: initialValue,
  onChange,
  ...props
}: IIntlPhoneFieldProps) => {
  const SEPARATOR = '|'
  const [selectedCountry, setCountry] = useState(country)
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    if (typeof initialValue === 'string') {
      const [code, number] = initialValue.split(SEPARATOR)
      if (code) setCountry(code)
      if (number) setPhoneNumber(number)
    }
  }, [initialValue])

  const handleCountryChange = (code: string) => {
    setCountry(code)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value)
  }

  const handleBlur = (event: React.FocusEvent<any>) => {
    if (props.onBlur) props.onBlur(event)
    if (onChange) {
      onChange(`${selectedCountry}${SEPARATOR}${phoneNumber}`)
    }
  }

  return (
    <PhoneWrapper id={id}>
      {label && (
        <div style={{ paddingBottom: '16px' }}>
          <InputLabel id={`${id}_label`}>{label}</InputLabel>
        </div>
      )}

      <Select
        id={`${id}-country`}
        value={selectedCountry}
        width={175}
        data-testid={props['data-testid'] && `${props['data-testid']}-country`}
        options={options}
        onBlur={handleBlur}
        onChange={handleCountryChange}
        {...props}
      />

      <TextInput
        id={`${id}-number`}
        data-testid={props['data-testid'] && `${props['data-testid']}-number`}
        error={Boolean(meta && meta.error)}
        isDisabled={disabled}
        touched={meta && meta.touched}
        focusInput={focusInput}
        placeholder="Phone number"
        type="tel"
        onBlur={handleBlur}
        value={phoneNumber}
        onChange={handlePhoneChange}
        {...props}
      />
    </PhoneWrapper>
  )
}
