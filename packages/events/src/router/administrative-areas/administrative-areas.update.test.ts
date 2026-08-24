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
import {
  encodeScope,
  generateUuid,
  TokenUserType,
  UUID
} from '@opencrvs/commons'
import {
  createTestClient,
  setupTestCase,
  UUID_REGEX
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import { getLeafLevelAdministrativeAreaIds } from '@events/storage/postgres/administrative-hierarchy/locations'

const scope = encodeScope({ type: 'location.edit' })

async function createArea(
  client: ReturnType<typeof createTestClient>,
  overrides: { name?: string; externalId?: string; effectiveFrom?: string } = {}
) {
  return client.administrativeAreas.create({
    name: overrides.name ?? 'Original District',
    externalId: overrides.externalId ?? 'area-update-pcode',
    parentId: null,
    effectiveFrom: overrides.effectiveFrom ?? '2024-01-01',
    status: 'active'
  })
}

async function getVersionsFromDb(areaId: UUID) {
  return getClient()
    .selectFrom('administrativeAreas')
    .select(['name', 'versions'])
    .where('id', '=', areaId)
    .executeTakeFirstOrThrow()
}

async function getUpdateAuditEntries() {
  return getClient()
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'administrativeAreas.update')
    .execute()
}

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  const registrarClient = createTestClient(user)

  await expect(
    registrarClient.administrativeAreas.update({
      id: generateUuid(),
      name: 'Forbidden Rename',
      externalId: 'area-forbidden-pcode',
      status: 'active',
      lastVersionId: generateUuid()
    })
  ).rejects.toThrow('FORBIDDEN')
})

test('appends a rename version and writes an audit diff', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await client.administrativeAreas.create({
    name: 'Old District',
    externalId: 'area-rename-pcode',
    parentId: null,
    effectiveFrom: '2024-01-01',
    status: 'active'
  })

  const updated = await client.administrativeAreas.update({
    id: created.id,
    name: 'New District',
    externalId: 'area-rename-pcode',
    status: 'active',
    effectiveFrom: '2025-01-01',
    lastVersionId: created.versions[0].versionId
  })

  expect(updated.versions).toEqual([
    created.versions[0],
    {
      versionId: expect.stringMatching(UUID_REGEX),
      effectiveFrom: '2025-01-01',
      name: 'New District',
      externalId: 'area-rename-pcode',
      status: 'active'
    }
  ])
  expect(updated.name).toBe('New District')

  // The legacy name column stays frozen at the creation value.
  const row = await getClient()
    .selectFrom('administrativeAreas')
    .select(['name'])
    .where('id', '=', created.id)
    .executeTakeFirstOrThrow()
  expect(row.name).toBe('Old District')

  const auditEntries = await getClient()
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'administrativeAreas.update')
    .execute()

  expect(auditEntries).toHaveLength(1)
  expect(auditEntries[0].clientId).toBe(user.id)
  expect(auditEntries[0].clientType).toBe(TokenUserType.enum.user)
  expect(auditEntries[0].requestData).toEqual({
    id: created.id,
    versionId: updated.versions[1].versionId,
    name: 'New District',
    externalId: 'area-rename-pcode',
    status: 'active',
    effectiveFrom: '2025-01-01',
    lastVersionId: created.versions[0].versionId
  })
  expect(auditEntries[0].responseSummary).toEqual({
    previousVersionId: created.versions[0].versionId,
    versionId: updated.versions[1].versionId,
    changed: { name: { from: 'Old District', to: 'New District' } }
  })
})

test('rejects a stale lastVersionId, writing nothing', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await client.administrativeAreas.create({
    name: 'Stale Token District',
    externalId: 'area-stale-pcode',
    parentId: null,
    effectiveFrom: '2024-01-01',
    status: 'active'
  })

  await client.administrativeAreas.update({
    id: created.id,
    name: 'Renamed Once',
    externalId: 'area-stale-pcode',
    status: 'active',
    effectiveFrom: '2025-01-01',
    lastVersionId: created.versions[0].versionId
  })

  // Second update presents the original, now-stale version token.
  await expect(
    client.administrativeAreas.update({
      id: created.id,
      name: 'Renamed Twice',
      externalId: 'area-stale-pcode',
      status: 'active',
      effectiveFrom: '2025-06-01',
      lastVersionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('refresh and retry')
  })

  const row = await getClient()
    .selectFrom('administrativeAreas')
    .select(['versions'])
    .where('id', '=', created.id)
    .executeTakeFirstOrThrow()

  expect(row.versions).toHaveLength(2)
})

test('inactivation drops the area from the active list but keeps it in the unfiltered list', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    name: 'Closing District',
    externalId: 'area-inactivate-pcode'
  })

  await client.administrativeAreas.update({
    id: created.id,
    name: 'Closing District',
    externalId: 'area-inactivate-pcode',
    status: 'inactive',
    effectiveFrom: '2025-01-01',
    lastVersionId: created.versions[0].versionId
  })

  const activeAreas = await client.administrativeAreas.list({ isActive: true })
  expect(activeAreas.find((a) => a.id === created.id)).toBeUndefined()

  const allAreas = await client.administrativeAreas.list()
  expect(allAreas.find((a) => a.id === created.id)).toMatchObject({
    id: created.id,
    status: 'inactive'
  })
})

test('rejects a payload missing a required field', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    externalId: 'area-missing-name-pcode'
  })

  await expect(
    // @ts-expect-error - deliberately omitting the required `name`
    client.administrativeAreas.update({
      id: created.id,
      externalId: 'area-missing-name-pcode',
      status: 'active',
      lastVersionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
})

test('rejects a payload carrying the immutable parentId', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    externalId: 'area-strict-schema-pcode'
  })

  await expect(
    client.administrativeAreas.update({
      id: created.id,
      name: 'Strict Schema District',
      externalId: 'area-strict-schema-pcode',
      status: 'active',
      lastVersionId: created.versions[0].versionId,
      // @ts-expect-error - identity fields are rejected by the strict schema
      parentId: null
    })
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
})

test('rejects an effectiveFrom equal to an existing element with different values, writing nothing', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    name: 'Collision District',
    externalId: 'area-collision-pcode',
    effectiveFrom: '2024-01-01'
  })

  await expect(
    client.administrativeAreas.update({
      id: created.id,
      name: 'Different Name',
      externalId: 'area-collision-pcode',
      status: 'active',
      effectiveFrom: '2024-01-01',
      lastVersionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('already exists')
  })

  const row = await getVersionsFromDb(created.id)
  expect(row.versions).toHaveLength(1)

  const auditEntries = await getUpdateAuditEntries()
  expect(auditEntries).toHaveLength(0)
})

test('rejects an effectiveFrom earlier than the latest version, writing nothing', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    name: 'Forward Only District',
    externalId: 'area-forward-only-pcode',
    effectiveFrom: '2024-06-01'
  })

  await expect(
    client.administrativeAreas.update({
      id: created.id,
      name: 'Past Splice',
      externalId: 'area-forward-only-pcode',
      status: 'active',
      effectiveFrom: '2024-01-01',
      lastVersionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({ code: 'UNPROCESSABLE_CONTENT' })

  const row = await getVersionsFromDb(created.id)
  expect(row.versions).toHaveLength(1)
})

test('rejects an unknown administrative area id', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  await expect(
    client.administrativeAreas.update({
      id: generateUuid(),
      name: 'Ghost District',
      externalId: 'area-ghost-pcode',
      status: 'active',
      lastVersionId: generateUuid()
    })
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('an identical replay appends nothing and audits only the first call', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    name: 'Replayed District',
    externalId: 'area-replay-pcode'
  })

  const payload = {
    id: created.id,
    name: 'Renamed District',
    externalId: 'area-replay-pcode',
    status: 'active' as const,
    effectiveFrom: '2025-01-01',
    lastVersionId: created.versions[0].versionId
  }

  const first = await client.administrativeAreas.update(payload)
  // The retry carries the same, now-stale lastVersionId — still accepted.
  const second = await client.administrativeAreas.update(payload)

  expect(second).toEqual(first)
  expect(second.versions).toHaveLength(2)

  const auditEntries = await getUpdateAuditEntries()
  expect(auditEntries).toHaveLength(1)
})

test('rejects a recode to an actively held externalId but allows a brand-new code', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  await createArea(client, {
    name: 'Holder District',
    externalId: 'area-held-pcode'
  })
  const recoded = await createArea(client, {
    name: 'Recoded District',
    externalId: 'area-old-pcode'
  })

  await expect(
    client.administrativeAreas.update({
      id: recoded.id,
      name: 'Recoded District',
      externalId: 'area-held-pcode',
      status: 'active',
      effectiveFrom: '2025-01-01',
      lastVersionId: recoded.versions[0].versionId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('area-held-pcode')
  })

  const updated = await client.administrativeAreas.update({
    id: recoded.id,
    name: 'Recoded District',
    externalId: 'area-brand-new-pcode',
    status: 'active',
    effectiveFrom: '2025-01-01',
    lastVersionId: recoded.versions[0].versionId
  })

  expect(updated.externalId).toBe('area-brand-new-pcode')
  expect(updated.versions).toHaveLength(2)
})

test('does not invalidate the leaf-level administrative area cache', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createArea(client, {
    name: 'Cache Stable District',
    externalId: 'area-cache-update-pcode'
  })

  const before = await getLeafLevelAdministrativeAreaIds()

  await client.administrativeAreas.update({
    id: created.id,
    name: 'Cache Stable District Renamed',
    externalId: 'area-cache-update-pcode',
    status: 'active',
    effectiveFrom: '2099-01-01',
    lastVersionId: created.versions[0].versionId
  })

  const after = await getLeafLevelAdministrativeAreaIds()
  expect(after).toBe(before)
})
