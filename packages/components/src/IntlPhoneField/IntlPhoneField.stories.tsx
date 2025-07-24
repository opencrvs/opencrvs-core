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
import { IntlPhoneField, IIntlPhoneFieldProps } from './IntlPhoneField'
import { callingCountries } from 'country-data'
import { useArgs } from '@storybook/preview-api'

export default {
  title: 'Input/IntlPhoneField',
  component: IntlPhoneField,
  args: {
    value: '+94|771234567',
    country: '+94',
    label: 'Phone Number'
  },
  argTypes: {
    value: { control: 'text' },
    country: { control: 'text' },
    label: { control: 'text' }
  },
  parameters: {
    docs: {
      description: {
        component:
          'IntlPhoneField is used for creating an international phone number.'
      }
    },
    storyCss: {
      height: '240px'
    }
  }
}

interface CountryOption {
  label: string
  value: string
}

const getFlagEmoji = (countryCode: string): string => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char: string) =>
      String.fromCodePoint(char.charCodeAt(0) + 0x1f1a5)
    )
}

const options: CountryOption[] = callingCountries.all
  .filter(
    (c: any): c is typeof c & { alpha2: string } =>
      c.countryCallingCodes.length > 0 && !!c.alpha2
  )
  .map((c: any): CountryOption => {
    const code: string = c.countryCallingCodes[0]
    const flag: string = getFlagEmoji(c.alpha2)
    return {
      label: `${flag} ${code}`,
      value: code
    }
  })
  .sort((a: CountryOption, b: CountryOption) => a.label.localeCompare(b.label))

export const Default = (args: Partial<IIntlPhoneFieldProps>) => {
  const [{ value }, updateArgs] = useArgs()

  const handleChange = (newValue: string) => {
    console.log('Value is:', newValue)
    updateArgs({ value: newValue })
  }

  return (
    <IntlPhoneField
      {...args}
      id="intl-phone-field"
      options={options}
      value={value}
      country={args.country ?? '+94'}
      onChange={handleChange}
    />
  )
}
