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

import { FieldType } from '../events/FieldType'
import { AddressType } from '../events/CompositeFieldValue'
import { mapFieldTypeToZod } from '../events/FieldTypeMapping'
import { UUID } from '../uuid'

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
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      administrativeArea: '5ef450bc-712d-48ad-93f3-8da0fa453baa' as UUID
    },
    success: true
  },
  {
    title: 'Invalid other address',
    address: {
      country: 'BGD',
      addressType: AddressType.INTERNATIONAL,
      streetLevelDetails: [
        {
          streetName: 'Main St',
          streetNumber: '123',
          city: 'Dhaka',
          postalCode: '1212'
        }
      ]
    },
    success: false
  },
  {
    title: 'Valid other address',
    address: {
      country: 'BGD',
      addressType: AddressType.INTERNATIONAL,
      streetLevelDetails: {
        streetName: 'Main St',
        streetNumber: '123',
        city: 'Dhaka',
        postalCode: '1212'
      }
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
