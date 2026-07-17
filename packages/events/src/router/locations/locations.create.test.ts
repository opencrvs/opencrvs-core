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
import { sql } from 'kysely'
import { encodeScope, generateUuid, TokenUserType } from '@opencrvs/commons'
import {
  createTestClient,
  setupTestCase,
  UUID_REGEX
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'

const scope = encodeScope({ type: 'location.edit' })

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  // User missing required scope
  const registrarClient = createTestClient(user)

  await expect(
    registrarClient.locations.create({
      name: 'Forbidden Office',
      externalId: 'forbidden-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE'
    })
  ).rejects.toThrow('FORBIDDEN')
})

test('creates a location with the supplied version fields and writes an audit entry', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const location = await client.locations.create({
    name: 'Ibombo HQ Office',
    externalId: 'create-happy-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE',
    effectiveFrom: '2024-01-01',
    status: 'active'
  })

  expect(location).toMatchObject({
    id: expect.stringMatching(UUID_REGEX),
    name: 'Ibombo HQ Office',
    externalId: 'create-happy-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE',
    status: 'active'
  })
  expect(location.versions).toEqual([
    {
      versionId: expect.stringMatching(UUID_REGEX),
      effectiveFrom: '2024-01-01',
      name: 'Ibombo HQ Office',
      externalId: 'create-happy-pcode',
      status: 'active'
    }
  ])

  const rows = await getClient()
    .selectFrom('locations')
    .select(['id', 'createdAt'])
    .where('id', '=', location.id)
    .execute()

  expect(rows).toHaveLength(1)
  expect(rows[0].createdAt).toBeTruthy()

  const auditEntries = await getClient()
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'locations.create')
    .execute()

  expect(auditEntries).toHaveLength(1)
  expect(auditEntries[0].clientId).toBe(user.id)
  expect(auditEntries[0].clientType).toBe(TokenUserType.enum.user)
  expect(auditEntries[0].requestData).toMatchObject({
    id: location.id,
    versionId: location.versions[0].versionId,
    name: 'Ibombo HQ Office',
    externalId: 'create-happy-pcode',
    effectiveFrom: '2024-01-01',
    status: 'active'
  })
})

test('returns the existing location on identical replay with a client-supplied id', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const payload = {
    id: generateUuid(),
    name: 'Replayed Office',
    externalId: 'replay-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE'
  }

  const first = await client.locations.create(payload)
  const second = await client.locations.create(payload)

  expect(second).toEqual(first)

  const rows = await getClient()
    .selectFrom('locations')
    .select('id')
    .where('id', '=', payload.id)
    .execute()

  expect(rows).toHaveLength(1)

  const auditEntries = await getClient()
    .selectFrom('auditLog')
    .select('id')
    .where('operation', '=', 'locations.create')
    .execute()

  expect(auditEntries).toHaveLength(1)
})

test('rejects replay with the same id but different values', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const id = generateUuid()

  await client.locations.create({
    id,
    name: 'Original name',
    externalId: 'conflicting-replay-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE'
  })

  await expect(
    client.locations.create({
      id,
      name: 'Different name',
      externalId: 'conflicting-replay-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE'
    })
  ).rejects.toThrow(`Location with id ${id} already exists with different`)
})

test('rejects creating a location with the externalId of an active location', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  await client.locations.create({
    name: 'First Office',
    externalId: 'duplicate-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE'
  })

  await expect(
    client.locations.create({
      name: 'Second Office',
      externalId: 'duplicate-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE'
    })
  ).rejects.toThrow(
    'An active location with externalId duplicate-pcode already exists'
  )
})

test('rejects an externalId held by an active location only in its versions, not the legacy column', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const existing = await client.locations.create({
    name: 'Recoded Office',
    externalId: 'original-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE'
  })

  // Simulate a recode: the current version carries a new externalId while the
  // frozen legacy column still holds the original one.
  const recodedVersion = JSON.stringify([
    {
      versionId: generateUuid(() => 0.77),
      effectiveFrom: '2024-01-01',
      name: 'Recoded Office',
      externalId: 'recoded-pcode',
      status: 'active'
    }
  ])

  await getClient()
    .updateTable('locations')
    .set({ versions: sql`versions || ${recodedVersion}::jsonb` })
    .where('id', '=', existing.id)
    .execute()

  // The uniqueness check must see the current (versions-resolved) code, which
  // the legacy column knows nothing about.
  await expect(
    client.locations.create({
      name: 'Another Office',
      externalId: 'recoded-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE'
    })
  ).rejects.toThrow(
    'An active location with externalId recoded-pcode already exists'
  )
})

test('rejects two future-dated creates booking the same externalId', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  await client.locations.create({
    name: 'First Future Office',
    externalId: 'double-booked-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE',
    effectiveFrom: '2099-01-01'
  })

  // Neither location is active today, but both would hold the code from 2099
  // onward — the check must look at the future, not just at now.
  await expect(
    client.locations.create({
      name: 'Second Future Office',
      externalId: 'double-booked-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE',
      effectiveFrom: '2099-06-01'
    })
  ).rejects.toThrow(
    'An active location with externalId double-booked-pcode already exists'
  )
})

test('allows reusing an inactivated location externalId from a later effective date', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const predecessor = await client.locations.create({
    name: 'Predecessor Office',
    externalId: 'transferred-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE'
  })

  // Inactivate the predecessor as of 2024-01-01 (appended directly — the
  // update endpoint arrives in a later iteration).
  const inactiveVersion = JSON.stringify([
    {
      versionId: generateUuid(() => 0.66),
      effectiveFrom: '2024-01-01',
      name: 'Predecessor Office',
      externalId: 'transferred-pcode',
      status: 'inactive'
    }
  ])

  await getClient()
    .updateTable('locations')
    .set({ versions: sql`versions || ${inactiveVersion}::jsonb` })
    .where('id', '=', predecessor.id)
    .execute()

  // The successor takes over the code from a date on which the predecessor
  // no longer actively holds it — the Makati→Taguig transfer recipe.
  const successor = await client.locations.create({
    name: 'Successor Office',
    externalId: 'transferred-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE',
    effectiveFrom: '2024-01-01'
  })

  expect(successor.externalId).toBe('transferred-pcode')
  expect(successor.id).not.toBe(predecessor.id)
})

test('creates a future-dated location whose fields resolve to the only version', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const location = await client.locations.create({
    name: 'Future Office',
    externalId: 'future-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE',
    effectiveFrom: '2099-01-01'
  })

  expect(location.versions).toEqual([
    expect.objectContaining({ effectiveFrom: '2099-01-01', status: 'active' })
  ])

  // The name falls back to the earliest element so it still renders, but a
  // location whose first version is in the future is not active yet.
  expect(location.name).toBe('Future Office')
  expect(location.externalId).toBe('future-pcode')
  expect(location.status).toBe('inactive')

  // ...and it must not be offered where only active locations belong.
  const activeLocations = await client.locations.list({ isActive: true })
  expect(activeLocations.find((l) => l.id === location.id)).toBeUndefined()

  const rows = await getClient()
    .selectFrom('locations')
    .select('id')
    .where('id', '=', location.id)
    .execute()

  expect(rows).toHaveLength(1)
})

test('two concurrent creates claiming the same code serialise: one wins', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  // Without the advisory lock on the code, both uniqueness checks can pass
  // before either insert commits, creating two active holders of the code.
  const results = await Promise.allSettled([
    client.locations.create({
      name: 'Concurrent Office A',
      externalId: 'concurrent-create-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE'
    }),
    client.locations.create({
      name: 'Concurrent Office B',
      externalId: 'concurrent-create-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE'
    })
  ])

  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
  const rejected = results.filter((r) => r.status === 'rejected')
  expect(rejected).toHaveLength(1)
  expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({
    code: 'CONFLICT'
  })

  const holders = await client.locations.list({
    externalId: 'concurrent-create-pcode'
  })
  expect(holders).toHaveLength(1)
})
