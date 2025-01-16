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

test('Returns empty list when no ids provided', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  const fetchedEvents = await client.user.list([])

  expect(fetchedEvents).toEqual([])
})

test('Returns empty list when no ids match', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  const fetchedEvents = await client.user.list(['123-123-123'])

  expect(fetchedEvents).toEqual([])
})

test('Returns user in correct format', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  const fetchedUser = await client.user.list([user.id])

  expect(fetchedUser).toEqual([
    {
      id: user.id,
      name: user.name,
      systemRole: user.systemRole
    }
  ])
})

test('Returns multiple users', async () => {
  const { user, generator, locations, seed, userMgntDb } = await setupTestCase()
  const client = createTestClient(user)

  const usersToCreate = locations.map((location) =>
    generator.user.create({ primaryOfficeId: location.id })
  )

  const userIds = []
  for (const user of usersToCreate) {
    const userId = (await seed.user(userMgntDb, user))?.id
    userIds.push(userId)
  }

  const users = await client.user.list(userIds)

  expect(users).toHaveLength(locations.length)
})
