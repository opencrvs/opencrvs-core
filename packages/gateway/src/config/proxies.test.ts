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
jest.mock('@gateway/constants', () => ({
  ...jest.requireActual('@gateway/constants'),
  get AUTH_URL() {
    return mockAuthUrl
  }
}))

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
  // Every payload-keyed auth route added to close the brute-force /
  // SMS-flooding pentest findings, with the payload field each one keys on.
  // Keep this list in sync with `rateLimitedAuthProxy`.
  const keyedRoutes = [
    ['verifyCode', '/auth/verifyCode', 'nonce'],
    ['resendAuthenticationCode', '/auth/resendAuthenticationCode', 'nonce'],
    ['verifySecurityAnswer', '/auth/verifySecurityAnswer', 'nonce'],
    ['sendUserName', '/auth/sendUserName', 'nonce'],
    ['changePassword', '/auth/changePassword', 'nonce'],
    ['verifyRecoveryToken', '/auth/verifyRecoveryToken', 'token']
  ] as const

  it.each(keyedRoutes)(
    'proxies %s when the %s key is present',
    (name, path, keyField) => {
      const route = rateLimitedAuthProxy[name]
      const result = route.handler(...makeArgs({ [keyField]: 'abc123' }, path))

      expect(result).toBe('PROXIED')
    }
  )

  it.each(keyedRoutes)(
    'throws on %s when the %s key is missing (fails closed)',
    (name, path) => {
      const route = rateLimitedAuthProxy[name]

      expect(() => route.handler(...makeArgs({}, path))).toThrow(
        "Couldn't find the value for a rate limiting key in payload"
      )
    }
  )

  it('does not proxy verifyRecoveryToken when a different payload field carries the token', () => {
    const route = rateLimitedAuthProxy.verifyRecoveryToken

    // Guards the key name itself: keying on anything the client does not send
    // would put every request in one bucket, or none.
    expect(() =>
      route.handler(
        ...makeArgs({ nonce: 'abc123' }, '/auth/verifyRecoveryToken')
      )
    ).toThrow("Couldn't find the value for a rate limiting key in payload")
  })

  it('registers a dedicated route for every rate-limited auth endpoint', () => {
    const paths = getRoutes().map((route) => route.path)

    for (const [, path] of keyedRoutes) {
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
    '/auth/verifyRecoveryToken',
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
      '/internal/service-token',
      '/internal/reindexing-token',
      '/internal/integration-creator-token',
      '/verifyToken',
      ...allowedAuthPaths.map((path) => path.slice('/auth'.length))
    ]) {
      upstream.route({
        method: '*',
        path,
        handler: (request) => {
          upstreamHits.push(request.path + request.url.search)
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

  // 2.1.x still accepts deprecated OAuth parameters in the query string
  it('forwards the query string on POST /auth/token', async () => {
    const res = await gateway.inject({
      method: 'POST',
      url: '/auth/token?grant_type=client_credentials&client_id=id'
    })

    expect(res.statusCode).toBe(200)
    expect(upstreamHits).toEqual([
      '/token?grant_type=client_credentials&client_id=id'
    ])
  })

  // Internal auth routes mint tokens without credentials and must only be
  // reachable from inside the cluster, never through the gateway.
  const blockedAttempts = [
    '/auth/internal/integration-creator-token',
    '/auth/internal/reindexing-token',
    '/auth/internal/service-token',
    '/auth/internal%2Fintegration-creator-token',
    '/auth/internal%2fintegration-creator-token',
    '/auth/internal%2Freindexing-token',
    '/auth/internal%2Fservice-token',
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
