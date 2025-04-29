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
import { on } from 'events'
import React from 'react'
import { useIntl } from 'react-intl'
import {
  FieldProps,
  RadioGroup as RadioGroupField,
  SelectOption
} from '@opencrvs/commons/client'
import {
  RadioGroup as RadioGroupComponent,
  RadioSize
} from '@opencrvs/components'
import { Stringifiable } from '@client/v2-events/components/forms/utils'

function RadioGroupInput({
  onChange,
  value,
  options,
  configuration,
  ...props
}: FieldProps<'RADIO_GROUP'> & {
  onChange: (val: string | undefined) => void
  value?: string
}) {
  const intl = useIntl()

  const selectedOption = options.find((option) => option.value === value)
  const formattedOptions = options.map((option: SelectOption) => ({
    value: option.value,
    label: intl.formatMessage(option.label)
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
  const intl = useIntl()
  const selectedOption = options.find((option) => option.value === value)

  return selectedOption ? intl.formatMessage(selectedOption.label) : ''
}

function useStringifier() {
  const intl = useIntl()

  return (value: string, fieldConfig: RadioGroupField) => {
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
}

export const RadioGroup = {
  Input: RadioGroupInput,
  Output: RadioGroupOutput,
  useStringifier: useStringifier
}
