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
import * as Hapi from '@hapi/hapi'
import { rateLimitedAuthProxy } from '@gateway/config/proxies'
import { getRoutes } from '@gateway/config/routes'
import { createServer } from '@gateway/server'

let mockAuthUrl = ''
jest.mock('@gateway/constants', () =>
  // A getter in an object literal next to a spread is read eagerly once the
  // spread is transpiled to Object.assign, so define it separately.
  Object.defineProperty(
    { ...jest.requireActual('@gateway/constants') },
    'AUTH_URL',
    { get: () => mockAuthUrl }
  )
)

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

  it('registers a dedicated route for every rate-limited auth endpoint', () => {
    const paths = getRoutes().map((route) => route.path)

    for (const [, path] of nonceKeyedRoutes) {
      expect(paths).toContain(path)
    }
  })
})

describe('auth proxy', () => {
  // Every auth endpoint the gateway exposes. Anything else under /auth/ must be
  // a 404, so adding a route here is a deliberate decision.
  const allowedAuthPaths = [
    '/auth/authenticate',
    '/auth/authenticate-super-user',
    '/auth/changePassword',
    '/auth/invalidateToken',
    '/auth/refreshToken',
    '/auth/resendAuthenticationCode',
    '/auth/sendUserName',
    '/auth/token',
    '/auth/verifyCode',
    '/auth/verifyNumber',
    '/auth/verifySecurityAnswer',
    '/auth/verifyUser'
  ]

  // Stands in for the auth service with all of its routes. It is a real Hapi
  // server, so encoded paths are routed the same way auth routes them.
  const upstream = new Hapi.Server({ host: 'localhost', port: 0 })
  const upstreamHits: string[] = []
  let gateway: Hapi.Server

  beforeAll(async () => {
    for (const path of [
      '/ping',
      '/.well-known',
      '/internal/anonymous-token',
      '/internal/reindexing-token',
      '/internal/integration-creator-token',
      '/verifyToken',
      ...allowedAuthPaths.map((path) => path.slice('/auth'.length))
    ]) {
      upstream.route({
        method: '*',
        path,
        handler: (request) => {
          upstreamHits.push(request.path)
          return { token: 'minted' }
        }
      })
    }
    await upstream.start()
    mockAuthUrl = upstream.info.uri
    gateway = (await createServer()).app
  })

  afterAll(async () => {
    await upstream.stop()
  })

  beforeEach(() => {
    upstreamHits.length = 0
  })

  it('registers only the allowed auth paths', () => {
    const authPaths = getRoutes()
      .map((route) => route.path)
      .filter((path) => path.startsWith('/auth'))

    expect(authPaths.sort()).toEqual(allowedAuthPaths)
  })

  it.each(allowedAuthPaths)('proxies POST %s to auth', async (url) => {
    const res = await gateway.inject({
      method: 'POST',
      url,
      // Rate-limited routes fail closed without their key field
      payload: {
        username: 'user',
        nonce: 'nonce',
        token: 'token',
        email: 'user@example.com'
      }
    })

    expect(res.statusCode).toBe(200)
    expect(upstreamHits).toEqual([url.slice('/auth'.length)])
  })

  // Internal auth routes mint tokens without credentials and must only be
  // reachable from inside the cluster, never through the gateway.
  const blockedAttempts = [
    '/auth/internal/integration-creator-token',
    '/auth/internal/reindexing-token',
    '/auth/internal/anonymous-token',
    '/auth/internal%2Fintegration-creator-token',
    '/auth/internal%2fintegration-creator-token',
    '/auth/internal%2Freindexing-token',
    '/auth/internal%2Fanonymous-token',
    '/auth/%2Finternal%2Fintegration-creator-token',
    '/auth/%2E%2E%2Finternal%2Fintegration-creator-token',
    '/auth/refreshToken%2F..%2Finternal%2Fintegration-creator-token',
    '/auth/verifyCode%3F',
    '/auth/verifyToken'
  ]

  it.each(
    blockedAttempts.flatMap((url) => [
      ['GET', url],
      ['POST', url]
    ])
  )('does not proxy %s %s to auth', async (method, url) => {
    const res = await gateway.inject({ method, url })

    expect(res.statusCode).toBe(404)
    expect(upstreamHits).toEqual([])
  })
})
