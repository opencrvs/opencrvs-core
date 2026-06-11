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
import { rateLimitedAuthProxy } from '@gateway/config/proxies'
import { getRoutes } from '@gateway/config/routes'

/**
 * DISABLE_RATE_LIMIT defaults to `true` in the test (dev) environment, so the
 * underlying `withRateLimit` short-circuits. These tests therefore exercise the
 * *key resolution* wiring — i.e. that verifyCode and resendAuthenticationCode
 * are rate limited on the `nonce` field rather than silently falling through to
 * the unthrottled catch-all proxy.
 */

const makeArgs = (payload: unknown, path: string) => {
  const request = {
    headers: {},
    payload: Buffer.from(JSON.stringify(payload))
  }
  const h = {
    request: { path },
    proxy: jest.fn(() => 'PROXIED')
  }
  return [request, h] as unknown as Parameters<
    (typeof rateLimitedAuthProxy.verifyCode)['handler']
  >
}

describe('rate-limited auth proxy', () => {
  // Every nonce-keyed auth route added to close the brute-force / SMS-flooding
  // pentest findings. Keep this list in sync with `rateLimitedAuthProxy`.
  const nonceKeyedRoutes = [
    ['verifyCode', '/auth/verifyCode'],
    ['resendAuthenticationCode', '/auth/resendAuthenticationCode'],
    ['verifyNumber', '/auth/verifyNumber'],
    ['verifySecurityAnswer', '/auth/verifySecurityAnswer'],
    ['sendUserName', '/auth/sendUserName'],
    ['changePassword', '/auth/changePassword']
  ] as const

  it.each(nonceKeyedRoutes)(
    'proxies %s when the nonce key is present',
    (name, path) => {
      const route = rateLimitedAuthProxy[name]
      const result = route.handler(...makeArgs({ nonce: 'abc123' }, path))

      expect(result).toBe('PROXIED')
    }
  )

  it.each(nonceKeyedRoutes)(
    'throws on %s when the nonce key is missing (fails closed)',
    (name, path) => {
      const route = rateLimitedAuthProxy[name]

      expect(() => route.handler(...makeArgs({}, path))).toThrow(
        "Couldn't find the value for a rate limiting key in payload"
      )
    }
  )

  it('registers every rate-limited auth route before the catch-all is reachable', () => {
    const paths = getRoutes().map((route) => route.path)

    // Each must have a dedicated route; otherwise it falls through to the
    // unthrottled `/auth/{suffix}` catch-all (the original pentest finding).
    for (const [, path] of nonceKeyedRoutes) {
      expect(paths).toContain(path)
    }
    expect(paths).toContain('/auth/{suffix}')
  })
})
