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
import { generateKeyPairSync } from 'node:crypto'
import { coreRequestAuth } from './hapi'
import { signCoreRequest } from './signature'

const KEYID = 'core-request-test'
const { privateKey, publicKey } = generateKeyPairSync('ed25519')

async function createServer() {
  const server = Hapi.server()
  await server.register({
    plugin: coreRequestAuth,
    options: {
      findPublicKey: async (keyid: string) =>
        keyid === KEYID ? publicKey : undefined
    }
  })

  server.route({
    method: 'GET',
    path: '/config/events',
    options: { auth: 'core' },
    handler: (request) => ({ credentials: request.auth.credentials })
  })
  server.route({
    method: 'POST',
    path: '/trigger/events/{event}/actions/{action}',
    options: { auth: 'core' },
    handler: (request) => ({ received: request.payload })
  })
  return server
}

function signed(
  method: 'GET' | 'POST',
  url: string,
  payload?: string,
  key = privateKey
) {
  const { pathname, search } = new URL(url, 'http://countryconfig')
  return {
    method,
    url,
    payload,
    headers: {
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
      ...signCoreRequest({
        method,
        path: pathname,
        query: search,
        body: payload,
        privateKey: key,
        keyid: KEYID
      })
    }
  }
}

const body = JSON.stringify({ id: 'abc', type: 'birth' })

describe('core auth plugin', () => {
  afterEach(() => jest.restoreAllMocks())

  it('fetches the key list when it is registered', async () => {
    const fetchKeys = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ keys: [] })))

    await Hapi.server().register({
      plugin: coreRequestAuth,
      options: { jwksUrl: 'http://auth:4040/.well-known/jwks.json' }
    })

    expect(fetchKeys).toHaveBeenCalledWith(
      'http://auth:4040/.well-known/jwks.json'
    )
  })

  it('starts when auth cannot be reached', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'))

    await expect(
      Hapi.server().register({
        plugin: coreRequestAuth,
        options: { jwksUrl: 'http://auth:4040/.well-known/jwks.json' }
      })
    ).resolves.not.toThrow()
  })
})

describe('core auth strategy', () => {
  let server: Hapi.Server
  beforeEach(async () => {
    server = await createServer()
  })

  it('accepts a signed GET and gives the keyid as credentials', async () => {
    const res = await server.inject(signed('GET', '/config/events'))

    expect(res.statusCode).toBe(200)
    expect(res.result).toEqual({ credentials: { keyid: KEYID } })
  })

  it('accepts a signed GET with a query', async () => {
    const res = await server.inject(signed('GET', '/config/events?lang=en'))

    expect(res.statusCode).toBe(200)
  })

  it('accepts a signed POST and gives the handler the parsed body', async () => {
    const res = await server.inject(
      signed('POST', '/trigger/events/birth/actions/REGISTER', body)
    )

    expect(res.statusCode).toBe(200)
    expect(res.result).toEqual({ received: { id: 'abc', type: 'birth' } })
  })

  it('returns 403 for a request with no signature, without saying why', async () => {
    const res = await server.inject({ method: 'GET', url: '/config/events' })

    expect(res.statusCode).toBe(403)
    expect(res.result).toEqual({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Forbidden'
    })
  })


  it('returns 403 for a request with a user token and no signature', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/config/events',
      headers: { Authorization: 'Bearer some.user.token' }
    })

    expect(res.statusCode).toBe(403)
  })

  it('returns 403 for a request signed with a key that is not published', async () => {
    const other = generateKeyPairSync('ed25519').privateKey
    const res = await server.inject(
      signed('GET', '/config/events', undefined, other)
    )

    expect(res.statusCode).toBe(403)
  })

  it('returns 403 when the body is changed', async () => {
    const request = signed(
      'POST',
      '/trigger/events/birth/actions/REGISTER',
      body
    )
    const res = await server.inject({
      ...request,
      payload: body.replace('birth', 'death')
    })

    expect(res.statusCode).toBe(403)
  })

  it('returns 403 when a signed request is sent to another path', async () => {
    const request = signed(
      'POST',
      '/trigger/events/birth/actions/REGISTER',
      body
    )
    const res = await server.inject({
      ...request,
      url: '/trigger/events/death/actions/REGISTER'
    })

    expect(res.statusCode).toBe(403)
  })

  it('returns 403 when a query is added to a signed request', async () => {
    const res = await server.inject({
      ...signed('GET', '/config/events'),
      url: '/config/events?all=true'
    })

    expect(res.statusCode).toBe(403)
  })

  it('returns 403 for a GET whose signature names a body', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/config/events',
      headers: {
        ...signCoreRequest({
          method: 'GET',
          path: '/config/events',
          body,
          privateKey,
          keyid: KEYID
        }),
        'Content-Type': 'application/json'
      }
    })

    expect(res.statusCode).toBe(403)
  })
})
