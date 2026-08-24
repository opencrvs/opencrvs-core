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
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import { getLeafLevelAdministrativeAreaIds } from '@events/storage/postgres/administrative-hierarchy/locations'

const scope = encodeScope({ type: 'location.edit' })

async function createLocation(
  client: ReturnType<typeof createTestClient>,
  overrides: { name?: string; externalId?: string; effectiveFrom?: string } = {}
) {
  return client.locations.create({
    name: overrides.name ?? 'Original Office',
    externalId: overrides.externalId ?? 'withdraw-test-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE',
    effectiveFrom: overrides.effectiveFrom ?? '2024-01-01',
    status: 'active'
  })
}

async function getVersionsFromDb(locationId: UUID) {
  const row = await getClient()
    .selectFrom('locations')
    .select(['versions'])
    .where('id', '=', locationId)
    .executeTakeFirstOrThrow()

  return row.versions
}

async function getWithdrawAuditEntries() {
  return getClient()
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'locations.withdrawVersion')
    .execute()
}

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  const registrarClient = createTestClient(user)

  await expect(
    registrarClient.locations.withdrawVersion({
      id: generateUuid(),
      versionId: generateUuid()
    })
  ).rejects.toThrow('FORBIDDEN')
})

test('withdraws a pending future version and writes an audit entry', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Future Rename Office',
    externalId: 'withdraw-happy-pcode'
  })

  const updated = await client.locations.update({
    id: created.id,
    name: 'Future Name',
    externalId: 'withdraw-happy-pcode',
    status: 'active',
    effectiveFrom: '2099-01-01',
    lastVersionId: created.versions[0].versionId
  })

  const pendingVersionId = updated.versions[1].versionId

  const result = await client.locations.withdrawVersion({
    id: created.id,
    versionId: pendingVersionId
  })

  // The pending element is gone; the original (current) element remains.
  expect(result.versions).toEqual([created.versions[0]])
  expect(result.name).toBe('Future Rename Office')

  const versionsInDb = await getVersionsFromDb(created.id)
  expect(versionsInDb).toHaveLength(1)

  const auditEntries = await getWithdrawAuditEntries()
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
    externalId: 'withdraw-happy-pcode',
    status: 'active'
  })
})

test('rejects withdrawing an already-effective version that is also the only version — the only-version check wins', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Already Effective Office',
    externalId: 'withdraw-past-pcode'
  })

  await expect(
    client.locations.withdrawVersion({
      id: created.id,
      // The initial (creation) element is already in effect — 2024-01-01 —
      // but it is also the only version, and that check takes precedence.
      versionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('only one version')
  })

  const versionsInDb = await getVersionsFromDb(created.id)
  expect(versionsInDb).toHaveLength(1)

  const auditEntries = await getWithdrawAuditEntries()
  expect(auditEntries).toHaveLength(0)
})

test('rejects withdrawing the only version a location has', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Single Version Office',
    externalId: 'withdraw-only-version-pcode',
    effectiveFrom: '2099-01-01'
  })

  await expect(
    client.locations.withdrawVersion({
      id: created.id,
      versionId: created.versions[0].versionId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('only one version')
  })

  const versionsInDb = await getVersionsFromDb(created.id)
  expect(versionsInDb).toHaveLength(1)

  const auditEntries = await getWithdrawAuditEntries()
  expect(auditEntries).toHaveLength(0)
})

test('rejects withdrawing an already-effective INACTIVE version too — the check is date-based, not status-based', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Closed Office',
    externalId: 'withdraw-past-inactive-pcode'
  })

  const inactivated = await client.locations.update({
    id: created.id,
    name: 'Closed Office',
    externalId: 'withdraw-past-inactive-pcode',
    status: 'inactive',
    effectiveFrom: '2024-06-01',
    lastVersionId: created.versions[0].versionId
  })
  const pastInactiveVersionId = inactivated.versions[1].versionId

  await expect(
    client.locations.withdrawVersion({
      id: created.id,
      versionId: pastInactiveVersionId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('already in effect')
  })

  const versionsInDb = await getVersionsFromDb(created.id)
  expect(versionsInDb).toHaveLength(2)

  const auditEntries = await getWithdrawAuditEntries()
  expect(auditEntries).toHaveLength(0)
})

test('rejects an unknown location id', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  await expect(
    client.locations.withdrawVersion({
      id: generateUuid(),
      versionId: generateUuid()
    })
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('rejects an unknown versionId on an existing location', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'No Such Version Office',
    externalId: 'withdraw-unknown-version-pcode'
  })

  await expect(
    client.locations.withdrawVersion({
      id: created.id,
      versionId: generateUuid()
    })
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('a second withdrawal of the same version is rejected', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Double Withdraw Office',
    externalId: 'withdraw-twice-pcode'
  })

  const updated = await client.locations.update({
    id: created.id,
    name: 'Pending Name',
    externalId: 'withdraw-twice-pcode',
    status: 'active',
    effectiveFrom: '2099-01-01',
    lastVersionId: created.versions[0].versionId
  })
  const pendingVersionId = updated.versions[1].versionId

  await client.locations.withdrawVersion({
    id: created.id,
    versionId: pendingVersionId
  })

  await expect(
    client.locations.withdrawVersion({
      id: created.id,
      versionId: pendingVersionId
    })
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })

  const auditEntries = await getWithdrawAuditEntries()
  expect(auditEntries).toHaveLength(1)
})

test('does not invalidate the leaf-level administrative area cache', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await createLocation(client, {
    name: 'Cache Stable Withdraw Office',
    externalId: 'location-cache-withdraw-pcode'
  })

  const updated = await client.locations.update({
    id: created.id,
    name: 'Pending Rename',
    externalId: 'location-cache-withdraw-pcode',
    status: 'active',
    effectiveFrom: '2099-01-01',
    lastVersionId: created.versions[0].versionId
  })

  const before = await getLeafLevelAdministrativeAreaIds()

  await client.locations.withdrawVersion({
    id: created.id,
    versionId: updated.versions[1].versionId
  })

  const after = await getLeafLevelAdministrativeAreaIds()
  expect(after).toBe(before)
})
