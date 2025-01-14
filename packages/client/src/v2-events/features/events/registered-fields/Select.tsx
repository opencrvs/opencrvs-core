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
import { MessageDescriptor, useIntl } from 'react-intl'
import {
  FieldProps,
  SelectFieldValue,
  SelectOption
} from '@opencrvs/commons/client'
import { Select as SelectComponent } from '@opencrvs/components'
import { InputField } from '@client/components/form/InputField'

export function Select({
  onChange,
  label,
  value,
  ...props
}: FieldProps<'SELECT'> & {
  onChange: (newValue: SelectFieldValue) => void
  value?: SelectFieldValue
}) {
  const intl = useIntl()
  const { options } = props

  const formattedOptions = options.map((option: SelectOption) => ({
    value: option.value,
    label: intl.formatMessage(option.label as MessageDescriptor)
  }))

  return (
    <InputField {...props} label={intl.formatMessage(label)} touched={false}>
      <SelectComponent
        label={'Gender'}
        options={formattedOptions}
        value={value ?? ''}
        onChange={onChange}
      />
    </InputField>
  )
}
