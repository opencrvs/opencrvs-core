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
import { getUUID } from '@opencrvs/commons'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'

describe('user.activate', () => {
  test('successfully activates a pending user', async () => {
    const { user, eventsDb } = await setupTestCase()
    await eventsDb
      .updateTable('users')
      .where('id', '=', user.id)
      .set({ status: 'pending' })
      .execute()

    const activatePayload = {
      userId: user.id,
      password: 'new_password',
      securityQNAs: [
        { questionKey: 'HOME_TOWN', answer: 'test' },
        { questionKey: 'FIRST_SCHOOL', answer: 'test' },
        { questionKey: 'FAVORITE_COLOR', answer: 'test' }
      ]
    }
    const client = createTestClient(user)
    await expect(client.user.activate(activatePayload)).resolves.not.toThrow()
  })

  test('system client cannot call activate', async () => {
    const systemId = getUUID()
    const client = createSystemTestClient(systemId)
    const activatePayload = {
      userId: systemId,
      password: 'new_password',
      securityQNAs: [
        { questionKey: 'HOME_TOWN', answer: 'test' },
        { questionKey: 'FIRST_SCHOOL', answer: 'test' },
        { questionKey: 'FAVORITE_COLOR', answer: 'test' }
      ]
    }
    await expect(client.user.activate(activatePayload)).rejects.toMatchObject(
      new TRPCError({ code: 'FORBIDDEN' })
    )
  })

  test('cannot activate another user (account takeover)', async () => {
    const { users, eventsDb } = await setupTestCase()
    const attacker = users[0]
    const victim = users[1]

    // Put the victim in the invited-but-not-activated state
    await eventsDb
      .updateTable('users')
      .where('id', '=', victim.id)
      .set({ status: 'pending' })
      .execute()

    // A different authenticated user must not be able to set the victim's credentials and take over the account.
    const attackerClient = createTestClient(attacker)
    await expect(
      attackerClient.user.activate({
        userId: victim.id,
        password: 'attacker_password',
        securityQNAs: [
          { questionKey: 'HOME_TOWN', answer: 'attacker' },
          { questionKey: 'FIRST_SCHOOL', answer: 'attacker' },
          { questionKey: 'FAVORITE_COLOR', answer: 'attacker' }
        ]
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN', name: 'TRPCError' })

    // The victim remains pending — not taken over.
    const dbVictim = await eventsDb
      .selectFrom('users')
      .select('status')
      .where('id', '=', victim.id)
      .executeTakeFirstOrThrow()
    expect(dbVictim.status).toBe('pending')
  })

  test('rejects a non-owned user id before checking existence (no leak)', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)
    // A random id that isn't the caller's own is rejected by the ownership
    // check, so activate never reveals whether that id exists.
    await expect(
      client.user.activate({
        userId: getUUID(),
        password: 'new_password',
        securityQNAs: [
          { questionKey: 'HOME_TOWN', answer: 'test' },
          { questionKey: 'FIRST_SCHOOL', answer: 'test' },
          { questionKey: 'FAVORITE_COLOR', answer: 'test' }
        ]
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN', name: 'TRPCError' })
  })

  test('returns CONFLICT when user is already active', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)
    await expect(
      client.user.activate({
        userId: user.id,
        password: 'new_password',
        securityQNAs: [
          { questionKey: 'HOME_TOWN', answer: 'test' },
          { questionKey: 'FIRST_SCHOOL', answer: 'test' },
          { questionKey: 'FAVORITE_COLOR', answer: 'test' }
        ]
      })
    ).rejects.toMatchObject({ code: 'CONFLICT', name: 'TRPCError' })
  })

  test('returns CONFLICT when user is deactivated', async () => {
    const { user, eventsDb } = await setupTestCase()
    await eventsDb
      .updateTable('users')
      .where('id', '=', user.id)
      .set({ status: 'deactivated' })
      .execute()
    const client = createTestClient(user)
    await expect(
      client.user.activate({
        userId: user.id,
        password: 'new_password',
        securityQNAs: [
          { questionKey: 'HOME_TOWN', answer: 'test' },
          { questionKey: 'FIRST_SCHOOL', answer: 'test' },
          { questionKey: 'FAVORITE_COLOR', answer: 'test' }
        ]
      })
    ).rejects.toMatchObject({ code: 'CONFLICT', name: 'TRPCError' })
  })

  test('sets user status to active after successful activation', async () => {
    const { user, eventsDb } = await setupTestCase()
    await eventsDb
      .updateTable('users')
      .where('id', '=', user.id)
      .set({ status: 'pending' })
      .execute()

    const client = createTestClient(user)
    await client.user.activate({
      userId: user.id,
      password: 'new_password',
      securityQNAs: [
        { questionKey: 'HOME_TOWN', answer: 'test' },
        { questionKey: 'FIRST_SCHOOL', answer: 'test' },
        { questionKey: 'FAVORITE_COLOR', answer: 'test' }
      ]
    })

    const dbUser = await eventsDb
      .selectFrom('users')
      .select('status')
      .where('id', '=', user.id)
      .executeTakeFirstOrThrow()

    expect(dbUser.status).toBe('active')
  })
})
