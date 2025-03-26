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
import { countries } from '@client/utils/countries'
import { Select } from './Select'

function SelectCountryInput({
  setFieldValue,
  value,
  ...props
}: FieldProps<'COUNTRY'> & {
  setFieldValue: (name: string, val: string | undefined) => void
  value?: string
}) {
  return (
    <Select.Input
      {...props}
      // @Todo ensure countries are of the same type
      data-testid={`location__${props.id}`}
      options={countries as SelectOption[]}
      type="SELECT"
      value={value}
      onChange={(val: string) => setFieldValue(props.id, val)}
    />
  )
}

function SelectCountryOutput({ value }: { value: string | undefined }) {
  const intl = useIntl()
  const selectedCountry = countries.find((country) => country.value === value)

  return selectedCountry ? intl.formatMessage(selectedCountry.label) : ''
}

export const SelectCountry = {
  Input: SelectCountryInput,
  Output: SelectCountryOutput
}
