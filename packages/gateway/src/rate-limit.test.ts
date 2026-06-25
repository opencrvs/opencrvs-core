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

// Force rate limiting ON for this suite — it defaults to `true` (disabled) in
// the dev/test environment, which would short-circuit every assertion below.
jest.mock('@gateway/constants', () => ({
  ...jest.requireActual('@gateway/constants'),
  DISABLE_RATE_LIMIT: false
}))

/**
 * In-memory stand-in for the node-redis client. Faithfully models the two
 * commands `withRateLimit` issues — `INCR` (creates the key at 1 on a miss or
 * after expiry) and `pEXPIRE` (sets the key's expiry) — and resolves expiry
 * against `Date.now()`, so Jest's fake timers can fast-forward past the window.
 */
jest.mock('@gateway/utils/redis', () => {
  const store = new Map<string, { count: number; expiresAt: number }>()
  return {
    redis: {
      multi() {
        const ops: Array<() => unknown> = []
        const builder = {
          incr(key: string) {
            ops.push(() => {
              const entry = store.get(key)
              if (!entry || entry.expiresAt <= Date.now()) {
                // Fresh key: INCR creates it at 1 with no expiry until pEXPIRE.
                store.set(key, { count: 1, expiresAt: Infinity })
                return 1
              }
              entry.count += 1
              return entry.count
            })
            return builder
          },
          pExpire(key: string, ttl: number) {
            ops.push(() => {
              const entry = store.get(key)
              if (entry) entry.expiresAt = Date.now() + ttl
              return true
            })
            return builder
          },
          async exec() {
            return ops.map((op) => op())
          }
        }
        return builder
      }
    },
    __resetStore: () => store.clear()
  }
})

import { rateLimitedRoute, RateLimitError } from '@gateway/rate-limit'

const resetStore = () =>
  (
    jest.requireMock('@gateway/utils/redis') as { __resetStore: () => void }
  ).__resetStore()

const makeArgs = (payload: unknown, path = '/auth/some-route') => {
  const request = {
    headers: {},
    payload: Buffer.from(JSON.stringify(payload))
  }
  const h = { request: { path } }
  // The handler is invoked by Hapi as (request, h)
  return [request, h] as unknown as Parameters<
    ReturnType<typeof rateLimitedRoute>
  >
}

describe('rateLimitedRoute key resolution', () => {
  beforeEach(resetStore)

  it('keys on a payload field when pathForKey is provided', async () => {
    const fn = jest.fn(() => 'OK')
    const handler = rateLimitedRoute(
      { requestsPerMinute: 10, pathForKey: 'username' },
      fn
    )

    const result = await handler(
      ...makeArgs({ username: 'alice', password: 'pw' })
    )

    expect(result).toBe('OK')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throws when the pathForKey field is missing from the payload', () => {
    const fn = jest.fn(() => 'OK')
    const handler = rateLimitedRoute(
      { requestsPerMinute: 10, pathForKey: 'username' },
      fn
    )

    // Super user auth only sends a password — this is the case that used to 500.
    expect(() => handler(...makeArgs({ password: 'pw' }))).toThrow(
      "Couldn't find the value for a rate limiting key in payload"
    )
    expect(fn).not.toHaveBeenCalled()
  })

  it('rate limits on a constant key without inspecting the payload when staticKey is provided', async () => {
    const fn = jest.fn(() => 'OK')
    const handler = rateLimitedRoute(
      { requestsPerMinute: 10, staticKey: 'authenticate-super-user' },
      fn
    )

    // No per-user field in the payload, yet it must not throw — this is the fix
    // that lets the data-seeder authenticate the super user through the gateway.
    const result = await handler(
      ...makeArgs({ password: 'pw' }, '/auth/authenticate-super-user')
    )

    expect(result).toBe('OK')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('rateLimitedRoute enforcement', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    resetStore()
  })
  afterEach(() => jest.useRealTimers())

  it('allows requestsPerMinute requests, then blocks the next one', async () => {
    const fn = jest.fn(() => 'OK')
    const handler = rateLimitedRoute(
      { requestsPerMinute: 10, pathForKey: 'username' },
      fn
    )
    const send = () => handler(...makeArgs({ username: 'alice' }))

    for (let i = 0; i < 10; i++) {
      await expect(send()).resolves.toBe('OK')
    }

    await expect(send()).rejects.toThrow(RateLimitError)
    // The blocked request never reaches the wrapped handler.
    expect(fn).toHaveBeenCalledTimes(10)
  })

  it('allows requests again once the one-minute window elapses', async () => {
    const fn = jest.fn(() => 'OK')
    const handler = rateLimitedRoute(
      { requestsPerMinute: 10, pathForKey: 'username' },
      fn
    )
    const send = () => handler(...makeArgs({ username: 'alice' }))

    for (let i = 0; i < 10; i++) await send()
    await expect(send()).rejects.toThrow(RateLimitError)

    // Fast-forward past the 60s TTL — the counter expires and resets.
    jest.advanceTimersByTime(60_000)

    await expect(send()).resolves.toBe('OK')
    expect(fn).toHaveBeenCalledTimes(11)
  })

  it('counts each key independently (one user hitting the limit does not block another)', async () => {
    const fn = jest.fn(() => 'OK')
    const handler = rateLimitedRoute(
      { requestsPerMinute: 10, pathForKey: 'username' },
      fn
    )

    for (let i = 0; i < 10; i++)
      await handler(...makeArgs({ username: 'alice' }))
    await expect(handler(...makeArgs({ username: 'alice' }))).rejects.toThrow(
      RateLimitError
    )

    // bob has his own counter and is unaffected.
    await expect(handler(...makeArgs({ username: 'bob' }))).resolves.toBe('OK')
  })

  it('counts the same key independently per route', async () => {
    const fn = jest.fn(() => 'OK')
    const handler = rateLimitedRoute(
      { requestsPerMinute: 10, pathForKey: 'nonce' },
      fn
    )

    for (let i = 0; i < 10; i++) {
      await handler(...makeArgs({ nonce: 'abc' }, '/auth/verifyCode'))
    }
    await expect(
      handler(...makeArgs({ nonce: 'abc' }, '/auth/verifyCode'))
    ).rejects.toThrow(RateLimitError)

    // Same nonce on a different route uses a different counter.
    await expect(
      handler(...makeArgs({ nonce: 'abc' }, '/auth/verifyNumber'))
    ).resolves.toBe('OK')
  })
})
