/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import React from 'react'
import { IntlShape, useIntl } from 'react-intl'
import {
  FieldProps,
  SelectField,
  SelectOption,
  TranslationConfig
} from '@opencrvs/commons/client'
import { Select as SelectComponent } from '@opencrvs/components'

export type SelectInputProps = Omit<FieldProps<'SELECT'>, 'label'> & {
  onChange: (newValue: string) => void
  value?: string
  label?: TranslationConfig
} & { 'data-testid'?: string }

function SelectInput({ onChange, value, ...props }: SelectInputProps) {
  const intl = useIntl()
  const { options } = props
  const selectedOption = options.find((option) => option.value === value)
  const formattedOptions = options.map((option: SelectOption) => ({
    value: option.value,
    label: intl.formatMessage(option.label)
  }))

  const inputValue = selectedOption?.value ?? ''

  return (
    <SelectComponent
      {...props}
      data-testid={props['data-testid'] || `select__${props.id}`}
      options={formattedOptions}
      value={inputValue}
      onChange={onChange}
    />
  )
}

function SelectOutput({
  value,
  options
}: {
  value: string | undefined
  options: SelectOption[]
}) {
  const intl = useIntl()
  const selectedOption = options.find((option) => option.value === value)

  return selectedOption ? intl.formatMessage(selectedOption.label) : ''
}

function stringify(intl: IntlShape, value: string, fieldConfig: SelectField) {
  const option = fieldConfig.options.find((opt) => opt.value === value)

  if (!option) {
    // eslint-disable-next-line no-console
    console.error(
      `Could not find option with value ${value} for field ${fieldConfig.id}`
    )
    return value
  }

  return intl.formatMessage(option.label)
}

export const Select = {
  Input: SelectInput,
  Output: SelectOutput,
  stringify
}
