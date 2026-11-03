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
import { createPublicKey, generateKeyPairSync } from 'crypto'
import { readFileSync } from 'fs'
import {
  loadCoreSigningKey,
  toPublicJwk
} from '@opencrvs/commons/request-signing'
import { createServer } from '@auth/server'
import { publishedKeys } from './handler'

const PRIVATE_MEMBERS = ['d', 'p', 'q', 'dp', 'dq', 'qi']

async function getKeyList() {
  const { server } = await createServer()
  const res = await server.inject({
    method: 'GET',
    url: '/.well-known/jwks.json'
  })
  return { statusCode: res.statusCode, keys: res.result as { keys: object[] } }
}

describe('GET /.well-known/jwks.json', () => {
  const signingKey = loadCoreSigningKey(
    readFileSync(process.env.CORE_REQUEST_SIGNING_KEY_PATH!)
  )

  it('publishes the JWT public key and the request-signing public key', async () => {
    const { statusCode, keys } = await getKeyList()

    expect(statusCode).toBe(200)
    expect(keys).toEqual({
      keys: [
        toPublicJwk(
          createPublicKey(readFileSync(process.env.CERT_PUBLIC_KEY_PATH!))
        ),
        toPublicJwk(signingKey.privateKey)
      ]
    })
  })

  it('publishes no private key', async () => {
    const { keys } = await getKeyList()

    for (const key of keys.keys) {
      for (const member of PRIVATE_MEMBERS) {
        expect(key).not.toHaveProperty(member)
      }
    }
  })

  it('also publishes the previous request-signing key while the key changes', () => {
    const previous = generateKeyPairSync('ed25519').privateKey

    const keys = publishedKeys({
      jwtPublicKey: createPublicKey(
        readFileSync(process.env.CERT_PUBLIC_KEY_PATH!)
      ),
      requestSigningKey: signingKey.privateKey,
      previousRequestSigningKey: previous
    })

    expect(keys).toContainEqual(toPublicJwk(previous))
    expect(keys).toContainEqual(toPublicJwk(signingKey.privateKey))
  })
})

describe('GET /.well-known', () => {
  it('still returns the JWT public key as PEM', async () => {
    const { server } = await createServer()
    const res = await server.inject({ method: 'GET', url: '/.well-known' })

    expect(res.statusCode).toBe(200)
    expect(res.payload).toBe(
      readFileSync(process.env.CERT_PUBLIC_KEY_PATH!).toString()
    )
  })
})
