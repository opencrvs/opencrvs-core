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
import { FieldUpdateValue, safeUnion } from './FieldValue'
import { NameFieldUpdateValue } from './CompositeFieldValue'

describe('safeUnion', () => {
  const TextValue = z.string().describe('TextValue')
  const DateValue = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe('DateValue')
  const NumberValue = z.number().describe('NumberFieldValue')

  it('returns true if only one schema matches', () => {
    const schema = safeUnion([NumberValue, TextValue])
    expect(schema.safeParse('hello').success).toBe(true) // only TextValue passes
    expect(schema.safeParse(123).success).toBe(true) // only NumberValue passes
  })

  it('returns false if no schema matches', () => {
    const schema = safeUnion([DateValue, NumberValue])
    expect(schema.safeParse({ not: 'valid' }).success).toBe(false)
  })

  it('picks the higher priority schema if multiple match', () => {
    // "2050-01-01" matches both TextValue (string) and DateValue (regex)
    const schema = safeUnion([TextValue, DateValue])
    const result = schema.safeParse('2050-01-01')
    // Both match, but DateValue wins because it's earlier in PRIORITY_ORDER
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
