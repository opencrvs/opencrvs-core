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
  AdministrativeArea,
  createPrng,
  generateUuid,
  SCOPES
} from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

test('Returns new administrative area after it has been added', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const initialAdministrativeAreas = await client.administrativeAreas.list()

  const setAdministrativeAreaPayload: AdministrativeArea[] = [
    {
      id: generateUuid(() => 0.1235),
      parentId: null,
      name: 'New Administrative Area',
      validUntil: null,
      externalId: generateUuid(() => 0.1231)
    }
  ]

  await client.administrativeAreas.set(setAdministrativeAreaPayload)
  const administrativeAreas = await client.administrativeAreas.list()

  expect(administrativeAreas).toHaveLength(
    initialAdministrativeAreas.length + 1
  )
  expect(administrativeAreas).toMatchObject(
    initialAdministrativeAreas.concat(setAdministrativeAreaPayload)
  )
})

test('Returns multiple administrative areas', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

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
  const client = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const initialAdministrativeAreas = await client.administrativeAreas.list()

  const id = initialAdministrativeAreas[0].id

  const administrativeAreas = await client.administrativeAreas.list({
    ids: [id]
  })

  expect(administrativeAreas).toHaveLength(1)

  expect(administrativeAreas[0].id).toBe(id)
})

test('Filters administrative areas by active status', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const initialAdministrativeAreas = await client.administrativeAreas.list()

  expect(initialAdministrativeAreas.length).toBe(5)

  const administrativeAreaIdToUpdate = initialAdministrativeAreas[0].id
  const setAdministrativeAreaPayload: AdministrativeArea[] = [
    {
      id: administrativeAreaIdToUpdate,
      parentId: null,
      name: 'not valid Administrative Area',
      validUntil: new Date('2000-01-01T00:00:00Z').toISOString(),
      externalId: generateUuid(() => 0.1231)
    }
  ]

  await client.administrativeAreas.set(setAdministrativeAreaPayload)

  const administrativeAreas = await client.administrativeAreas.list({
    isActive: true
  })

  expect(administrativeAreas.length).toBe(initialAdministrativeAreas.length - 1)

  expect(
    administrativeAreas.find((aa) => aa.id === administrativeAreaIdToUpdate)
  ).toBeUndefined()
})
