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
import { TRPCError } from '@trpc/server'
import {
  AdministrativeArea,
  generateUuid,
  encodeScope
} from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

const scope = encodeScope({ type: 'user.data-seeding' })

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  // User missing required scope
  const registrarClient = createTestClient(user)

  const administrativeAreaPayload: AdministrativeArea = {
    id: generateUuid(),
    parentId: null,
    name: 'New Administrative Area',
    validUntil: null,
    externalId: null
  }

  await expect(
    registrarClient.administrativeAreas.upsert(administrativeAreaPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Allows national system admin to upsert an administrative area', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const administrativeAreaPayload: AdministrativeArea = {
    id: generateUuid(),
    parentId: null,
    name: 'New Administrative Area',
    validUntil: null,
    externalId: null
  }

  await expect(
    dataSeedingClient.administrativeAreas.upsert(administrativeAreaPayload)
  ).resolves.toEqual(undefined)
})

test('Creates a new administrative area', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const initialAdministrativeAreas =
    await dataSeedingClient.administrativeAreas.list()

  const administrativeAreaPayload: AdministrativeArea = {
    id: generateUuid(),
    parentId: null,
    name: 'New Administrative Area',
    validUntil: null,
    externalId: 'abc123xyz456'
  }

  await dataSeedingClient.administrativeAreas.upsert(administrativeAreaPayload)

  const administrativeAreas = await dataSeedingClient.administrativeAreas.list()

  expect(administrativeAreas).toHaveLength(
    initialAdministrativeAreas.length + 1
  )
  expect(administrativeAreas).toMatchObject(
    initialAdministrativeAreas.concat([administrativeAreaPayload])
  )
})

test('updates an existing administrative area when re-posted with the same id', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const areaId = generateUuid()

  await dataSeedingClient.administrativeAreas.upsert({
    id: areaId,
    parentId: null,
    name: 'Area without external id',
    validUntil: null,
    externalId: null
  })

  await dataSeedingClient.administrativeAreas.upsert({
    id: areaId,
    parentId: null,
    name: 'Area without external id',
    validUntil: null,
    externalId: 'adminpcode123'
  })

  const administrativeAreas = await dataSeedingClient.administrativeAreas.list()
  const updated = administrativeAreas.find((a) => a.id === areaId)

  expect(updated?.externalId).toBe('adminpcode123')
})
