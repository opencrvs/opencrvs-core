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
