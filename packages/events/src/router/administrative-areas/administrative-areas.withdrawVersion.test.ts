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
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import { getLeafLevelAdministrativeAreaIds } from '@events/storage/postgres/administrative-hierarchy/locations'

const scope = encodeScope({ type: 'location.edit' })

async function createArea(
  client: ReturnType<typeof createTestClient>,
  overrides: { name?: string; externalId?: string; effectiveFrom?: string } = {}
) {
  return client.administrativeAreas.create({
    name: overrides.name ?? 'Original District',
    externalId: overrides.externalId ?? 'area-withdraw-test-pcode',
    parentId: null,
    effectiveFrom: overrides.effectiveFrom ?? '2024-01-01',
    status: 'active'
  })
}

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  const registrarClient = createTestClient(user)

  await expect(
    registrarClient.administrativeAreas.withdrawVersion({
      id: generateUuid(),
      versionId: generateUuid()
    })
  ).rejects.toThrow('FORBIDDEN')
})

test('withdraws a pending future version and writes an audit entry', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    name: 'Future Rename District',
    externalId: 'area-withdraw-happy-pcode'
  })

  const updated = await client.administrativeAreas.update({
    id: created.id,
    name: 'Future Name',
    externalId: 'area-withdraw-happy-pcode',
    status: 'active',
    effectiveFrom: '2099-01-01',
    lastVersionId: created.versions[0].versionId
  })

  const pendingVersionId = updated.versions[1].versionId

  const result = await client.administrativeAreas.withdrawVersion({
    id: created.id,
    versionId: pendingVersionId
  })

  expect(result.versions).toEqual([created.versions[0]])
  expect(result.name).toBe('Future Rename District')

  const row = await getClient()
    .selectFrom('administrativeAreas')
    .select(['versions'])
    .where('id', '=', created.id)
    .executeTakeFirstOrThrow()
  expect(row.versions).toHaveLength(1)

  const auditEntries = await getClient()
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'administrativeAreas.withdrawVersion')
    .execute()

  expect(auditEntries).toHaveLength(1)
  expect(auditEntries[0].clientId).toBe(user.id)
  expect(auditEntries[0].clientType).toBe(TokenUserType.enum.user)
  expect(auditEntries[0].requestData).toEqual({
    id: created.id,
    versionId: pendingVersionId
  })
  expect(auditEntries[0].responseSummary).toEqual({
    effectiveFrom: '2099-01-01',
    name: 'Future Name',
    externalId: 'area-withdraw-happy-pcode',
    status: 'active'
  })
})

test('rejects withdrawing an already-effective version that is also the only version — the only-version check wins', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    name: 'Already Effective District',
    externalId: 'area-withdraw-past-pcode'
  })

  await expect(
    client.administrativeAreas.withdrawVersion({
      id: created.id,
      // The initial (creation) element is already in effect — 2024-01-01 —
      // but it is also the only version, and that check takes precedence.
      versionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('only one version')
  })
})

test('rejects withdrawing the only version an administrative area has', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    name: 'Single Version District',
    externalId: 'area-withdraw-only-version-pcode',
    effectiveFrom: '2099-01-01'
  })

  await expect(
    client.administrativeAreas.withdrawVersion({
      id: created.id,
      versionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('only one version')
  })

  const row = await getClient()
    .selectFrom('administrativeAreas')
    .select(['versions'])
    .where('id', '=', created.id)
    .executeTakeFirstOrThrow()
  expect(row.versions).toHaveLength(1)

  const auditEntries = await getClient()
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'administrativeAreas.withdrawVersion')
    .execute()
  expect(auditEntries).toHaveLength(0)
})

test('rejects withdrawing an already-effective INACTIVE version too — the check is date-based, not status-based', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    name: 'Closed District',
    externalId: 'area-withdraw-past-inactive-pcode'
  })

  const inactivated = await client.administrativeAreas.update({
    id: created.id,
    name: 'Closed District',
    externalId: 'area-withdraw-past-inactive-pcode',
    status: 'inactive',
    effectiveFrom: '2024-06-01',
    lastVersionId: created.versions[0].versionId
  })
  const pastInactiveVersionId = inactivated.versions[1].versionId

  await expect(
    client.administrativeAreas.withdrawVersion({
      id: created.id,
      versionId: pastInactiveVersionId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('already in effect')
  })

  const row = await getClient()
    .selectFrom('administrativeAreas')
    .select(['versions'])
    .where('id', '=', created.id)
    .executeTakeFirstOrThrow()
  expect(row.versions).toHaveLength(2)
})

test('rejects an unknown administrative area id', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  await expect(
    client.administrativeAreas.withdrawVersion({
      id: generateUuid(),
      versionId: generateUuid()
    })
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('rejects an unknown versionId on an existing administrative area', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    name: 'No Such Version District',
    externalId: 'area-withdraw-unknown-version-pcode'
  })

  await expect(
    client.administrativeAreas.withdrawVersion({
      id: created.id,
      versionId: generateUuid()
    })
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('a second withdrawal of the same version is rejected', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    name: 'Double Withdraw District',
    externalId: 'area-withdraw-twice-pcode'
  })

  const updated = await client.administrativeAreas.update({
    id: created.id,
    name: 'Pending Name',
    externalId: 'area-withdraw-twice-pcode',
    status: 'active',
    effectiveFrom: '2099-01-01',
    lastVersionId: created.versions[0].versionId
  })
  const pendingVersionId = updated.versions[1].versionId

  await client.administrativeAreas.withdrawVersion({
    id: created.id,
    versionId: pendingVersionId
  })

  await expect(
    client.administrativeAreas.withdrawVersion({
      id: created.id,
      versionId: pendingVersionId
    })
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })

  const auditEntries = await getClient()
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'administrativeAreas.withdrawVersion')
    .execute()

  expect(auditEntries).toHaveLength(1)
})

test('does not invalidate the leaf-level administrative area cache', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    name: 'Cache Stable Withdraw District',
    externalId: 'area-cache-withdraw-pcode'
  })

  const updated = await client.administrativeAreas.update({
    id: created.id,
    name: 'Pending Rename',
    externalId: 'area-cache-withdraw-pcode',
    status: 'active',
    effectiveFrom: '2099-01-01',
    lastVersionId: created.versions[0].versionId
  })

  const before = await getLeafLevelAdministrativeAreaIds()

  await client.administrativeAreas.withdrawVersion({
    id: created.id,
    versionId: updated.versions[1].versionId
  })

  const after = await getLeafLevelAdministrativeAreaIds()
  expect(after).toBe(before)
})
