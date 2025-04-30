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
import { IntlShape } from 'react-intl'
import {
  FieldProps,
  SelectFieldValue,
  SelectOption
} from '@opencrvs/commons/client'
import { countries } from '@client/utils/countries'
import { Select } from './Select'

export function SelectCountry({
  setFieldValue,
  value,
  ...props
}: FieldProps<'COUNTRY'> & {
  setFieldValue: (name: string, val: SelectFieldValue | undefined) => void
  value?: SelectFieldValue
}) {
  return (
    <Select
      {...props}
      // @Todo ensure countries are of the same type
      options={countries as SelectOption[]}
      type="SELECT"
      value={value}
      onChange={(val: string) => setFieldValue(props.id, val)}
    />
  )
}

export const selectCountryFieldToString = (
  val: SelectFieldValue,
  intl: IntlShape
) => {
  if (!val) {
    return ''
  }
  const selectedCountry = countries.find(({ value }) => value === val)
  return selectedCountry ? intl.formatMessage(selectedCountry.label) : ''
}
