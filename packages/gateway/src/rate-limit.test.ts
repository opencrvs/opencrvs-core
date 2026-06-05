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
import { rateLimitedRoute } from '@gateway/rate-limit'

/**
 * DISABLE_RATE_LIMIT defaults to `true` in the test (dev) environment, so
 * `withRateLimit` short-circuits and never touches Redis. These tests therefore
 * exercise the *key resolution* logic that runs before rate limiting kicks in —
 * which is exactly where the super user 500 originated.
 */

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

describe('rateLimitedRoute', () => {
  it('keys on a payload field when pathForKey is provided', () => {
    const fn = jest.fn(() => 'OK')
    const handler = rateLimitedRoute(
      { requestsPerMinute: 10, pathForKey: 'username' },
      fn
    )

    const result = handler(...makeArgs({ username: 'alice', password: 'pw' }))

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

  it('rate limits on a constant key without inspecting the payload when staticKey is provided', () => {
    const fn = jest.fn(() => 'OK')
    const handler = rateLimitedRoute(
      { requestsPerMinute: 10, staticKey: 'authenticate-super-user' },
      fn
    )

    // No per-user field in the payload, yet it must not throw — this is the fix
    // that lets the data-seeder authenticate the super user through the gateway.
    const result = handler(
      ...makeArgs({ password: 'pw' }, '/auth/authenticate-super-user')
    )

    expect(result).toBe('OK')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
