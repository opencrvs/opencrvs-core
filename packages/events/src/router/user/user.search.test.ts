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
import { createPrng, encodeScope, generateUuid } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import {
  updateUserById,
  updateUsernameById
} from '@events/storage/postgres/events/users'

const defaultSearch = { count: 10, skip: 0, sortOrder: 'asc' as const }

const withSearchAll = [encodeScope({ type: 'user.search' })]

test('Throws FORBIDDEN when user has no user.search scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(client.user.search(defaultSearch)).rejects.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test('returns empty list when no users match', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, withSearchAll)

  const results = await client.user.search({
    ...defaultSearch,
    mobile: '+99900000000'
  })

  expect(results).toEqual([])
})

test('returns all users when no filters are provided', async () => {
  const { user, users } = await setupTestCase()
  const client = createTestClient(user, withSearchAll)

  const results = await client.user.search(defaultSearch)

  expect(results.length).toBeGreaterThanOrEqual(users.length)
})

test('filters by primaryOfficeId', async () => {
  const { user, users, locations, seed, generator } = await setupTestCase()
  const client = createTestClient(user, withSearchAll)

  const occupiedOfficeIds = users.map((u) => u.primaryOfficeId)
  const emptyOffice = locations.find((l) => !occupiedOfficeIds.includes(l.id))
  if (!emptyOffice) {
    throw new Error('No empty office found')
  }

  const extraUser = await seed.user(
    generator.user.create({ primaryOfficeId: emptyOffice.id })
  )

  const results = await client.user.search({
    ...defaultSearch,
    primaryOfficeId: emptyOffice.id
  })

  expect(results).toHaveLength(1)
  expect(results[0].id).toBe(extraUser.id)
})

test('filters by status', async () => {
  const { user, users } = await setupTestCase()
  const client = createTestClient(user, withSearchAll)

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
  const client = createTestClient(user, withSearchAll)

  const results = await client.user.search({
    ...defaultSearch,
    email: user.id.toUpperCase()
  })

  expect(results).toHaveLength(1)
  expect(results[0].id).toBe(user.id)
})

test('filters by username (case-insensitive partial match)', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, withSearchAll)

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
  const client = createTestClient(user, withSearchAll)

  await updateUserById(user.id, { mobile: '+447911123456' })

  const results = await client.user.search({
    ...defaultSearch,
    mobile: '7911123'
  })

  expect(results).toHaveLength(1)
  expect(results[0].id).toBe(user.id)
})

test('respects count and skip for pagination', async () => {
  const { user, seed, generator } = await setupTestCase()
  const client = createTestClient(user, withSearchAll)

  await seed.user(
    generator.user.create({ primaryOfficeId: user.primaryOfficeId })
  )

  const all = await client.user.search(defaultSearch)
  const page = await client.user.search({ ...defaultSearch, count: 1, skip: 1 })

  expect(page).toHaveLength(1)
  expect(page[0].id).toBe(all[1].id)
})

test('sortOrder asc and desc by createdAt are reversed', async () => {
  const { user, seed, generator } = await setupTestCase()
  const client = createTestClient(user, withSearchAll)

  await seed.user(
    generator.user.create({ primaryOfficeId: user.primaryOfficeId })
  )
  await seed.user(
    generator.user.create({ primaryOfficeId: user.primaryOfficeId })
  )

  const asc = await client.user.search({ ...defaultSearch, sortOrder: 'asc' })
  const desc = await client.user.search({ ...defaultSearch, sortOrder: 'desc' })

  expect(asc.map((u) => u.id)).toEqual(desc.map((u) => u.id).reverse())
})

test('location scope: only returns users in the caller office', async () => {
  const { user, users } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'user.search', options: { accessLevel: 'location' } })
  ])

  const [, secondaryUser] = users

  const results = await client.user.search(defaultSearch)

  expect(results.every((u) => u.primaryOfficeId === user.primaryOfficeId)).toBe(
    true
  )
  expect(results.some((u) => u.id === user.id)).toBe(true)
  expect(results.some((u) => u.id === secondaryUser.id)).toBe(false)
})

test('location scope: ignores explicit primaryOfficeId in search params', async () => {
  const { user, users, locations } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'user.search', options: { accessLevel: 'location' } })
  ])

  const [, secondaryUser] = users
  const secondaryOffice = locations.find(
    (l) => l.id === secondaryUser.primaryOfficeId
  )
  if (!secondaryOffice) {
    throw new Error('Could not find secondary office')
  }

  // Even passing secondaryUser's office explicitly, scope locks results to caller's office
  const results = await client.user.search({
    ...defaultSearch,
    primaryOfficeId: secondaryOffice.id
  })

  expect(results.every((u) => u.primaryOfficeId === user.primaryOfficeId)).toBe(
    true
  )
})

test('administrativeArea scope: excludes users outside jurisdiction', async () => {
  const { user, locations, seed, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'user.search',
      options: { accessLevel: 'administrativeArea' }
    })
  ])

  const outsideOffice = locations.find(
    (l) => l.administrativeAreaId !== user.administrativeAreaId
  )
  if (!outsideOffice) {
    throw new Error('No location found outside the user administrative area')
  }

  const outsideUser = await seed.user(
    generator.user.create({ primaryOfficeId: outsideOffice.id })
  )

  const results = await client.user.search(defaultSearch)

  expect(results.some((u) => u.id === outsideUser.id)).toBe(false)
})

test('administrativeArea scope: includes users in nested sub-areas', async () => {
  const { user, seed, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'user.search',
      options: { accessLevel: 'administrativeArea' }
    })
  ])

  const rng = createPrng(55555)
  const childAreaId = generateUuid(rng)
  const nestedOfficeId = generateUuid(rng)

  await seed.administrativeAreas([
    {
      name: 'Nested area',
      parentId: user.administrativeAreaId,
      id: childAreaId,
      validUntil: null,
      externalId: 'search-nested-area-001'
    }
  ])

  await seed.locations([
    {
      name: 'Nested office',
      administrativeAreaId: childAreaId,
      locationType: 'CRVS_OFFICE',
      id: nestedOfficeId,
      validUntil: null,
      externalId: 'search-nested-office-001'
    }
  ])

  const nestedUser = await seed.user(
    generator.user.create({ primaryOfficeId: nestedOfficeId })
  )

  const results = await client.user.search(defaultSearch)

  expect(results.some((u) => u.id === nestedUser.id)).toBe(true)
})

test('all scope (no options): returns users across all offices', async () => {
  const { user, users } = await setupTestCase()
  const client = createTestClient(user, withSearchAll)

  const results = await client.user.search(defaultSearch)

  const returnedIds = results.map((u) => u.id)
  expect(returnedIds).toContain(users[0].id)
  expect(returnedIds).toContain(users[1].id)
})
