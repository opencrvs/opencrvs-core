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
