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

import { PlainDate, plainDateToLocalDate } from './PlainDate'

describe('plainDateToLocalDate', () => {
  describe.each([
    { date: '1990-03-15', year: 1990, month: 2, day: 15 },
    { date: '2021-01-01', year: 2021, month: 0, day: 1 },
    { date: '2021-12-31', year: 2021, month: 11, day: 31 }
  ])('for $date', ({ date, year, month, day }) => {
    it('returns the correct local year, month and day', () => {
      const result = plainDateToLocalDate(PlainDate.parse(date))
      expect(result.getFullYear()).toBe(year)
      expect(result.getMonth()).toBe(month)
      expect(result.getDate()).toBe(day)
    })

    it('places the date at local midnight', () => {
      const result = plainDateToLocalDate(PlainDate.parse(date))
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
    })
  })

  describe('contrast with new Date() via Intl.DateTimeFormat', () => {
    // new Date('YYYY-MM-DD') is always UTC midnight regardless of the host system timezone.
    // Intl.DateTimeFormat lets us observe what that UTC instant looks like in any IANA
    // timezone without touching process.env.TZ or the system clock.

    function datePartsIn(date: Date, timeZone: string) {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date)
    }

    it('in a negative UTC offset (America/New_York, UTC−5): new Date() shifts to the previous day', () => {
      // Jan 1 00:00 UTC = Dec 31 19:00 EST → wrong day
      expect(datePartsIn(new Date('2021-01-01'), 'America/New_York')).toContain(
        '2020-12-31'
      )
    })

    it('in a positive UTC offset (Asia/Dhaka, UTC+6): new Date() lands at 06:00, not midnight', () => {
      // Jan 1 00:00 UTC = Jan 1 06:00 BDT → correct day but wrong hour
      expect(datePartsIn(new Date('2021-01-01'), 'Asia/Dhaka')).toContain(
        '06:00'
      )
    })

    it('plainDateToLocalDate always produces local midnight (getHours = 0, correct date components)', () => {
      // new Date(year, month, day) uses the host timezone → local midnight, always correct.
      const result = plainDateToLocalDate(PlainDate.parse('2021-01-01'))
      expect(result.getFullYear()).toBe(2021)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(1)
      expect(result.getHours()).toBe(0)
    })
  })
})
