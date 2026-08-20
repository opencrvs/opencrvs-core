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
import { encodeScope, generateUuid } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { getLeafLevelAdministrativeAreaIds } from '@events/storage/postgres/administrative-hierarchy/locations'
import { setAdministrativeAreas } from '@events/service/administrative-areas'

const scope = encodeScope({ type: 'location.edit' })

// A cache hit resolves the same array instance every time; only a real clear
// produces a fresh one — so assert by reference, not content.

test('creating an administrative area invalidates the leaf-level cache', async () => {
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

test('bulk-setting administrative areas invalidates the leaf-level cache', async () => {
  await setupTestCase()

  const before = await getLeafLevelAdministrativeAreaIds()

  const [seededParent] = before
  const newAreaId = generateUuid()

  await setAdministrativeAreas([
    {
      id: newAreaId,
      name: 'Bulk Seeded Leaf Area',
      externalId: 'leaf-cache-bulk-set-pcode',
      parentId: seededParent.id
    }
  ])

  const after = await getLeafLevelAdministrativeAreaIds()

  expect(after).not.toBe(before)
  expect(after.map((row) => row.id)).toContain(newAreaId)
  // The area that used to be a leaf now has a child, so it must have dropped
  // out of the leaf set.
  expect(after.map((row) => row.id)).not.toContain(seededParent.id)
})

test('updating or withdrawing an administrative area version does not invalidate the leaf-level cache', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const created = await client.administrativeAreas.create({
    name: 'Stable District',
    externalId: 'leaf-cache-update-pcode',
    parentId: null,
    effectiveFrom: '2024-01-01',
    status: 'active'
  })

  const beforeUpdate = await getLeafLevelAdministrativeAreaIds()

  const updated = await client.administrativeAreas.update({
    id: created.id,
    name: 'Renamed District',
    externalId: 'leaf-cache-update-pcode',
    status: 'active',
    effectiveFrom: '2099-01-01',
    lastVersionId: created.versions[0].versionId
  })

  const afterUpdate = await getLeafLevelAdministrativeAreaIds()
  expect(afterUpdate).toBe(beforeUpdate)

  await client.administrativeAreas.withdrawVersion({
    id: created.id,
    versionId: updated.versions[1].versionId
  })

  const afterWithdraw = await getLeafLevelAdministrativeAreaIds()
  expect(afterWithdraw).toBe(beforeUpdate)
})

test('creating, updating or withdrawing a location version never invalidates the leaf-level cache', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const before = await getLeafLevelAdministrativeAreaIds()

  const created = await client.locations.create({
    name: 'Stable Office',
    externalId: 'leaf-cache-location-update-pcode',
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE',
    effectiveFrom: '2024-01-01',
    status: 'active'
  })

  const beforeUpdate = await getLeafLevelAdministrativeAreaIds()
  expect(beforeUpdate).toBe(before)

  const updated = await client.locations.update({
    id: created.id,
    name: 'Renamed Office',
    externalId: 'leaf-cache-location-update-pcode',
    status: 'active',
    effectiveFrom: '2099-01-01',
    lastVersionId: created.versions[0].versionId
  })

  const afterUpdate = await getLeafLevelAdministrativeAreaIds()
  expect(afterUpdate).toBe(beforeUpdate)

  await client.locations.withdrawVersion({
    id: created.id,
    versionId: updated.versions[1].versionId
  })

  const afterWithdraw = await getLeafLevelAdministrativeAreaIds()
  expect(afterWithdraw).toBe(beforeUpdate)
})
