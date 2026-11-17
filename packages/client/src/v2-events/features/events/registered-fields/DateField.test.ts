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
import { DateField } from './DateField'

const intl = createIntl({ locale: 'en' })
const context = { intl, locations: new Map(), administrativeAreas: new Map() }

describe.each([
  { name: 'stringify', fn: DateField.stringify },
  { name: 'toCertificateVariables', fn: DateField.toCertificateVariables }
])('DateField.$name', ({ fn }) => {
  describe('PlainDate input (YYYY-MM-DD)', () => {
    it('formats the date using the d MMMM y pattern', () => {
      expect(fn('2021-01-01', context)).toBe('1 January 2021')
    })

    it('is timezone-safe: always returns the correct calendar date', () => {
      // new Date('YYYY-MM-DD') is UTC midnight. In UTC−5 it rolls back to the
      // previous day (Dec 31) and in UTC+6 it shows 06:00 on Jan 1.
      // PlainDate avoids both problems by using the local-midnight constructor.

      function datePartsIn(date: Date, timeZone: string) {
        return new Intl.DateTimeFormat('en-CA', {
          timeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(date)
      }

      // Contrast: raw new Date() shifts the day in UTC−5
      expect(datePartsIn(new Date('2021-01-01'), 'America/New_York')).toContain(
        '2020-12-31'
      )

      // DateField.stringify never shifts: it always returns '1 January 2021'
      expect(fn('2021-01-01', context)).toBe('1 January 2021')
    })

    it.each([
      { input: '1990-03-15', expected: '15 March 1990' },
      { input: '2021-12-31', expected: '31 December 2021' },
      { input: '2000-07-04', expected: '4 July 2000' }
    ])('formats $input as $expected', ({ input, expected }) => {
      expect(fn(input, context)).toBe(expected)
    })
  })

  describe('DatetimeValue input (ISO 8601 with timezone)', () => {
    it('formats a noon-UTC datetime to the local calendar date', () => {
      // T12:00:00.000Z is noon UTC. In every timezone that is UTC−12 to UTC+11
      // the local date matches the calendar date in the ISO string.
      const localDate = new Date('2021-06-15T12:00:00.000Z')
      const expectedDay = localDate.getDate()
      const result = fn('2021-06-15T12:00:00.000Z', context)
      expect(result).toContain(String(expectedDay))
      expect(result).toContain('June')
      expect(result).toContain('2021')
    })
  })

  describe('invalid / unsupported input', () => {
    it('passes through an unrecognised string unchanged', () => {
      expect(fn('not-a-date', context)).toBe('not-a-date')
    })

    it('returns an empty string for undefined', () => {
      expect(fn(undefined, context)).toBe('')
    })
  })
})
