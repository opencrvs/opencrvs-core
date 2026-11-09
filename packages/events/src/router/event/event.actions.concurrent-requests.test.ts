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
import { ActionStatus, ActionType, getUUID } from '@opencrvs/commons'
import { getCurrentEventState } from '@opencrvs/commons/events'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createEvent,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import { getPool } from '@events/storage/postgres/events'

/**
 * Answers country config action confirmations with the status `respond` returns for the
 * action, after `delayMs`. Returns the number of calls per action type.
 */
function mockConfirmations(
  respond: (action: string) => number = () => 200,
  { delayMs = 0 } = {}
) {
  const calls: Record<string, number> = {}
  mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/:event/actions/:action`,
      async ({ params }) => {
        const action = String(params.action)
        calls[action] = (calls[action] ?? 0) + 1
        await delay(delayMs)
        const status = respond(action)
        const body =
          status === 200 && action === ActionType.REGISTER
            ? { registrationNumber: `ABC${Date.now()}` }
            : {}
        // @ts-expect-error - msw types complain about numeric status
        return HttpResponse.json(body, { status })
      }
    )
  )
  return calls
}

async function setup(actions: Parameters<typeof createEvent>[2] = []) {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, actions)

  const declare = async (transactionId = getUUID()) =>
    client.event.actions.declare.request({
      ...generator.event.actions.declare(event.id, { keepAssignment: true }),
      transactionId
    })
  const validate = async (transactionId = getUUID()) =>
    client.event.actions.validate.request({
      ...generator.event.actions.validate(event.id, { keepAssignment: true }),
      transactionId
    })
  const register = async (transactionId = getUUID()) =>
    client.event.actions.register.request({
      ...generator.event.actions.register(event.id, { keepAssignment: true }),
      transactionId
    })
  const reject = async () =>
    client.event.actions.reject.request(
      generator.event.actions.reject(event.id, { keepAssignment: true })
    )
  const archive = async () =>
    client.event.actions.archive.request(
      generator.event.actions.archive(event.id, { keepAssignment: true })
    )

  return {
    client,
    generator,
    event,
    declare,
    validate,
    register,
    reject,
    archive
  }
}

function statuses(
  actions: { type: ActionType; status: string }[],
  type: ActionType
) {
  return actions.filter((a) => a.type === type).map(({ status }) => status)
}

/** Exactly one request succeeded; the other was refused as not available while one is requested. */
function expectOneRefusedAsRequested(results: PromiseSettledResult<unknown>[]) {
  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
  const [refused] = results.filter(
    (r): r is PromiseRejectedResult => r.status === 'rejected'
  )
  expect(refused.reason).toMatchObject({ code: 'CONFLICT' })
  expect(refused.reason.message).toMatch(/:requested/)
}

/** Waits until `count` other sessions on the database are waiting for a lock. */
async function waitForLockWaiters(
  client: { query: (sql: string) => Promise<{ rows: { waiting: number }[] }> },
  count: number
) {
  const deadline = Date.now() + 4000
  while (Date.now() < deadline) {
    // Inside a transaction Postgres keeps returning its first pg_stat_activity snapshot
    await client.query('SELECT pg_stat_clear_snapshot()')
    const { rows } = await client.query(
      `SELECT count(*)::int AS waiting FROM pg_stat_activity
       WHERE datname = current_database() AND wait_event_type = 'Lock'`
    )
    if (rows[0].waiting >= count) {
      return
    }
    await delay(25)
  }
  throw new Error(`Expected ${count} sessions waiting for a lock`)
}

describe('An event has at most one requested action', () => {
  test('of two concurrent DECLAREs, one reaches the country config and the other is refused', async () => {
    const { client, event, declare } = await setup()
    const calls = mockConfirmations(() => 200, { delayMs: 500 })

    const results = await Promise.allSettled([declare(), declare()])

    expect(calls[ActionType.DECLARE]).toBe(1)
    expectOneRefusedAsRequested(results)

    const stored = await client.event.get(event.id)
    expect(statuses(stored.actions, ActionType.DECLARE)).toEqual([
      ActionStatus.Requested,
      ActionStatus.Accepted
    ])
  })

  test('a DECLARE waiting for its asynchronous confirmation refuses another DECLARE', async () => {
    const { declare } = await setup()
    const calls = mockConfirmations(() => 202)

    await declare()
    await expect(declare()).rejects.toMatchObject({
      code: 'CONFLICT',
      message: expect.stringContaining('declare:requested')
    })
    expect(calls[ActionType.DECLARE]).toBe(1)
  })

  test('the check and the insert run one request at a time', async () => {
    const { client, event, declare } = await setup()
    const calls = mockConfirmations()

    // Hold a lock on the event row that blocks both the event lock of a request and the
    // insert of a requested action, so that both requests are waiting before either runs.
    // Without the event lock, both would pass the check and then both insert.
    const blocker = await getPool().connect()
    try {
      await blocker.query('BEGIN')
      await blocker.query(
        'SELECT id FROM app.events WHERE id = $1 FOR UPDATE',
        [event.id]
      )

      const requests = Promise.allSettled([declare(), declare()])
      await waitForLockWaiters(blocker, 2)
      await blocker.query('COMMIT')

      expectOneRefusedAsRequested(await requests)
    } finally {
      blocker.release()
    }

    expect(calls[ActionType.DECLARE]).toBe(1)
    const stored = await client.event.get(event.id)
    expect(statuses(stored.actions, ActionType.DECLARE)).toEqual([
      ActionStatus.Requested,
      ActionStatus.Accepted
    ])
  })

  test('requests on different events do not block each other', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const first = await client.event.create(generator.event.create())
    const second = await client.event.create(generator.event.create())
    const calls = mockConfirmations(() => 200, { delayMs: 500 })

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
    expect(calls[ActionType.DECLARE]).toBe(2)
  })

  test('a READ is not blocked while an action request waits for the country config', async () => {
    const { client, event, declare } = await setup()
    mockConfirmations(() => 200, { delayMs: 1000 })

    const declaring = declare()
    await delay(200)
    const startedAt = Date.now()
    await client.event.get(event.id)
    expect(Date.now() - startedAt).toBeLessThan(800)

    await expect(declaring).resolves.toBeDefined()
  })
})

describe('A requested action left without an outcome', () => {
  test('refuses a new DECLARE, and the retry of the failed request completes', async () => {
    const { client, event, declare } = await setup()
    const failed = getUUID()

    mockConfirmations(() => 500)
    await expect(declare(failed)).rejects.toThrow()

    // A new submission (new transaction id) is refused while the failed request is pending
    const calls = mockConfirmations()
    await expect(declare()).rejects.toMatchObject({ code: 'CONFLICT' })
    expect(calls[ActionType.DECLARE]).toBeUndefined()

    // The retry of the failed request (same transaction id) completes it
    const response = await declare(failed)
    expect(calls[ActionType.DECLARE]).toBe(1)
    expect(statuses(response.actions, ActionType.DECLARE)).toEqual([
      ActionStatus.Requested,
      ActionStatus.Accepted
    ])

    const stored = await client.event.get(event.id)
    const state = getCurrentEventState(stored, tennisClubMembershipEvent)
    expect(state.status).toBe('DECLARED')
    expect(state.flags).not.toContain('declare:requested')
  })

  test('a failed VALIDATE is completed by its retry', async () => {
    const { client, event, validate } = await setup([ActionType.DECLARE])
    const failed = getUUID()

    mockConfirmations(() => 500)
    await expect(validate(failed)).rejects.toThrow()

    const calls = mockConfirmations()
    await validate(failed)
    expect(calls[ActionType.VALIDATE]).toBe(1)

    const stored = await client.event.get(event.id)
    const state = getCurrentEventState(stored, tennisClubMembershipEvent)
    expect(state.status).toBe('VALIDATED')
    expect(state.flags).not.toContain('validate:requested')
  })

  test('an action with an outcome is not sent again on a retry', async () => {
    const { validate } = await setup([ActionType.DECLARE])
    const transactionId = getUUID()
    const calls = mockConfirmations()

    await validate(transactionId)
    await validate(transactionId)
    expect(calls[ActionType.VALIDATE]).toBe(1)
  })
})

describe('Concurrent VALIDATE and REGISTER requests', () => {
  test('two concurrent VALIDATEs: one reaches the country config, the other is refused', async () => {
    const { client, event, validate } = await setup([ActionType.DECLARE])
    const calls = mockConfirmations(() => 200, { delayMs: 500 })

    const results = await Promise.allSettled([validate(), validate()])

    expect(calls[ActionType.VALIDATE]).toBe(1)
    expectOneRefusedAsRequested(results)

    const stored = await client.event.get(event.id)
    expect(statuses(stored.actions, ActionType.VALIDATE)).toEqual([
      ActionStatus.Requested,
      ActionStatus.Accepted
    ])
    const state = getCurrentEventState(stored, tennisClubMembershipEvent)
    expect(state.status).toBe('VALIDATED')
    expect(state.flags).not.toContain('validate:requested')
  })

  test('two concurrent REGISTERs: one reaches the country config, the other is refused', async () => {
    const { client, event, register } = await setup([
      ActionType.DECLARE,
      ActionType.VALIDATE
    ])
    const calls = mockConfirmations(() => 200, { delayMs: 500 })

    const results = await Promise.allSettled([register(), register()])

    expect(calls[ActionType.REGISTER]).toBe(1)
    expectOneRefusedAsRequested(results)

    const stored = await client.event.get(event.id)
    expect(statuses(stored.actions, ActionType.REGISTER)).toEqual([
      ActionStatus.Requested,
      ActionStatus.Accepted
    ])
    const state = getCurrentEventState(stored, tennisClubMembershipEvent)
    expect(state.status).toBe('REGISTERED')
    expect(state.flags).not.toContain('register:requested')
  })

  test('VALIDATE and REJECT at once on a declared record: only one runs', async () => {
    const { validate, reject } = await setup([ActionType.DECLARE])
    const calls = mockConfirmations(() => 200, { delayMs: 500 })

    const results = await Promise.allSettled([validate(), reject()])

    expect(
      (calls[ActionType.VALIDATE] ?? 0) + (calls[ActionType.REJECT] ?? 0)
    ).toBe(1)
    expectOneRefusedAsRequested(results)
  })

  test('REGISTER and ARCHIVE at once on a validated record: only one runs', async () => {
    const { register, archive } = await setup([
      ActionType.DECLARE,
      ActionType.VALIDATE
    ])
    const calls = mockConfirmations(() => 200, { delayMs: 500 })

    const results = await Promise.allSettled([register(), archive()])

    expect(
      (calls[ActionType.REGISTER] ?? 0) + (calls[ActionType.ARCHIVE] ?? 0)
    ).toBe(1)
    expectOneRefusedAsRequested(results)
  })

  test('a REGISTER after a concurrent VALIDATE pair completes normally', async () => {
    const { validate, register } = await setup([ActionType.DECLARE])
    mockConfirmations(() => 200, { delayMs: 300 })

    await Promise.allSettled([validate(), validate()])

    const registered = await register()
    expect(
      getCurrentEventState(registered, tennisClubMembershipEvent).status
    ).toBe('REGISTERED')
  })
})
