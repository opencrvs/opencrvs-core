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
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { userScopes } from '@opencrvs/commons'

test('Returns single location in right format', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [userScopes.nationalSystemAdmin])

  const setLocationPayload = [
    {
      id: '123-456-789',
      partOf: null,
      name: 'Location foobar',
      externalId: 'ext-id-123'
    }
  ]

  await client.locations.set(setLocationPayload)

  const locations = await client.locations.get()

  expect(locations).toHaveLength(1)
  expect(locations).toMatchObject(setLocationPayload)
})

test('Returns multiple locations', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [userScopes.nationalSystemAdmin])
  await client.locations.set(generator.locations.set(5))

  const locations = await client.locations.get()

  expect(locations).toHaveLength(5)
})
