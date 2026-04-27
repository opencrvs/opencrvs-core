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
  createPrng,
  generateUuid,
  TokenUserType
} from '@opencrvs/commons'
import {
  createInitialisationTestClient,
  createTestToken,
  setupTestCase,
  systemInitialisationTestSetup,
  TEST_USER_DEFAULT_SCOPES,
  createInitialisationToken
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import { payloadGenerator } from '@events/tests/generators'

const administrativeAreaPayload: AdministrativeArea[] = [
  {
    id: generateUuid(),
    parentId: null,
    name: 'New Administrative Area',
    validUntil: null,
    externalId: 'abc123xyz456'
  }
]

test('Returns 403 after initialisation is completed', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()
  await expect(client.complete()).resolves.toBeUndefined()

  await expect(
    client.administrativeAreas.set(administrativeAreaPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 403 when accessed with user app token', async () => {
  await systemInitialisationTestSetup()
  const { user } = await setupTestCase()

  const appToken = createTestToken({
    userId: user.id,
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.user
  })
  const client = createInitialisationTestClient(appToken)

  await expect(client.administrativeAreas.set([])).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('Returns 403 when accessed with system app token', async () => {
  await systemInitialisationTestSetup()
  const systemToken = createTestToken({
    userId: 'test-system',
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.system
  })

  const client = createInitialisationTestClient(systemToken)

  await expect(
    client.administrativeAreas.set(administrativeAreaPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 403 when accessed with internal token using invalid subject', async () => {
  await systemInitialisationTestSetup()
  const internalToken = createInitialisationToken({
    subject: 'invalid-subject'
  })

  const client = createInitialisationTestClient(internalToken)

  await expect(
    client.administrativeAreas.set(administrativeAreaPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Prevents sending empty payload', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  await expect(
    client.administrativeAreas.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Creates single administrative area', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  await client.administrativeAreas.set(administrativeAreaPayload)

  const eventsDb = getClient()

  const administrativeAreas = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(administrativeAreas).toHaveLength(1)
  expect(administrativeAreas[0]).toMatchObject(administrativeAreaPayload[0])
})

test('Creates multiple administrative areas under parent administrative area', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const rng = createPrng(123123)
  const parentAdministrativeAreaId = generateUuid(rng)

  const payload = payloadGenerator(rng).administrativeAreas.set(
    [
      { id: parentAdministrativeAreaId },
      { parentId: parentAdministrativeAreaId },
      { parentId: parentAdministrativeAreaId },
      {}
    ],
    rng
  )

  await client.administrativeAreas.set(payload)

  const eventsDb = getClient()
  const administrativeAreas = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(administrativeAreas).toHaveLength(payload.length)

  for (const administrativeArea of payload) {
    const found = administrativeAreas.find(
      (a) => a.id === administrativeArea.id
    )
    expect(found).toBeDefined()
    expect(found).toMatchObject(administrativeArea)
  }
})

test('updates externalId on existing administrative area when re-seeded with a value', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const areaId = generateUuid()
  const eventsDb = getClient()

  await client.administrativeAreas.set([
    {
      id: areaId,
      parentId: null,
      name: 'Area without external id',
      validUntil: null,
      externalId: null
    }
  ])

  const areasBeforeUpdate = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(areasBeforeUpdate).toHaveLength(1)

  await client.administrativeAreas.set([
    {
      id: areaId,
      parentId: null,
      name: 'Area without external id',
      validUntil: null,
      externalId: 'adminpcode123'
    }
  ])

  const areasAfterUpdate = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(areasAfterUpdate).toHaveLength(1)

  const updated = areasAfterUpdate.find((a) => a.id === areaId)

  expect(updated?.externalId).toBe('adminpcode123')
})

test('seeding administrative areas is additive, not destructive', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const eventsDb = getClient()

  const administrativeAreaRng = createPrng(1236123)
  const generator = payloadGenerator(administrativeAreaRng)

  const initialPayload = generator.administrativeAreas.set(
    5,
    administrativeAreaRng
  )

  await client.administrativeAreas.set(initialPayload)

  const administrativeAreasAfterInitialSeed = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(administrativeAreasAfterInitialSeed).toHaveLength(
    initialPayload.length
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_removedAdministrativeArea, ...remainingAdministrativeAreasPayload] =
    initialPayload
  await client.administrativeAreas.set(remainingAdministrativeAreasPayload)

  const administrativeAreasAferOmittingOne = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(administrativeAreasAferOmittingOne).toHaveLength(
    administrativeAreasAfterInitialSeed.length
  )

  for (const remainingArea of administrativeAreasAferOmittingOne) {
    const found = administrativeAreasAfterInitialSeed.find(
      (a) => a.id === remainingArea.id
    )
    expect(found).toBeDefined()
    expect(remainingArea).toMatchObject({
      ...found,
      updatedAt: expect.any(String)
    })
  }
})
