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
import { createPublicKey, generateKeyPairSync, KeyObject } from 'crypto'
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'

type Server = Awaited<ReturnType<typeof import('@auth/server').createServer>>

async function getKeyList(createServer: () => Promise<Server>) {
  const { server } = await createServer()
  const res = await server.inject({
    method: 'GET',
    url: '/.well-known/jwks.json'
  })
  return {
    statusCode: res.statusCode,
    keys: (res.result as { keys: Record<string, string>[] }).keys
  }
}

/** The server, built with the environment as it is now. */
function freshServer() {
  let createServer!: () => Promise<Server>
  jest.isolateModules(() => {
    // isolateModules needs a synchronous require to load a fresh module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    createServer = require('@auth/server').createServer
  })
  return createServer
}

function publicJwk(pem: string | Buffer | KeyObject) {
  return createPublicKey(pem).export({ format: 'jwk' })
}

const PRIVATE_MEMBERS = ['d', 'p', 'q', 'dp', 'dq', 'qi']
const THUMBPRINT = /^[A-Za-z0-9_-]{43}$/

describe('GET /.well-known/jwks.json', () => {
  const signingKeyPem = readFileSync(process.env.CORE_REQUEST_SIGNING_KEY_PATH!)
  const jwtPublicKeyPem = readFileSync(process.env.CERT_PUBLIC_KEY_PATH!)

  it('publishes the JWT public key and the request-signing public key', async () => {
    const { statusCode, keys } = await getKeyList(freshServer())

    expect(statusCode).toBe(200)
    expect(keys).toEqual([
      {
        ...publicJwk(jwtPublicKeyPem),
        kid: expect.stringMatching(THUMBPRINT),
        use: 'sig',
        alg: 'RS256'
      },
      {
        ...publicJwk(signingKeyPem),
        kid: expect.stringMatching(THUMBPRINT),
        use: 'sig',
        alg: 'EdDSA'
      }
    ])
    expect(keys[0].kid).not.toBe(keys[1].kid)
  })

  it('publishes no private key', async () => {
    const { keys } = await getKeyList(freshServer())

    for (const key of keys) {
      for (const member of PRIVATE_MEMBERS) {
        expect(key).not.toHaveProperty(member)
      }
    }
  })

  it('also publishes the previous request-signing key while the key changes', async () => {
    const previous = generateKeyPairSync('ed25519').privateKey
    const previousPath = join(
      dirname(process.env.CORE_REQUEST_SIGNING_KEY_PATH!),
      'previous.pem'
    )
    writeFileSync(
      previousPath,
      previous.export({ format: 'pem', type: 'pkcs8' })
    )
    process.env.CORE_REQUEST_SIGNING_PREVIOUS_KEY_PATH = previousPath

    try {
      const { keys } = await getKeyList(freshServer())

      expect(keys.map(({ x }) => x)).toEqual([
        undefined,
        publicJwk(signingKeyPem).x,
        publicJwk(previous).x
      ])
    } finally {
      delete process.env.CORE_REQUEST_SIGNING_PREVIOUS_KEY_PATH
    }
  })
})

describe('GET /.well-known', () => {
  it('still returns the JWT public key as PEM', async () => {
    const { server } = await freshServer()()
    const res = await server.inject({ method: 'GET', url: '/.well-known' })

    expect(res.statusCode).toBe(200)
    expect(res.payload).toBe(
      readFileSync(process.env.CERT_PUBLIC_KEY_PATH!).toString()
    )
  })
})
