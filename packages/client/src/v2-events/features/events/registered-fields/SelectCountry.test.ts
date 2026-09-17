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
import { sortOptionsByLabel } from './SelectCountry'

// A bare createIntl has no `messages`, so react-intl reports every descriptor
// as missing; the defaultMessage fallback is what these tests exercise.
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

  it("sorts a non-Latin script in that script's own alphabetical order", () => {
    const bengali = createIntl({
      locale: 'bn',
      onError: ignoreMissingTranslations
    })
    const sorted = sortOptionsByLabel(
      [
        option('IND', 'ভারত'),
        option('AUS', 'অস্ট্রেলিয়া'),
        option('CAN', 'কানাডা'),
        option('JPN', 'জাপান')
      ],
      bengali
    )

    expect(
      sorted.map((o) =>
        typeof o.label === 'string' ? o.label : o.label.defaultMessage
      )
    ).toEqual(['অস্ট্রেলিয়া', 'কানাডা', 'জাপান', 'ভারত'])
  })

  it("groups untranslated names after the ones in the locale's script", () => {
    /*
     * A country configuration rarely translates all 249 names, so the list is
     * usually mixed: translated labels in the locale's script, the rest falling
     * back to the English defaultMessage. The collator groups by script rather
     * than interleaving, which keeps each block readable.
     */
    const bengali = createIntl({
      locale: 'bn',
      onError: ignoreMissingTranslations
    })
    const sorted = sortOptionsByLabel(
      [
        option('IND', 'ভারত'),
        option('ZWE', 'Zimbabwe'),
        option('AUS', 'অস্ট্রেলিয়া'),
        option('ALB', 'Albania')
      ],
      bengali
    )

    expect(sorted.map((o) => o.value)).toEqual(['AUS', 'IND', 'ALB', 'ZWE'])
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
