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

import { TRPCError } from '@trpc/server'
import { encodeScope } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import {
  updateUserById,
  updateUsernameById
} from '@events/storage/postgres/events/users'

const defaultSearch = { count: 10, skip: 0, sortOrder: 'asc' as const }
const withReadAll = [encodeScope({ type: 'user.read' })]

test('Throws NOT_FOUND if user does not have user.read scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(client.user.search(defaultSearch)).rejects.toMatchObject(
    new TRPCError({ code: 'NOT_FOUND' })
  )
})

test('returns empty list when no users match', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  const results = await client.user.search({
    ...defaultSearch,
    mobile: '+99900000000'
  })

  expect(results).toEqual([])
})

test('returns all users when no filters are provided', async () => {
  const { user, users } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  const results = await client.user.search(defaultSearch)

  expect(results.length).toBeGreaterThanOrEqual(users.length)
})

test('filters by primaryOfficeId', async () => {
  const { user, locations, seed, generator } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  const targetOffice = locations[2]
  const extraUser = await seed.user(
    generator.user.create({ primaryOfficeId: targetOffice.id })
  )

  const results = await client.user.search({
    ...defaultSearch,
    primaryOfficeId: targetOffice.id
  })

  expect(results).toHaveLength(1)
  expect(results[0].id).toBe(extraUser.id)
})

test('filters by status', async () => {
  const { user, users } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  await updateUserById(user.id, { status: 'deactivated' })

  const active = await client.user.search({
    ...defaultSearch,
    status: 'active'
  })
  const deactivated = await client.user.search({
    ...defaultSearch,
    status: 'deactivated'
  })

  expect(active.every((u) => u.status === 'active')).toBe(true)
  expect(active.some((u) => u.id === user.id)).toBe(false)
  expect(deactivated.some((u) => u.id === user.id)).toBe(true)
  expect(deactivated).toHaveLength(users.length - active.length)
})

test('filters by email (case-insensitive partial match)', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  const results = await client.user.search({
    ...defaultSearch,
    email: user.id.toUpperCase()
  })

  expect(results).toHaveLength(1)
  expect(results[0].id).toBe(user.id)
})

test('filters by username (case-insensitive partial match)', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  await updateUsernameById(user.id, `u.niqueuser`)

  const results = await client.user.search({
    ...defaultSearch,
    username: 'U.NIQUEUSE'
  })

  expect(results).toHaveLength(1)
  expect(results[0].id).toBe(user.id)
})

test('filters by mobile (partial match)', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  await updateUserById(user.id, { mobile: '+447911123456' })

  const results = await client.user.search({
    ...defaultSearch,
    mobile: '7911123'
  })

  expect(results).toHaveLength(1)
  expect(results[0].id).toBe(user.id)
})

test('respects count and skip for pagination', async () => {
  const { user, seed, generator, locations } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  // Create a third user so we have at least 3 total, in a known order
  await seed.user(generator.user.create({ primaryOfficeId: locations[0].id }))

  const all = await client.user.search(defaultSearch)
  const page = await client.user.search({ ...defaultSearch, count: 1, skip: 1 })

  expect(page).toHaveLength(1)
  expect(page[0].id).toBe(all[1].id)
})

test('sortOrder asc and desc by createdAt are reversed', async () => {
  const { user, seed, generator, locations } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  // Create users sequentially to guarantee distinct createdAt values
  await seed.user(generator.user.create({ primaryOfficeId: locations[0].id }))
  await seed.user(generator.user.create({ primaryOfficeId: locations[0].id }))

  const asc = await client.user.search({ ...defaultSearch, sortOrder: 'asc' })
  const desc = await client.user.search({ ...defaultSearch, sortOrder: 'desc' })

  expect(asc.map((u) => u.id)).toEqual(desc.map((u) => u.id).reverse())
})

test('scopes results to caller office with location scope', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0], [
    encodeScope({ type: 'user.read', options: { accessLevel: 'location' } })
  ])

  const results = await client.user.search(defaultSearch)

  expect(
    results.every((u) => u.primaryOfficeId === users[0].primaryOfficeId)
  ).toBe(true)
  expect(results.some((u) => u.id === users[0].id)).toBe(true)
  expect(results.some((u) => u.id === users[1].id)).toBe(false)
})

test('caller-provided foreign primaryOfficeId is ignored with location scope', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0], [
    encodeScope({ type: 'user.read', options: { accessLevel: 'location' } })
  ])

  // users[1] is in a different office — passing their office ID should not grant access
  const results = await client.user.search({
    ...defaultSearch,
    primaryOfficeId: users[1].primaryOfficeId
  })

  expect(results.some((u) => u.id === users[1].id)).toBe(false)
  expect(
    results.every((u) => u.primaryOfficeId === users[0].primaryOfficeId)
  ).toBe(true)
})

test('scopes results to caller jurisdiction with administrativeArea scope', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0], [
    encodeScope({
      type: 'user.read',
      options: { accessLevel: 'administrativeArea' }
    })
  ])

  const results = await client.user.search(defaultSearch)

  expect(results.some((u) => u.id === users[0].id)).toBe(true)
  expect(results.some((u) => u.id === users[1].id)).toBe(false)
})

test('returns all users with global user.read scope', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0], [
    encodeScope({ type: 'user.read' })
  ])

  const results = await client.user.search(defaultSearch)

  expect(results.some((u) => u.id === users[0].id)).toBe(true)
  expect(results.some((u) => u.id === users[1].id)).toBe(true)
})
