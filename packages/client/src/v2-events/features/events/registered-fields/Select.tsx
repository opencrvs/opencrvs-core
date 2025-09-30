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
import {
  FieldPropsWithoutReferenceValue,
  SelectField,
  SelectOption,
  TranslationConfig
} from '@opencrvs/commons/client'
import { Select as SelectComponent } from '@opencrvs/components'
import { useIntlWithFormData } from '@client/v2-events/messages/utils'
import { StringifierContext } from './RegisteredField'

export type SelectInputProps = Omit<
  FieldPropsWithoutReferenceValue<'SELECT'>,
  'label'
> & {
  onChange: (newValue: string) => void
  value?: string
  label?: TranslationConfig
  disabled?: boolean
} & { 'data-testid'?: string }

function SelectInput({ onChange, value, ...props }: SelectInputProps) {
  const intl = useIntlWithFormData()
  const { options } = props
  const selectedOption = options.find((option) => option.value === value)
  const formattedOptions = options.map((option: SelectOption) => ({
    value: option.value,
    label:
      typeof option.label === 'string'
        ? option.label
        : intl.formatMessage(option.label)
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
