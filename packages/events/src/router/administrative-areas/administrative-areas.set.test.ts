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
  SetAdministrativeAreaPayload,
  createPrng,
  generateUuid,
  encodeScope
} from '@opencrvs/commons'
import {
  createTestClient,
  setupTestCase,
  UUID_REGEX
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'

const scope = encodeScope({ type: 'user.data-seeding' })

test('prevents access when required scope is missing', async () => {
  const { user } = await setupTestCase()

  const registrarClient = createTestClient(user)

  await expect(
    registrarClient.administrativeAreas.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Allows setting administrative areas with data seeding scope', async () => {
  const { user, generator } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const administrativeAreaRng = createPrng(8423123)
  await expect(
    dataSeedingClient.administrativeAreas.set(
      generator.administrativeAreas.set(1, administrativeAreaRng)
    )
  ).resolves.toEqual(undefined)
})

test('Prevents sending empty payload', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  await expect(
    dataSeedingClient.administrativeAreas.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Creates single administrative area', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const initialAdministrativeAreas =
    await dataSeedingClient.administrativeAreas.list()
  const administrativeAreaPayload: SetAdministrativeAreaPayload[] = [
    {
      id: generateUuid(),
      parentId: null,
      name: 'New Administrative Area',
      externalId: 'abc123xyz456'
    }
  ]

  await dataSeedingClient.administrativeAreas.set(administrativeAreaPayload)

  const administrativeAreas = await dataSeedingClient.administrativeAreas.list()

  expect(administrativeAreas).toHaveLength(
    initialAdministrativeAreas.length + 1
  )
  expect(administrativeAreas).toMatchObject([
    ...initialAdministrativeAreas,
    ...administrativeAreaPayload
  ])
})

test('Creates multiple administrative areas under parent administrative area', async () => {
  const { user, generator, rng } = await setupTestCase()

  const dataSeedingClient = createTestClient(user, [scope])

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

  expect(administrativeAreas).toMatchObject([
    ...initialAdministrativeAreas,
    ...administrativeAreaPayload
  ])
})

test('updates externalId on existing administrative area when re-seeded with a value', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const areaId = generateUuid()

  await dataSeedingClient.administrativeAreas.set([
    {
      id: areaId,
      parentId: null,
      name: 'Area without external id',
      externalId: null
    }
  ])

  await dataSeedingClient.administrativeAreas.set([
    {
      id: areaId,
      parentId: null,
      name: 'Area without external id',
      externalId: 'adminpcode123'
    }
  ])

  // The read API resolves externalId from the versions array, which
  // re-seeding deliberately leaves untouched — assert on the flat column
  // that the upsert updates.
  const updated = await getClient()
    .selectFrom('administrativeAreas')
    .select('externalId')
    .where('id', '=', areaId)
    .executeTakeFirstOrThrow()

  expect(updated.externalId).toBe('adminpcode123')
})

test('stores a single active initial version when creating an administrative area', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const areaId = generateUuid()

  await dataSeedingClient.administrativeAreas.set([
    {
      id: areaId,
      parentId: null,
      name: 'Versioned administrative area',
      externalId: 'versioned-area-pcode'
    }
  ])

  const { versions } = await getClient()
    .selectFrom('administrativeAreas')
    .select('versions')
    .where('id', '=', areaId)
    .executeTakeFirstOrThrow()

  // toEqual matches keys exactly, so this also asserts the version element
  // contains no parent reference (parentId).
  expect(versions).toEqual([
    {
      versionId: expect.stringMatching(UUID_REGEX),
      effectiveFrom: '0001-01-01',
      name: 'Versioned administrative area',
      externalId: 'versioned-area-pcode',
      status: 'active'
    }
  ])
})

test('seeding administrative areas is additive, not destructive', async () => {
  const { user, generator } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

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
