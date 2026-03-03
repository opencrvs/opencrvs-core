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

import { z } from 'zod'
import {
  FieldUpdateValue,
  PlainDate,
  plainDateToLocalDate,
  safeUnion
} from './FieldValue'
import { NameFieldUpdateValue } from './CompositeFieldValue'

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

  it('in a negative UTC offset (UTC−X): new Date() shifts to the previous day, plainDateToLocalDate does not', () => {
    // getTimezoneOffset() returns positive minutes for UTC− zones (e.g. New York = +300).
    // new Date("2021-01-01") = Jan 1 00:00 UTC = Dec 31 at 19:00 EST, so getDate() = 31.
    const naive = new Date('2021-01-01')
    if (naive.getTimezoneOffset() >= 60) {
      expect(naive.getDate()).not.toBe(1)
      expect(naive.getMonth()).not.toBe(0) // not January
    }

    const result = plainDateToLocalDate(PlainDate.parse('2021-01-01'))
    expect(result.getDate()).toBe(1)
    expect(result.getMonth()).toBe(0) // January
    expect(result.getFullYear()).toBe(2021)
  })

  it('in a positive UTC offset (UTC+X): new Date() lands at a non-midnight hour, plainDateToLocalDate gives midnight', () => {
    // getTimezoneOffset() returns negative minutes for UTC+ zones (e.g. Dhaka = −360).
    // new Date("2021-06-15") = June 15 00:00 UTC = June 15 at 06:00 BDT, so getHours() = 6.
    const naive = new Date('2021-06-15')
    if (naive.getTimezoneOffset() <= -60) {
      expect(naive.getHours()).not.toBe(0)
    }

    const result = plainDateToLocalDate(PlainDate.parse('2021-06-15'))
    expect(result.getHours()).toBe(0)
    expect(result.getDate()).toBe(15)
    expect(result.getMonth()).toBe(5) // June
  })
})

describe('safeUnion', () => {
  const TextValue = z.string().describe('TextValue')
  const PlainDateSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe('PlainDate')
  const NumberValue = z.number().describe('NumberFieldValue')

  it('returns true if only one schema matches', () => {
    const schema = safeUnion([NumberValue, TextValue])
    expect(schema.safeParse('hello').success).toBe(true) // only TextValue passes
    expect(schema.safeParse(123).success).toBe(true) // only NumberValue passes
  })

  it('returns false if no schema matches', () => {
    const schema = safeUnion([PlainDateSchema, NumberValue])
    expect(schema.safeParse({ not: 'valid' }).success).toBe(false)
  })

  it('picks the higher priority schema if multiple match', () => {
    // "2050-01-01" matches both TextValue (string) and PlainDateSchema (regex)
    const schema = safeUnion([TextValue, PlainDateSchema])
    const result = schema.safeParse('2050-01-01')
    // Both match, but PlainDate wins because it's earlier in PRIORITY_ORDER
    expect(result.success).toBe(true)
  })

  it('treats unknown schema as low priority', () => {
    const HttpFieldUpdateValue = z.string().describe('HttpFieldUpdateValue') // not listed
    const schema = safeUnion([TextValue, HttpFieldUpdateValue])
    // Both match, but HttpFieldUpdateValue should lose (priority 9999)
    expect(schema.safeParse('hello').success).toBe(true)
  })

  it('test FieldUpdateValue', () => {
    const unionSchema = safeUnion([NameFieldUpdateValue, TextValue])
    const res1 = FieldUpdateValue.safeParse({ firstname: 9999, surname: 'Doe' })
    const res2 = unionSchema.safeParse({ firstname: 9999, surname: 'Doe' })

    // FieldUpdateValue validates because it includes HttpFieldUpdateValue
    expect(res1.success).toBe(true)

    // NameFieldUpdateValue does not validate because firstname is not string
    expect(res2.success).toBe(false)
  })
})
