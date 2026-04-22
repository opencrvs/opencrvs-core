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
  createInternalServiceToken,
  createInternalTestClient,
  createTestToken,
  setupTestCase,
  systemInitialisationTestSetup,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import { payloadGenerator } from '@events/tests/generators'

test('Returns 403 when accessed with user app token', async () => {
  const { user } = await setupTestCase()
  await systemInitialisationTestSetup()

  const appToken = createTestToken({
    userId: user.id,
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.user
  })
  const client = createInternalTestClient(appToken)

  await expect(
    client.initialisation.administrativeAreas.set([])
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

const administrativeAreaPayload: AdministrativeArea[] = [
  {
    id: generateUuid(),
    parentId: null,
    name: 'New Administrative Area',
    validUntil: null,
    externalId: 'abc123xyz456'
  }
]

test('Returns 403 when accessed with system app token', async () => {
  const systemToken = createTestToken({
    userId: 'test-system',
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.system
  })

  await systemInitialisationTestSetup()

  const client = createInternalTestClient(systemToken)

  await expect(
    client.initialisation.administrativeAreas.set(administrativeAreaPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 403 when accessed with internal token using invalid subject', async () => {
  const internalToken = createInternalServiceToken({
    subject: 'invalid-subject'
  })
  await systemInitialisationTestSetup()

  const client = createInternalTestClient(internalToken)

  await expect(
    client.initialisation.administrativeAreas.set(administrativeAreaPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Prevents sending empty payload', async () => {
  const client = createInternalTestClient()

  await expect(
    client.initialisation.administrativeAreas.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Creates single administrative area', async () => {
  const client = createInternalTestClient()

  await client.initialisation.administrativeAreas.set(administrativeAreaPayload)

  const eventsDb = getClient()

  const administrativeAreas = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(administrativeAreas).toHaveLength(1)
  expect(administrativeAreas[0]).toMatchObject(administrativeAreaPayload[0])
})

test('Creates multiple administrative areas under parent administrative area', async () => {
  const client = createInternalTestClient()

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

  await client.initialisation.administrativeAreas.set(payload)

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
  const client = createInternalTestClient()

  const areaId = generateUuid()
  const eventsDb = getClient()

  await client.initialisation.administrativeAreas.set([
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

  await client.initialisation.administrativeAreas.set([
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
  const client = createInternalTestClient()

  const eventsDb = getClient()

  const administrativeAreaRng = createPrng(1236123)
  const generator = payloadGenerator(administrativeAreaRng)

  const initialPayload = generator.administrativeAreas.set(
    5,
    administrativeAreaRng
  )

  await client.initialisation.administrativeAreas.set(initialPayload)

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
  await client.initialisation.administrativeAreas.set(
    remainingAdministrativeAreasPayload
  )

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
