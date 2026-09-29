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
/* eslint-disable max-lines */
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

async function createLocation(
  client: ReturnType<typeof createTestClient>,
  overrides: { name?: string; externalId?: string; effectiveFrom?: string } = {}
) {
  return client.locations.create({
    name: overrides.name ?? 'Original Office',
    externalId: overrides.externalId ?? 'update-test-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE',
    effectiveFrom: overrides.effectiveFrom ?? '2024-01-01',
    status: 'active'
  })
}

async function getVersionsFromDb(locationId: UUID) {
  const row = await getClient()
    .selectFrom('locations')
    .select(['name', 'versions'])
    .where('id', '=', locationId)
    .executeTakeFirstOrThrow()

  return row
}

async function getUpdateAuditEntries() {
  return getClient()
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'locations.update')
    .execute()
}

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  // User missing required scope
  const registrarClient = createTestClient(user)

  await expect(
    registrarClient.locations.update({
      id: generateUuid(),
      name: 'Forbidden Rename',
      externalId: 'forbidden-update-pcode',
      status: 'active',
      lastVersionId: generateUuid()
    })
  ).rejects.toThrow('FORBIDDEN')
})

test('appends a rename version, keeps prior elements and the legacy name column intact, and writes an audit diff', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Old Name',
    externalId: 'rename-pcode'
  })

  const updated = await client.locations.update({
    id: created.id,
    name: 'New Name',
    externalId: 'rename-pcode',
    status: 'active',
    effectiveFrom: '2025-01-01',
    lastVersionId: created.versions[0].versionId
  })

  // Exactly one appended element; the prior element is untouched.
  expect(updated.versions).toEqual([
    created.versions[0],
    {
      versionId: expect.stringMatching(UUID_REGEX),
      effectiveFrom: '2025-01-01',
      name: 'New Name',
      externalId: 'rename-pcode',
      status: 'active'
    }
  ])

  // The flat read-model fields resolve from the new version.
  expect(updated.name).toBe('New Name')
  expect(updated.externalId).toBe('rename-pcode')
  expect(updated.status).toBe('active')

  // The legacy name column stays frozen at the creation value.
  const row = await getVersionsFromDb(created.id)
  expect(row.name).toBe('Old Name')

  const auditEntries = await getUpdateAuditEntries()
  expect(auditEntries).toHaveLength(1)
  expect(auditEntries[0].clientId).toBe(user.id)
  expect(auditEntries[0].clientType).toBe(TokenUserType.enum.user)
  expect(auditEntries[0].requestData).toEqual({
    id: created.id,
    versionId: updated.versions[1].versionId,
    name: 'New Name',
    externalId: 'rename-pcode',
    status: 'active',
    effectiveFrom: '2025-01-01',
    lastVersionId: created.versions[0].versionId
  })
  expect(auditEntries[0].responseSummary).toEqual({
    previousVersionId: created.versions[0].versionId,
    versionId: updated.versions[1].versionId,
    changed: { name: { from: 'Old Name', to: 'New Name' } }
  })
})

test('inactivation drops the location from the active list but keeps it in the unfiltered list', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Closing Office',
    externalId: 'inactivate-pcode'
  })

  await client.locations.update({
    id: created.id,
    name: 'Closing Office',
    externalId: 'inactivate-pcode',
    status: 'inactive',
    effectiveFrom: '2025-01-01',
    lastVersionId: created.versions[0].versionId
  })

  const activeLocations = await client.locations.list({ isActive: true })
  expect(activeLocations.find((l) => l.id === created.id)).toBeUndefined()

  const allLocations = await client.locations.list()
  expect(allLocations.find((l) => l.id === created.id)).toMatchObject({
    id: created.id,
    status: 'inactive'
  })
})

test('rejects a payload missing a required field', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    externalId: 'missing-name-pcode'
  })

  await expect(
    // @ts-expect-error - deliberately omitting the required `name`
    client.locations.update({
      id: created.id,
      externalId: 'missing-name-pcode',
      status: 'active',
      lastVersionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
})

test('rejects a payload carrying the immutable administrativeAreaId', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    externalId: 'strict-schema-pcode'
  })

  await expect(
    client.locations.update({
      id: created.id,
      name: 'Strict Schema Office',
      externalId: 'strict-schema-pcode',
      status: 'active',
      lastVersionId: created.versions[0].versionId,
      // @ts-expect-error - identity fields are rejected by the strict schema
      administrativeAreaId: null
    })
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
})

test('rejects an effectiveFrom equal to an existing element with different values, writing nothing', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Collision Office',
    externalId: 'collision-pcode',
    effectiveFrom: '2024-01-01'
  })

  await expect(
    client.locations.update({
      id: created.id,
      name: 'Different Name',
      externalId: 'collision-pcode',
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

  const created = await createLocation(client, {
    name: 'Forward Only Office',
    externalId: 'forward-only-pcode',
    effectiveFrom: '2024-06-01'
  })

  await expect(
    client.locations.update({
      id: created.id,
      name: 'Past Splice',
      externalId: 'forward-only-pcode',
      status: 'active',
      effectiveFrom: '2024-01-01',
      lastVersionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({ code: 'UNPROCESSABLE_CONTENT' })

  const row = await getVersionsFromDb(created.id)
  expect(row.versions).toHaveLength(1)

  const auditEntries = await getUpdateAuditEntries()
  expect(auditEntries).toHaveLength(0)
})

test('rejects a stale lastVersionId, writing nothing', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Stale Token Office',
    externalId: 'stale-token-pcode'
  })

  const updated = await client.locations.update({
    id: created.id,
    name: 'Renamed Once',
    externalId: 'stale-token-pcode',
    status: 'active',
    effectiveFrom: '2025-01-01',
    lastVersionId: created.versions[0].versionId
  })

  // Second update presents the original, now-stale version token.
  await expect(
    client.locations.update({
      id: created.id,
      name: 'Renamed Twice',
      externalId: 'stale-token-pcode',
      status: 'active',
      effectiveFrom: '2025-06-01',
      lastVersionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('refresh and retry')
  })

  const row = await getVersionsFromDb(created.id)
  expect(row.versions).toHaveLength(2)
  expect(updated.versions).toHaveLength(2)
})

test('rejects an unknown location id', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  await expect(
    client.locations.update({
      id: generateUuid(),
      name: 'Ghost Office',
      externalId: 'ghost-pcode',
      status: 'active',
      lastVersionId: generateUuid()
    })
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('an identical replay appends nothing and audits only the first call', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Replayed Office',
    externalId: 'replay-update-pcode'
  })

  const payload = {
    id: created.id,
    name: 'Renamed Office',
    externalId: 'replay-update-pcode',
    status: 'active' as const,
    effectiveFrom: '2025-01-01',
    lastVersionId: created.versions[0].versionId
  }

  const first = await client.locations.update(payload)
  // The retry carries the same, now-stale lastVersionId — still accepted.
  const second = await client.locations.update(payload)

  expect(second).toEqual(first)
  expect(second.versions).toHaveLength(2)

  const row = await getVersionsFromDb(created.id)
  expect(row.versions).toHaveLength(2)

  const auditEntries = await getUpdateAuditEntries()
  expect(auditEntries).toHaveLength(1)
})

test('rejects a recode to an actively held externalId but allows a brand-new code', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const holder = await createLocation(client, {
    name: 'Holder Office',
    externalId: 'held-pcode'
  })
  const recoded = await createLocation(client, {
    name: 'Recoded Office',
    externalId: 'old-pcode'
  })

  await expect(
    client.locations.update({
      id: recoded.id,
      name: 'Recoded Office',
      externalId: 'held-pcode',
      status: 'active',
      effectiveFrom: '2025-01-01',
      lastVersionId: recoded.versions[0].versionId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('held-pcode')
  })

  expect(holder.externalId).toBe('held-pcode')

  const updated = await client.locations.update({
    id: recoded.id,
    name: 'Recoded Office',
    externalId: 'brand-new-pcode',
    status: 'active',
    effectiveFrom: '2025-01-01',
    lastVersionId: recoded.versions[0].versionId
  })

  expect(updated.externalId).toBe('brand-new-pcode')
  expect(updated.versions).toHaveLength(2)
})

test('rejects an update to a soft-deleted location', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Soft Deleted Office',
    externalId: 'soft-deleted-pcode'
  })

  await getClient()
    .updateTable('locations')
    .set({ deletedAt: new Date().toISOString() })
    .where('id', '=', created.id)
    .execute()

  await expect(
    client.locations.update({
      id: created.id,
      name: 'Ghost Rename',
      externalId: 'soft-deleted-pcode',
      status: 'active',
      lastVersionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('allows recoding to a code whose previous holder is inactive from that date', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  // The predecessor actively holds the code, then closes on 2025-01-01.
  const predecessor = await createLocation(client, {
    name: 'Predecessor Office',
    externalId: 'handover-pcode'
  })
  await client.locations.update({
    id: predecessor.id,
    name: 'Predecessor Office',
    externalId: 'handover-pcode',
    status: 'inactive',
    effectiveFrom: '2025-01-01',
    lastVersionId: predecessor.versions[0].versionId
  })

  // The successor takes the code over from the same date — allowed, because
  // no location actively holds it from 2025-01-01 onward.
  const successor = await createLocation(client, {
    name: 'Successor Office',
    externalId: 'successor-own-pcode'
  })
  const recoded = await client.locations.update({
    id: successor.id,
    name: 'Successor Office',
    externalId: 'handover-pcode',
    status: 'active',
    effectiveFrom: '2025-01-01',
    lastVersionId: successor.versions[0].versionId
  })

  expect(recoded.externalId).toBe('handover-pcode')
})

test('audits externalId and status changes in the diff', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Diff Office',
    externalId: 'diff-old-pcode'
  })

  // One update that recodes AND inactivates — both must appear in the diff.
  await client.locations.update({
    id: created.id,
    name: 'Diff Office',
    externalId: 'diff-new-pcode',
    status: 'inactive',
    effectiveFrom: '2025-01-01',
    lastVersionId: created.versions[0].versionId
  })

  const auditEntries = await getUpdateAuditEntries()
  expect(auditEntries).toHaveLength(1)
  expect(auditEntries[0].responseSummary).toMatchObject({
    changed: {
      externalId: { from: 'diff-old-pcode', to: 'diff-new-pcode' },
      status: { from: 'active', to: 'inactive' }
    }
  })
  // The unchanged name must not appear in the diff.
  expect(
    (auditEntries[0].responseSummary as { changed: object }).changed
  ).not.toHaveProperty('name')
})

test('an omitted effectiveFrom defaults to today', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Default Date Office',
    externalId: 'default-date-pcode'
  })

  const updated = await client.locations.update({
    id: created.id,
    name: 'Renamed Today',
    externalId: 'default-date-pcode',
    status: 'active',
    lastVersionId: created.versions[0].versionId
  })

  const today = new Date().toISOString().slice(0, 10)
  expect(updated.versions[1].effectiveFrom).toBe(today)
  expect(updated.name).toBe('Renamed Today')
})

test('a future-dated rename is stored but does not drive the flat fields yet', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Present Name',
    externalId: 'future-rename-update-pcode'
  })

  const updated = await client.locations.update({
    id: created.id,
    name: 'Future Name',
    externalId: 'future-rename-update-pcode',
    status: 'active',
    effectiveFrom: '2099-01-01',
    lastVersionId: created.versions[0].versionId
  })

  expect(updated.versions).toHaveLength(2)
  expect(updated.versions[1]).toMatchObject({
    effectiveFrom: '2099-01-01',
    name: 'Future Name'
  })
  // The version in effect today still drives the read model.
  expect(updated.name).toBe('Present Name')
})

test('a new request matching an OLD version must not be mistaken for a retry', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  // History: "Old Name" from 2024-01-01, then renamed to "New Name" in 2025.
  const created = await createLocation(client, {
    name: 'Old Name',
    externalId: 'replay-lie-pcode',
    effectiveFrom: '2024-01-01'
  })
  const renamed = await client.locations.update({
    id: created.id,
    name: 'New Name',
    externalId: 'replay-lie-pcode',
    status: 'active',
    effectiveFrom: '2025-01-01',
    lastVersionId: created.versions[0].versionId
  })

  // A brand-new request (fresh lastVersionId, so NOT a retry) that happens to
  // match the old 2024 element exactly. Its date collides with an existing
  // version, so it must be rejected — not silently reported as "already done".
  await expect(
    client.locations.update({
      id: created.id,
      name: 'Old Name',
      externalId: 'replay-lie-pcode',
      status: 'active',
      effectiveFrom: '2024-01-01',
      lastVersionId: renamed.versions[1].versionId
    })
  ).rejects.toMatchObject({ code: 'CONFLICT' })

  // And the location must still resolve to the current name.
  const after = await client.locations.list()
  expect(after.find((l) => l.id === created.id)?.name).toBe('New Name')
})

test('rejects a client-supplied versionId that already names an existing version', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Duplicate Id Office',
    externalId: 'duplicate-version-id-pcode'
  })

  await expect(
    client.locations.update({
      id: created.id,
      // Reuses the initial element's versionId — every element must be
      // uniquely addressable (withdraw targets elements by versionId).
      versionId: created.versions[0].versionId,
      name: 'Renamed Office',
      externalId: 'duplicate-version-id-pcode',
      status: 'active',
      effectiveFrom: '2025-01-01',
      lastVersionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('versionId')
  })

  const row = await getVersionsFromDb(created.id)
  expect(row.versions).toHaveLength(1)
})

test('does not invalidate the leaf-level administrative area cache', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Cache Stable Office',
    externalId: 'location-cache-update-pcode'
  })

  const before = await getLeafLevelAdministrativeAreaIds()

  await client.locations.update({
    id: created.id,
    name: 'Cache Stable Office Renamed',
    externalId: 'location-cache-update-pcode',
    status: 'active',
    effectiveFrom: '2099-01-01',
    lastVersionId: created.versions[0].versionId
  })

  const after = await getLeafLevelAdministrativeAreaIds()
  expect(after).toBe(before)
})
