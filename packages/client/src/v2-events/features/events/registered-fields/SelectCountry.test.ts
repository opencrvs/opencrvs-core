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

import { createIntl } from 'react-intl'
import { SelectOption } from '@opencrvs/commons/client'
import { countries } from '@client/utils/countries'
import { sortOptionsByLabel } from './SelectCountry'

/*
 * Without a `messages` map react-intl reports every descriptor as a missing
 * translation. Falling back to `defaultMessage` is exactly what we want here,
 * so the reports are noise.
 */
function ignoreMissingTranslations() {
  return undefined
}

const intl = createIntl({ locale: 'en', onError: ignoreMissingTranslations })

function option(value: string, defaultMessage: string) {
  return {
    value,
    label: {
      id: `countries.${value}`,
      defaultMessage,
      description: `ISO Country: ${value}`
    }
  }
}

function labelsOf(options: ReturnType<typeof sortOptionsByLabel>) {
  return options.map((o) =>
    typeof o.label === 'string' ? o.label : intl.formatMessage(o.label)
  )
}

describe('sortOptionsByLabel', () => {
  it('orders options by their formatted label rather than their declared order', () => {
    const sorted = sortOptionsByLabel(
      [
        option('ZWE', 'Zimbabwe'),
        option('ALB', 'Albania'),
        option('MKD', 'North Macedonia')
      ],
      intl
    )

    expect(labelsOf(sorted)).toEqual(['Albania', 'North Macedonia', 'Zimbabwe'])
  })

  it('places accented names where a reader expects them, not after Z', () => {
    // A plain codepoint sort puts Türkiye and Åland after Zimbabwe.
    const sorted = sortOptionsByLabel(
      [
        option('ZWE', 'Zimbabwe'),
        option('TUR', 'Türkiye'),
        option('TKM', 'Turkmenistan'),
        option('TUN', 'Tunisia'),
        option('ALA', 'Åland Islands'),
        option('ALB', 'Albania')
      ],
      intl
    )

    expect(labelsOf(sorted)).toEqual([
      'Åland Islands',
      'Albania',
      'Tunisia',
      'Türkiye',
      'Turkmenistan',
      'Zimbabwe'
    ])
  })

  it('sorts options whose label is a plain string', () => {
    const sorted = sortOptionsByLabel(
      [
        { value: 'B', label: 'Beta' },
        { value: 'A', label: 'Alpha' }
      ],
      intl
    )

    expect(labelsOf(sorted)).toEqual(['Alpha', 'Beta'])
  })

  it('leaves the input array untouched', () => {
    const options = [option('ZWE', 'Zimbabwe'), option('ALB', 'Albania')]
    const before = [...options]

    sortOptionsByLabel(options, intl)

    expect(options).toEqual(before)
  })
})

describe('the default country list', () => {
  const sorted = sortOptionsByLabel(countries as SelectOption[], intl)
  const labelsByCode = new Map(
    (countries as SelectOption[]).map((country) => [
      country.value,
      typeof country.label === 'string'
        ? country.label
        : intl.formatMessage(country.label)
    ])
  )

  it('gives Kyrgyzstan and Laos their own labels', () => {
    // Laos was declared with Kyrgyzstan's translation key, so both resolved to
    // the same message and Kyrgyzstan could not be told apart in the dropdown.
    expect(labelsByCode.get('KGZ')).toBe('Kyrgyzstan')
    expect(labelsByCode.get('LAO')).toBe("Lao People's Democratic Republic")
  })

  it('gives every country its own translation key', () => {
    // A shared key is invisible until a country configuration supplies
    // translations: both codes then resolve through the same key and one of the
    // two countries becomes impossible to tell apart in the dropdown.
    const ids = (countries as SelectOption[])
      .map((country) => country.label)
      .filter((label) => typeof label !== 'string')
      .map((label) => label.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps every country distinct once a country config supplies translations', () => {
    const translated = createIntl({
      locale: 'en',
      onError: ignoreMissingTranslations,
      messages: Object.fromEntries(
        (countries as SelectOption[])
          .map((country) => country.label)
          .filter((label) => typeof label !== 'string')
          .map((label) => [label.id, label.defaultMessage])
      )
    })

    const labels = (countries as SelectOption[]).map((country) =>
      typeof country.label === 'string'
        ? country.label
        : translated.formatMessage(country.label)
    )

    expect(new Set(labels).size).toBe(labels.length)
  })

  it('renders no label with surrounding quote characters', () => {
    expect(
      [...labelsByCode.values()].filter((label) => label.includes('"'))
    ).toEqual([])
  })

  it('uses current country names', () => {
    expect(labelsByCode.get('TUR')).toBe('Türkiye')
    expect(labelsByCode.get('MKD')).toBe('North Macedonia')
  })

  it('comes out alphabetical once sorted', () => {
    const labels = labelsOf(sorted)
    const collator = new Intl.Collator('en', { sensitivity: 'base' })
    expect(labels).toEqual([...labels].sort(collator.compare))
  })
})
