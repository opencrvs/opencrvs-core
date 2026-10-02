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

// A bare createIntl has no `messages`, so react-intl reports every descriptor
// as missing; the defaultMessage fallback is what these tests exercise.
function ignoreMissingTranslations() {
  return undefined
}

const intl = createIntl({ locale: 'en', onError: ignoreMissingTranslations })

const options = countries as SelectOption[]

const descriptors = options
  .map((country) => country.label)
  .filter((label) => typeof label !== 'string')

function labelOf(option: SelectOption, formatter = intl) {
  return typeof option.label === 'string'
    ? option.label
    : formatter.formatMessage(option.label)
}

const labelsByCode = new Map(
  options.map((country) => [country.value, labelOf(country)])
)

describe('the default country list', () => {
  it('gives Kyrgyzstan and Laos their own labels', () => {
    // Laos was declared with Kyrgyzstan's translation key, so both resolved to
    // the same message and Kyrgyzstan could not be told apart in the dropdown.
    expect(labelsByCode.get('KGZ')).toBe('Kyrgyzstan')
    expect(labelsByCode.get('LAO')).toBe("Lao People's Democratic Republic")
  })

  it('gives every country its own translation key', () => {
    const ids = descriptors.map((label) => label.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps every country distinct once a country config supplies translations', () => {
    // A shared key stays invisible until translations are supplied: both codes
    // then resolve through it and one of the two countries disappears.
    const translated = createIntl({
      locale: 'en',
      onError: ignoreMissingTranslations,
      messages: Object.fromEntries(
        descriptors.map((label) => [label.id, label.defaultMessage])
      )
    })

    const labels = options.map((country) => labelOf(country, translated))

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

  it('is declared in collated English order', () => {
    /*
     * This is the order the dropdown renders in: nothing sorts the options
     * between here and the <Select>. The list is maintained by hand, so a
     * rename that leaves an entry stranded (North Macedonia used to sit under
     * "The former Yugoslav Republic of...") is invisible in review otherwise.
     *
     * English is the only locale the declared order is right for. Sorting on
     * the translated label is a separate defect, left to its own ticket.
     *
     * Farajaland is excluded: it is a fictional country spliced in for demo
     * environments and has never been in its collated slot.
     */
    const declared = options
      .filter((country) => country.value !== 'FAR')
      .map((country) => labelOf(country))
    const collator = new Intl.Collator('en', { sensitivity: 'base' })

    expect(declared).toEqual([...declared].sort(collator.compare))
  })
})
