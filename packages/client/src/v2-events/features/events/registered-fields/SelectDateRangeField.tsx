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
  SelectDateRangeValue,
  TranslationConfig
} from '@opencrvs/commons/client'
import { Select, SelectInputProps } from './Select'

type SelectDateRangeInputProps = Omit<
  SelectInputProps,
  'value' | 'onChange' | 'options' | 'type' | 'placeholder'
> & {
  onChange: (newValue: SelectDateRangeValue) => void
  value?: SelectDateRangeValue
  options: { value: SelectDateRangeValue; label: TranslationConfig }[]

  error?: boolean
  touched?: boolean
}

/**
 *
 * @private
 * Used only for internal purposes for search functionality.
 * @returns Select with date range value as options.
 */
function SelectDateRangeFieldInput(props: SelectDateRangeInputProps) {
  const { onChange, ...rest } = props

  return (
    <Select.Input
      {...rest}
      type="SELECT"
      onChange={(val) => onChange(SelectDateRangeValue.parse(val))}
    />
  )
}

export const SelectDateRangeField = {
  Input: SelectDateRangeFieldInput,
  Output: Select.Output,
  stringify: (value: SelectDateRangeValue | undefined) =>
    value?.toString() ?? ''
}
