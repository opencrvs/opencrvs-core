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
import { generateUuid, Location, LocationType, SCOPES } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

test('Returns single location in right format', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const locationId = generateUuid()

  const setLocationPayload: Location[] = [
    {
      id: locationId,
      parentId: null,
      name: 'Location foobar',
      validUntil: null,
      locationType: LocationType.enum.ADMIN_STRUCTURE
    }
  ]

  await client.locations.set(setLocationPayload)

  const one = await client.locations.get(locationId)

  expect(one).toMatchObject(setLocationPayload[0])
})
