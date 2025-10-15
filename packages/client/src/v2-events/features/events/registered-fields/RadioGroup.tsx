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
  RadioGroup as RadioGroupField,
  SelectOption
} from '@opencrvs/commons/client'
import {
  RadioGroup as RadioGroupComponent,
  RadioSize
} from '@opencrvs/components'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { useIntlWithFormData } from '@client/v2-events/messages/utils'
import { StringifierContext } from './RegisteredField'

function RadioGroupInput({
  onChange,
  value,
  options,
  configuration,
  ...props
}: FieldPropsWithoutReferenceValue<'RADIO_GROUP'> & {
  onChange: (val: string | undefined) => void
  value?: string
  disabled?: boolean
}) {
  const intl = useIntlWithFormData()

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
    <RadioGroupComponent
      {...props}
      data-testid={props.id}
      name={props.id}
      options={formattedOptions}
      size={
        configuration?.styles?.size === 'NORMAL'
          ? RadioSize.NORMAL
          : RadioSize.LARGE
      }
      value={inputValue}
      onChange={onChange}
    />
  )
}

function RadioGroupOutput({
  value,
  options
}: {
  value: Stringifiable
  options: SelectOption[]
}) {
  const intl = useIntlWithFormData()
  const selectedOption = options.find((option) => option.value === value)

  if (!selectedOption) {
    return ''
  }

  if (typeof selectedOption.label === 'string') {
    return selectedOption.label
  }

  return intl.formatMessage(selectedOption.label)
}

function stringify(
  value: string,
  { intl, config }: StringifierContext<RadioGroupField>
) {
  if (!config) {
    return value
  }

  const option = config.options.find((opt) => opt.value === value)

  if (!option) {
    // eslint-disable-next-line no-console
    console.error(
      `Could not find option with value ${value} for field ${config.id}`
    )
    return value
  }

  return typeof option.label === 'string'
    ? option.label
    : intl.formatMessage(option.label)
}

function isRadioGroupEmpty(value: Stringifiable) {
  return !value.toString()
}

export const RadioGroup = {
  Input: RadioGroupInput,
  Output: RadioGroupOutput,
  isEmptyValue: isRadioGroupEmpty,
  stringify
}
