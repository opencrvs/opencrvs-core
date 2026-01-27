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

test('prevents access when required scope is missing', async () => {
  const { user } = await setupTestCase()

  const registrarClient = createTestClient(user)

  await expect(
    registrarClient.administrativeAreas.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Allows setting administrative areas with USER_DATA_SEEDING scope', async () => {
  const { user, generator } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const administrativeAreaRng = createPrng(8423123)
  await expect(
    dataSeedingClient.administrativeAreas.set(
      generator.administrativeAreas.set(1, administrativeAreaRng)
    )
  ).resolves.toEqual(undefined)
})

test('Prevents sending empty payload', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  await expect(
    dataSeedingClient.administrativeAreas.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Creates single administrative area', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const initialAdministrativeAreas =
    await dataSeedingClient.administrativeAreas.list()
  const administrativeAreaPayload: AdministrativeArea[] = [
    {
      id: generateUuid(),
      parentId: null,
      name: 'New Administrative Area',
      validUntil: null,
      externalId: 'abc123xyz456'
    }
  ]

  await dataSeedingClient.administrativeAreas.set(administrativeAreaPayload)

  const administrativeAreas = await dataSeedingClient.administrativeAreas.list()

  expect(administrativeAreas).toHaveLength(
    initialAdministrativeAreas.length + 1
  )
  expect(administrativeAreas).toMatchObject(
    initialAdministrativeAreas.concat(administrativeAreaPayload)
  )
})

test('Creates multiple administrative areas under parent administrative area', async () => {
  const { user, generator, rng } = await setupTestCase()

  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const initialAdministrativeAreas =
    await dataSeedingClient.administrativeAreas.list()

  const administrativeAreaId = generateUuid(rng)

  const administrativeAreaPayload = generator.administrativeAreas.set(
    [
      { id: administrativeAreaId },
      { parentId: administrativeAreaId },
      { parentId: administrativeAreaId },
      {}
    ],
    rng
  )

  await dataSeedingClient.administrativeAreas.set(administrativeAreaPayload)

  const administrativeAreas = await dataSeedingClient.administrativeAreas.list()

  expect(administrativeAreas).toEqual(
    initialAdministrativeAreas.concat(administrativeAreaPayload)
  )
})

test('seeding administrative areas is additive, not destructive', async () => {
  const { user, generator } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const initialAdministrativeAreas =
    await dataSeedingClient.administrativeAreas.list()
  const administrativeAreaRng = createPrng(1236123)
  const initialPayload = generator.administrativeAreas.set(
    5,
    administrativeAreaRng
  )

  await dataSeedingClient.administrativeAreas.set(initialPayload)

  const administrativeAreasAfterInitialSeed =
    await dataSeedingClient.administrativeAreas.list()
  expect(administrativeAreasAfterInitialSeed).toHaveLength(
    initialAdministrativeAreas.length + initialPayload.length
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_removedAdministrativeArea, ...remainingAdministrativeAreasPayload] =
    initialPayload
  await dataSeedingClient.administrativeAreas.set(
    remainingAdministrativeAreasPayload
  )

  const remainingAdministrativeAreasAfterDeletion =
    await dataSeedingClient.administrativeAreas.list()
  expect(remainingAdministrativeAreasAfterDeletion).toStrictEqual(
    administrativeAreasAfterInitialSeed
  )
})
