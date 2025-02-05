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
import { useIntl } from 'react-intl'
import { FieldProps, SelectOption } from '@opencrvs/commons/client'
import {
  RadioGroup as RadioGroupComponent,
  RadioSize
} from '@opencrvs/components'

export const INITIAL_RADIO_GROUP_VALUE = ''

export function RadioGroup({
  setFieldValue,
  value,
  options,
  configuration,
  ...props
}: FieldProps<'RADIO_GROUP'> & {
  setFieldValue: (name: string, val: string | undefined) => void
  value?: string
}) {
  const intl = useIntl()

  const formattedOptions = options.map((option: SelectOption) => ({
    value: option.value,
    label: intl.formatMessage(option.label)
  }))

  return (
    <RadioGroupComponent
      name={props.id}
      options={formattedOptions}
      size={
        configuration?.styles?.size === 'NORMAL'
          ? RadioSize.NORMAL
          : RadioSize.LARGE
      }
      value={value ?? INITIAL_RADIO_GROUP_VALUE}
      onChange={(val: string) => setFieldValue(props.id, val)}
      {...props}
    />
  )
}
