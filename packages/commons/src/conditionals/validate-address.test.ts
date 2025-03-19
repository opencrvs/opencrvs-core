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

import { FieldType, mapFieldTypeToZod } from '../events'

const testCases = [
  {
    title: 'Invalid FAR address',
    address: {
      country: 'FAR'
    },
    success: false
  },
  {
    title: 'Valid FAR address',
    address: {
      country: process.env.COUNTRY || ('FAR' as const),
      province: 'sadsad-sadsad-sadsadsd-sdsdsd',
      district: 'gdgfhdfg-wwqret-dfgfgsd-ewrew',
      urbanOrRural: 'URBAN'
    },
    success: true
  },
  {
    title: 'Invalid other address',
    address: {
      country: 'ABC',
      province: 'sadsad-sadsad-sadsadsd-sdsdsd',
      district: 'gdgfhdfg-wwqret-dfgfgsd-ewrew',
      urbanOrRural: 'URBAN'
    },
    success: false
  },
  {
    title: 'Valid other address',
    address: {
      country: 'ABC',
      state: 'sadsad-sadsad-sadsadsd-sdsdsd',
      district2: 'gdgfhdfg-wwqret-dfgfgsd-ewrew'
    },
    success: true
  }
]

testCases.map(({ title, address, success }) => {
  test(title, () => {
    const result = mapFieldTypeToZod(FieldType.ADDRESS).safeParse(address)
    expect(result.success).toBe(success)
  })
})
