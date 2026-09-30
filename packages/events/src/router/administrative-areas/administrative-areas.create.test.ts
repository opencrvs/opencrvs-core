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
import { encodeScope, generateUuid, TokenUserType } from '@opencrvs/commons'
import {
  createTestClient,
  setupTestCase,
  UUID_REGEX
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import { setAdministrativeAreas } from '@events/storage/postgres/administrative-hierarchy/administrative-areas'
import { getLeafLevelAdministrativeAreaIds } from '@events/storage/postgres/administrative-hierarchy/locations'

const scope = encodeScope({ type: 'location.edit' })

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  // User missing required scope
  const registrarClient = createTestClient(user)

  await expect(
    registrarClient.administrativeAreas.create({
      name: 'Forbidden Area',
      externalId: 'forbidden-area-pcode',
      parentId: null
    })
  ).rejects.toThrow('FORBIDDEN')
})

test('creates an administrative area with the supplied version fields and writes an audit entry', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const administrativeArea = await client.administrativeAreas.create({
    name: 'Ibombo District',
    externalId: 'create-area-pcode',
    parentId: null,
    effectiveFrom: '2024-01-01',
    status: 'active'
  })

  expect(administrativeArea).toMatchObject({
    id: expect.stringMatching(UUID_REGEX),
    name: 'Ibombo District',
    externalId: 'create-area-pcode',
    parentId: null,
    status: 'active'
  })

  expect(administrativeArea.versions).toEqual([
    {
      versionId: expect.stringMatching(UUID_REGEX),
      effectiveFrom: '2024-01-01',
      name: 'Ibombo District',
      externalId: 'create-area-pcode',
      status: 'active'
    }
  ])

  const rows = await getClient()
    .selectFrom('administrativeAreas')
    .select(['id', 'createdAt'])
    .where('id', '=', administrativeArea.id)
    .execute()

  expect(rows).toHaveLength(1)
  expect(rows[0].createdAt).toBeTruthy()

  const auditEntries = await getClient()
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'administrativeAreas.create')
    .execute()

  expect(auditEntries).toHaveLength(1)
  expect(auditEntries[0].clientId).toBe(user.id)
  expect(auditEntries[0].clientType).toBe(TokenUserType.enum.user)
  expect(auditEntries[0].requestData).toMatchObject({
    id: administrativeArea.id,
    versionId: administrativeArea.versions[0].versionId,
    name: 'Ibombo District',
    externalId: 'create-area-pcode',
    effectiveFrom: '2024-01-01',
    status: 'active'
  })
})

test('returns the existing administrative area on identical replay with a client-supplied id', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const payload = {
    id: generateUuid(),
    name: 'Replayed Area',
    externalId: 'replay-area-pcode',
    parentId: null
  }

  const first = await client.administrativeAreas.create(payload)
  const second = await client.administrativeAreas.create(payload)

  expect(second).toEqual(first)

  const rows = await getClient()
    .selectFrom('administrativeAreas')
    .select('id')
    .where('id', '=', payload.id)
    .execute()

  expect(rows).toHaveLength(1)

  const auditEntries = await getClient()
    .selectFrom('auditLog')
    .select('id')
    .where('operation', '=', 'administrativeAreas.create')
    .execute()

  expect(auditEntries).toHaveLength(1)
})

test('replays create idempotently against a seeded multi-element history', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const id = generateUuid()
  const initialVersion = {
    versionId: generateUuid(),
    effectiveFrom: '0001-01-01',
    name: 'Seeded District',
    externalId: 'seeded-area-pcode',
    status: 'active' as const
  }

  // Seeding sets the flat `name` column to the version in effect today, so a
  // seeded row that carries a rename has a flat name differing from its
  // initial version's. The replay check must compare against the initial
  // version, or this create would be rejected as a value conflict.
  await setAdministrativeAreas([
    {
      id,
      parentId: null,
      name: 'Seeded District (renamed)',
      externalId: 'seeded-area-pcode',
      versions: [
        initialVersion,
        {
          versionId: generateUuid(),
          effectiveFrom: '2020-01-01',
          name: 'Seeded District (renamed)',
          externalId: 'seeded-area-pcode',
          status: 'active' as const
        }
      ]
    }
  ])

  const replayed = await client.administrativeAreas.create({
    id,
    parentId: null,
    name: initialVersion.name,
    externalId: initialVersion.externalId,
    effectiveFrom: initialVersion.effectiveFrom,
    status: initialVersion.status
  })

  expect(replayed.id).toBe(id)
  // The seeded history survived, proving the existing row was returned rather
  // than a second one inserted.
  expect(replayed.versions).toHaveLength(2)

  const auditEntries = await getClient()
    .selectFrom('auditLog')
    .select('id')
    .where('operation', '=', 'administrativeAreas.create')
    .execute()

  expect(auditEntries).toHaveLength(0)
})

test('invalidates the leaf-level administrative area cache', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const before = await getLeafLevelAdministrativeAreaIds()

  const created = await client.administrativeAreas.create({
    name: 'New Leaf District',
    externalId: 'leaf-cache-create-pcode',
    parentId: null
  })

  const after = await getLeafLevelAdministrativeAreaIds()

  expect(after).not.toBe(before)
  expect(after.map((row) => row.id)).toContain(created.id)
})
