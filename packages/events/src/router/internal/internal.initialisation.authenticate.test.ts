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
import { TokenUserType } from '@opencrvs/commons'
import {
  createInitialisationTestClient,
  createInternalServiceToken,
  createInternalTestClient,
  createTestToken,
  setupTestCase,
  systemInitialisationTestSetup,
  TEST_SYSTEM_ID,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'

test('Returns 403 when accessed with user app token', async () => {
  const systemInitialisation = await systemInitialisationTestSetup()
  const { user } = await setupTestCase()

  const appToken = createTestToken({
    userId: user.id,
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.user
  })
  const client = createInternalTestClient(appToken)

  await expect(
    client.user.initialisation.authenticate({
      password: systemInitialisation.password
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 403 when accessed with system app token', async () => {
  const systemInitialisation = await systemInitialisationTestSetup()

  const appToken = createTestToken({
    userId: TEST_SYSTEM_ID,
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.system
  })

  const client = createInternalTestClient(appToken)

  await expect(
    client.user.initialisation.authenticate({
      password: systemInitialisation.password
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 403 when accessed with internal token using invalid subject', async () => {
  const systemInitialisation = await systemInitialisationTestSetup()
  const internalToken = createInternalServiceToken({
    subject: 'invalid-subject'
  })

  const client = createInternalTestClient(internalToken)

  await expect(
    client.user.initialisation.authenticate({
      password: systemInitialisation.password
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 200 when accessed with proper internal token', async () => {
  const systemInitialisation = await systemInitialisationTestSetup()

  const client = createInternalTestClient()

  await expect(
    client.user.initialisation.authenticate({
      password: systemInitialisation.password
    })
  ).resolves.toMatchObject({ valid: true })
})

test('Returns 403 after initialisation is completed', async () => {
  const { db, password } = await systemInitialisationTestSetup()

  const internalClient = createInternalTestClient()
  const initialisationClient = createInitialisationTestClient()

  const systemInitialisationBefore = await db
    .selectFrom('systemInitialisation')
    .selectAll()
    .execute()

  expect(systemInitialisationBefore).toHaveLength(1)
  expect(systemInitialisationBefore[0].completedAt).toBeNull()

  await expect(
    internalClient.user.initialisation.authenticate({
      password: password
    })
  ).resolves.toMatchObject({ valid: true })

  await expect(initialisationClient.complete()).resolves.toBeUndefined()

  const systemInitialisationAfter = await db
    .selectFrom('systemInitialisation')
    .selectAll()
    .execute()

  expect(systemInitialisationAfter).toHaveLength(1)
  expect(systemInitialisationAfter[0].completedAt).not.toBeNull()

  await expect(
    internalClient.user.initialisation.authenticate({
      password: password
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))

  await expect(initialisationClient.complete()).rejects.toMatchObject(
    new TRPCError({
      code: 'UNAUTHORIZED'
    })
  )
})
