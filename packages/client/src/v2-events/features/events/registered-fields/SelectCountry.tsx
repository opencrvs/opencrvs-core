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
import React, { useMemo } from 'react'
import { IntlShape, useIntl } from 'react-intl'
import { Country, SelectOption } from '@opencrvs/commons/client'
import { countries } from '@client/utils/countries'
import { Select, SelectInputProps } from './Select'
import { StringifierContext } from './RegisteredField'

type CountryOptions = SelectInputProps['options']

/*
 * `countries` is declared in English alphabetical order, which stops being
 * alphabetical as soon as the labels are translated, or when a country is
 * renamed (Türkiye, North Macedonia). Sorting on the formatted label keeps the
 * dropdown alphabetical in every locale, and a locale-aware collator puts the
 * accented names (Åland Islands, Côte d'Ivoire, Türkiye) where a reader of that
 * locale expects them rather than after Z.
 */
export function sortOptionsByLabel(
  options: CountryOptions,
  intl: IntlShape
): CountryOptions {
  const collator = new Intl.Collator(intl.locale, { sensitivity: 'base' })

  return [...options]
    .map((option) => ({
      option,
      label:
        typeof option.label === 'string'
          ? option.label
          : intl.formatMessage(option.label)
    }))
    .sort((a, b) => collator.compare(a.label, b.label))
    .map(({ option }) => option)
}

function useOptionsSortedByLabel(options: CountryOptions): CountryOptions {
  const intl = useIntl()

  return useMemo(() => sortOptionsByLabel(options, intl), [options, intl])
}

function SelectCountryInput(
  props: Omit<SelectInputProps, 'options'> & {
    options?: SelectInputProps['options']
  }
) {
  const options = useOptionsSortedByLabel(
    props.options ?? (countries as SelectOption[])
  )

  return (
    <Select.Input
      {...props}
      // @Todo ensure countries are of the same type
      data-testid={`location__${props.id}`}
      options={options}
    />
  )
}

function SelectCountryOutput({ value }: { value: string | undefined }) {
  const intl = useIntl()
  const selectedCountry = countries.find((country) => country.value === value)

  return selectedCountry ? intl.formatMessage(selectedCountry.label) : ''
}

function stringify(value: string, { intl }: StringifierContext<Country>) {
  const selectedCountry = countries.find((country) => country.value === value)
  return selectedCountry ? intl.formatMessage(selectedCountry.label) : ''
}

export const SelectCountry = {
  Input: SelectCountryInput,
  Output: SelectCountryOutput,
  stringify
}
