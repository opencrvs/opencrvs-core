import * as React from 'react'
import { RadioGroup } from '@opencrvs/components/lib/forms'
import { InputField } from 'src/components/form/InputField'
import {
  Ii18nFormField,
  IFormFieldValue,
  Ii18nRadioGroupFormField
} from 'src/forms'
import { injectIntl } from 'react-intl'

type IInputProps = {
  id: string
  onChange: (e: React.ChangeEvent<any>) => void
  onBlur: (e: React.FocusEvent<any>) => void
  value: IFormFieldValue
  disabled?: boolean
  error: boolean
  touched?: boolean
}

type IInputFieldProps = {
  id: string
  label: string
  description?: string
  required?: boolean
  disabled?: boolean
  prefix?: string
  postfix?: string
  error: string
  touched: boolean
}

type IProps = {
  value: IFormFieldValue
  inputProps: IInputProps
  inputFieldProps: IInputFieldProps
  fieldDefinition: Ii18nFormField
  onSetFieldValue: (name: string, value: IFormFieldValue) => void
}

function InformativeRadioGroupComponent({
  value,
  inputProps,
  inputFieldProps,
  onSetFieldValue,
  fieldDefinition
}: IProps) {
  return (
    <InputField {...inputFieldProps}>
      <RadioGroup
        {...inputProps}
        onChange={(val: string) => onSetFieldValue(fieldDefinition.name, val)}
        options={(fieldDefinition as Ii18nRadioGroupFormField).options}
        name={fieldDefinition.name}
        value={value as string}
      />
    </InputField>
  )
}

export const InformativeRadioGroup = injectIntl(InformativeRadioGroupComponent)
