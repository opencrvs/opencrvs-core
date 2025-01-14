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
import { createTestClient } from '@events/tests/utils'
import { payloadGenerator } from '@events/tests/generators'
import { userScopes } from '@opencrvs/commons'

const nationalSystemAdminClient = createTestClient([
  userScopes.nationalSystemAdmin
])
const generator = payloadGenerator()

test('Returns empty list when no locations are set', async () => {
  const locations = await nationalSystemAdminClient.locations.get()

  expect(locations).toEqual([])
})

test('Returns single location in right format', async () => {
  const setLocationPayload = [
    { id: '123-456-789', partOf: null, name: 'Location foobar' }
  ]

  await nationalSystemAdminClient.locations.set(setLocationPayload)

  const locations = await nationalSystemAdminClient.locations.get()

  expect(locations).toHaveLength(1)
  expect(locations).toMatchObject(setLocationPayload)
})

test('Returns multiple locations', async () => {
  await nationalSystemAdminClient.locations.set(generator.locations.set(5))

  const locations = await nationalSystemAdminClient.locations.get()

  expect(locations).toHaveLength(5)
})
