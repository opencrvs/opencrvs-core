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
import { coreRequestAuth } from './hapi'
import { createTestCoreKey } from './testing'

async function createServer(
  options: Parameters<typeof coreRequestAuth.register>[1]
) {
  const server = Hapi.server()
  await server.register({ plugin: coreRequestAuth, options })
  server.route({
    method: 'POST',
    path: '/trigger/events',
    options: { auth: 'core' },
    handler: (request) => ({ query: request.query, received: request.payload })
  })
  return server
}

describe('createTestCoreKey', () => {
  afterEach(() => jest.restoreAllMocks())

  it('signs a request that the core strategy accepts', async () => {
    const coreKey = createTestCoreKey()
    const server = await createServer({ findPublicKey: coreKey.findPublicKey })

    const response = await server.inject(
      coreKey.request('POST', '/trigger/events?a=1', { id: 'abc' })
    )

    expect(response.statusCode).toBe(200)
    expect(response.result).toEqual({
      query: { a: '1' },
      received: { id: 'abc' }
    })
  })

  it('publishes its public key in the JWKS that the strategy fetches', async () => {
    const coreKey = createTestCoreKey()
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(coreKey.jwks)))
    const server = await createServer({
      jwksUrl: 'http://auth/.well-known/jwks.json'
    })

    const response = await server.inject(
      coreKey.request('POST', '/trigger/events')
    )

    expect(response.statusCode).toBe(200)
  })

  it('does not accept a request that another test core key signed', async () => {
    const server = await createServer({
      findPublicKey: createTestCoreKey().findPublicKey
    })

    const response = await server.inject(
      createTestCoreKey().request('POST', '/trigger/events')
    )

    expect(response.statusCode).toBe(403)
  })
})
