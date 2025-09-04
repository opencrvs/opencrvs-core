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

import { http, HttpResponse, HttpResponseInit } from 'msw'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { mswServer } from '../../tests/msw'

test('Returns empty list when no ids provided', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  const fetchedEvents = await client.user.list([])

  expect(fetchedEvents).toEqual([])
})

test('Returns empty list when no ids match', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)
  mswServer.use(
    http.post(`http://localhost:3030/getUser`, () => {
      return HttpResponse.json({}, { status: 404 } as HttpResponseInit)
    })
  )

  const fetchedEvents = await client.user.list(['123-123-123'])

  expect(fetchedEvents).toEqual([])
})

test('Returns user in correct format', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  mswServer.use(
    http.post(`http://localhost:3030/getUser`, () => {
      return HttpResponse.json(user)
    })
  )
  const fetchedUser = await client.user.list([user.id])

  expect(fetchedUser).toEqual([
    {
      id: user.id,
      name: user.name,
      role: user.role,
      signature: user.signature,
      primaryOfficeId: user.primaryOfficeId
    }
  ])
})

test('Returns multiple users', async () => {
  const { user, generator, locations, seed } = await setupTestCase()
  const client = createTestClient(user)

  const usersToCreate = locations.map((location) =>
    generator.user.create({ primaryOfficeId: location.id })
  )

  const userIds = []
  const users: Array<ReturnType<typeof seed.user>> = []
  for (const userToCreate of usersToCreate) {
    const createdUser = seed.user(userToCreate)
    const userId = createdUser.id
    userIds.push(userId)
    users.push(createdUser)
  }

  mswServer.use(
    http.post(`http://localhost:3030/getUser`, async ({ request }) => {
      const body = (await request.clone().json()) as { userId: string }
      const userId = body.userId
      return HttpResponse.json(users.find((u) => u.id === userId))
    })
  )

  const fetchedUsers = await client.user.list(userIds)

  expect(fetchedUsers).toHaveLength(locations.length)
})
