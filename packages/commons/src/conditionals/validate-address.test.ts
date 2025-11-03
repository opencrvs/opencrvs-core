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

import { AddressType } from '../events/CompositeFieldValue'
import { mapFieldTypeToZod } from '../events/FieldTypeMapping'
import { UUID } from '../uuid'
import { tennisClubMembershipEvent } from '../fixtures'

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
      // @NOTE: This happens to map to a valid location in events test environment. Updating it will break tests.
      // @TODO:  Find a way to give out context aware mock values in the future.
      administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a' as UUID,
      streetLevelDetails: {
        state: 'state',
        district2: 'district2'
      }
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
        state: 'state',
        district2: 'district2'
      }
    },
    success: true
  }
]

testCases.map(({ title, address, success }) => {
  test(title, () => {
    const addressConfig = tennisClubMembershipEvent.declaration.pages
      .flatMap((page) => page.fields)
      .find((f) => f.type === 'ADDRESS')

    if (!addressConfig) {
      throw new Error('Address config not found')
    }

    const result = mapFieldTypeToZod(addressConfig).safeParse(address)
    expect(result.success).toBe(success)
  })
})
