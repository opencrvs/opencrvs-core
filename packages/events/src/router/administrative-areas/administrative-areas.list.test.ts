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
import {
  SetAdministrativeAreaPayload,
  createPrng,
  generateUuid,
  encodeScope
} from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'

const scope = encodeScope({ type: 'user.data-seeding' })

test('Returns new administrative area after it has been added', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const initialAdministrativeAreas = await client.administrativeAreas.list()

  const setAdministrativeAreaPayload: SetAdministrativeAreaPayload[] = [
    {
      id: generateUuid(() => 0.1235),
      parentId: null,
      name: 'New Administrative Area',
      externalId: generateUuid(() => 0.1231)
    }
  ]

  await client.administrativeAreas.set(setAdministrativeAreaPayload)
  const administrativeAreas = await client.administrativeAreas.list()

  expect(administrativeAreas).toHaveLength(
    initialAdministrativeAreas.length + 1
  )
  expect(administrativeAreas).toMatchObject([
    ...initialAdministrativeAreas,
    ...setAdministrativeAreaPayload
  ])
})

test('Returns multiple administrative areas', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const initialAdministrativeAreas = await client.administrativeAreas.list()
  const administratieAreaRng = createPrng(12312312)
  await client.administrativeAreas.set(
    generator.administrativeAreas.set(5, administratieAreaRng)
  )

  const administrativeAreas = await client.administrativeAreas.list()

  expect(administrativeAreas).toHaveLength(
    initialAdministrativeAreas.length + 5
  )
})

test('Filters administrative areas by ids', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const initialAdministrativeAreas = await client.administrativeAreas.list()

  const id = initialAdministrativeAreas[0].id

  const administrativeAreas = await client.administrativeAreas.list({
    ids: [id]
  })

  expect(administrativeAreas).toHaveLength(1)

  expect(administrativeAreas[0].id).toBe(id)
})

test('Returns the full versions array and resolves flat fields from the current version', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const areaId = generateUuid()

  await client.administrativeAreas.set([
    {
      id: areaId,
      parentId: null,
      name: 'Old District',
      externalId: 'renamed-district-pcode'
    }
  ])

  // A past-dated rename: this version is in effect today.
  await getClient()
    .updateTable('administrativeAreas')
    .set({
      versions: sql`versions || ${JSON.stringify([
        {
          versionId: generateUuid(() => 0.5678),
          effectiveFrom: '2010-06-30',
          name: 'New District',
          externalId: 'renamed-district-pcode',
          status: 'active'
        }
      ])}::jsonb`
    })
    .where('id', '=', areaId)
    .execute()

  const areas = await client.administrativeAreas.list()
  const area = areas.find((a) => a.id === areaId)

  expect(area).toMatchObject({
    name: 'New District',
    status: 'active'
  })
  expect(area?.versions.map((v) => v.name)).toEqual([
    'Old District',
    'New District'
  ])
})

test('Filters administrative areas by active status', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [scope])

  const initialAdministrativeAreas = await client.administrativeAreas.list()

  expect(initialAdministrativeAreas.length).toBe(5)

  const administrativeAreaIdToUpdate = initialAdministrativeAreas[0].id

  // Inactivation is expressed as a version element with status 'inactive',
  // appended here directly in the database.
  const inactiveVersion = JSON.stringify([
    {
      versionId: generateUuid(() => 0.4321),
      effectiveFrom: '2000-01-01',
      name: 'Inactivated area',
      externalId: null,
      status: 'inactive'
    }
  ])

  await getClient()
    .updateTable('administrativeAreas')
    .set({ versions: sql`versions || ${inactiveVersion}::jsonb` })
    .where('id', '=', administrativeAreaIdToUpdate)
    .execute()

  const administrativeAreas = await client.administrativeAreas.list({
    isActive: true
  })

  expect(administrativeAreas.length).toBe(initialAdministrativeAreas.length - 1)

  expect(
    administrativeAreas.find((aa) => aa.id === administrativeAreaIdToUpdate)
  ).toBeUndefined()
})
