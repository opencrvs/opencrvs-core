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
import { SelectField, SelectOption } from '@opencrvs/commons/client'
import { Select as SelectComponent } from '@opencrvs/components'
import { useIntlWithFormData } from '@client/v2-events/messages/utils'
import { StringifierContext } from './RegisteredField'

export interface SelectInputProps
  extends Omit<React.InputHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  onChange: (newValue: string) => void
  value?: string
  noOptionsMessage?: SelectField['noOptionsMessage']
  options: Array<Omit<SelectOption, 'conditionals'> & { disabled?: boolean }>
  'data-testid'?: string
}

function SelectInput({
  noOptionsMessage,
  options,
  value,
  // forwarding name to the underlying Select component results in
  // an extra input[type=hidden] element being rendered
  name,
  ...props
}: SelectInputProps) {
  const intl = useIntlWithFormData()
  const selectedOption = options.find((option) => option.value === value)
  const formattedOptions = options.map((option) => ({
    value: option.value,
    label:
      typeof option.label === 'string'
        ? option.label
        : intl.formatMessage(option.label),
    disabled: option.disabled
  }))

  const inputValue = selectedOption?.value ?? ''

  const formattedNoOptionsMessage = noOptionsMessage
    ? ({ inputValue: input }: { inputValue: string }) =>
        intl.formatMessage(noOptionsMessage, { input })
    : undefined

  return (
    <SelectComponent
      {...props}
      data-testid={props['data-testid'] || `select__${props.id}`}
      noOptionsMessage={formattedNoOptionsMessage}
      options={formattedOptions}
      value={inputValue}
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
  const intl = useIntlWithFormData()
  const selectedOption = options.find((option) => option.value === value)

  if (!selectedOption) {
    return ''
  }

  return typeof selectedOption.label === 'string'
    ? selectedOption.label
    : intl.formatMessage(selectedOption.label)
}

function stringify(value: string, context: StringifierContext<SelectField>) {
  if (!context.config) {
    return value
  }

  const option = context.config.options.find((opt) => opt.value === value)

  if (!option) {
    // eslint-disable-next-line no-console
    console.error(
      `Could not find option with value ${value} for field ${context.config.id}`
    )
    return value
  }

  return typeof option.label === 'string'
    ? option.label
    : context.intl.formatMessage(option.label)
}

export const Select = {
  Input: SelectInput,
  Output: SelectOutput,
  stringify
}
