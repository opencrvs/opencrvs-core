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

import { HttpResponse, delay, http } from 'msw'
import { TRPCError } from '@trpc/server'
import { ActionStatus, ActionType, getUUID } from '@opencrvs/commons'
import { getCurrentEventState } from '@opencrvs/commons/events'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

const DECLARE_URL = `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/DECLARE`

/** Responds to the country config DECLARE confirmation with `status`, counting the calls. */
function mockDeclareApi(status: number, { delayMs = 0 } = {}) {
  const calls = { count: 0 }
  mswServer.use(
    http.post(DECLARE_URL, async () => {
      calls.count++
      await delay(delayMs)
      // @ts-expect-error - msw types complain about numeric status
      return HttpResponse.json({}, { status })
    })
  )
  return calls
}

function getDeclareActions<T extends { type: ActionType }>(actions: T[]) {
  return actions.filter(({ type }) => type === ActionType.DECLARE)
}

async function setup() {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())
  const declare = async () =>
    client.event.actions.declare.request({
      ...generator.event.actions.declare(event.id, { keepAssignment: true }),
      transactionId: getUUID()
    })

  return { client, event, declare }
}

describe('Action requests on an event with a requested action left without an outcome', () => {
  test('a new submission after a failed confirmation is accepted', async () => {
    const { client, event, declare } = await setup()

    mockDeclareApi(500)
    await expect(declare()).rejects.toThrow()

    mockDeclareApi(200)
    const response = await declare()

    const [failed, requested, accepted] = getDeclareActions(response.actions)
    expect(getDeclareActions(response.actions)).toHaveLength(3)
    // The failed request is left as it is, without an outcome
    expect(failed).toMatchObject({ status: ActionStatus.Requested })
    expect(requested).toMatchObject({ status: ActionStatus.Requested })
    expect(accepted).toMatchObject({
      status: ActionStatus.Accepted,
      originalActionId: requested.id,
      transactionId: requested.transactionId
    })
    expect(failed.transactionId).not.toEqual(requested.transactionId)

    const stored = await client.event.get(event.id)
    expect(
      getCurrentEventState(stored, tennisClubMembershipEvent).flags
    ).not.toContain('declare:requested')
  })

  test('a record with two failed requests completes on the retry of either, and the other is refused', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    const first = {
      ...generator.event.actions.declare(event.id, { keepAssignment: true }),
      transactionId: getUUID()
    }
    const second = { ...first, transactionId: getUUID() }

    mockDeclareApi(500)
    await expect(client.event.actions.declare.request(first)).rejects.toThrow()
    await expect(client.event.actions.declare.request(second)).rejects.toThrow()

    const calls = mockDeclareApi(200)
    const response = await client.event.actions.declare.request(second)

    expect(calls.count).toBe(1)
    expect(getDeclareActions(response.actions).at(-1)).toMatchObject({
      status: ActionStatus.Accepted,
      transactionId: second.transactionId
    })

    // The record is declared, so the retry of the other request is not allowed
    await expect(
      client.event.actions.declare.request(first)
    ).rejects.toMatchObject({ code: 'CONFLICT' })
    expect(calls.count).toBe(1)
  })
})

describe('Concurrent action requests', () => {
  test('only one of two concurrent submissions reaches the country config', async () => {
    const { client, event, declare } = await setup()
    const calls = mockDeclareApi(200, { delayMs: 500 })

    const results = await Promise.allSettled([declare(), declare()])

    expect(calls.count).toBe(1)
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    const [refused] = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected'
    )
    expect(refused.reason).toBeInstanceOf(TRPCError)
    expect(refused.reason).toMatchObject({
      code: 'CONFLICT',
      message:
        "Action 'DECLARE' cannot be requested while another action request on the event is in progress"
    })

    const stored = await client.event.get(event.id)
    expect(
      getDeclareActions(stored.actions).map(({ status }) => status)
    ).toEqual([ActionStatus.Requested, ActionStatus.Accepted])
  })

  test('the lock is released when the request fails', async () => {
    const { declare } = await setup()

    mockDeclareApi(500, { delayMs: 100 })
    await expect(declare()).rejects.toThrow()

    const calls = mockDeclareApi(200)
    await expect(declare()).resolves.toBeDefined()
    expect(calls.count).toBe(1)
  })

  test('requests on different events do not block each other', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const first = await client.event.create(generator.event.create())
    const second = await client.event.create(generator.event.create())
    const calls = mockDeclareApi(200, { delayMs: 500 })

    const results = await Promise.allSettled(
      [first, second].map(async (event) =>
        client.event.actions.declare.request(
          generator.event.actions.declare(event.id, { keepAssignment: true })
        )
      )
    )

    expect(results.map(({ status }) => status)).toEqual([
      'fulfilled',
      'fulfilled'
    ])
    expect(calls.count).toBe(2)
  })
})
