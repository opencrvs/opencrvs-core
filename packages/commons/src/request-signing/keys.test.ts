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
import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync
} from 'node:crypto'
import { loadCoreSigningKey, toPublicJwk } from './keys'
import { signCoreRequest, verifyCoreRequest } from './signature'

/* RFC 8037, Appendix A.1-A.3. */
const RFC_8037_PRIVATE_KEY = {
  kty: 'OKP',
  crv: 'Ed25519',
  d: 'nWGxne_9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A',
  x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo'
}
const RFC_8037_THUMBPRINT = 'kPrK_qmxVWaYVA9wwBF6Iuo3vVzz7TxHCTwXBygrS4k'

function pemOf(jwk: typeof RFC_8037_PRIVATE_KEY) {
  return createPrivateKey({ key: jwk, format: 'jwk' }).export({
    format: 'pem',
    type: 'pkcs8'
  })
}

describe('loadCoreSigningKey', () => {
  it('uses the RFC 7638 thumbprint of the public key as the keyid', () => {
    const { keyid } = loadCoreSigningKey(pemOf(RFC_8037_PRIVATE_KEY))

    expect(keyid).toBe(RFC_8037_THUMBPRINT)
  })

  it('signs requests that verify with the published public key', async () => {
    const { privateKey, keyid } = loadCoreSigningKey(
      pemOf(RFC_8037_PRIVATE_KEY)
    )
    const jwk = toPublicJwk(privateKey)
    const headers = signCoreRequest({
      method: 'GET',
      path: '/config/events',
      key: { privateKey, keyid }
    })

    const result = await verifyCoreRequest(
      {
        method: 'GET',
        path: '/config/events',
        query: '',
        rawBody: Buffer.alloc(0),
        headers: {
          'content-digest': headers['Content-Digest'],
          'signature-input': headers['Signature-Input'],
          signature: headers.Signature
        }
      },
      async (kid) =>
        kid === jwk.kid
          ? createPublicKey({ key: jwk, format: 'jwk' })
          : undefined
    )
    expect(result).toEqual({ valid: true, keyid })
  })

  it('rejects a key that is not Ed25519, such as the JWT key', () => {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })

    expect(() =>
      loadCoreSigningKey(privateKey.export({ format: 'pem', type: 'pkcs8' }))
    ).toThrow(/Ed25519/)
  })
})

describe('toPublicJwk', () => {
  it('gives the public part of an Ed25519 key, with kid, use and alg', () => {
    const { privateKey } = loadCoreSigningKey(pemOf(RFC_8037_PRIVATE_KEY))

    expect(toPublicJwk(privateKey)).toEqual({
      kty: 'OKP',
      crv: 'Ed25519',
      x: RFC_8037_PRIVATE_KEY.x,
      kid: RFC_8037_THUMBPRINT,
      use: 'sig',
      alg: 'EdDSA'
    })
  })

  it('gives an RSA public key with RS256, for the JWT key', () => {
    const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })

    const jwk = toPublicJwk(publicKey)

    expect(jwk).toEqual({
      kty: 'RSA',
      n: expect.any(String),
      e: 'AQAB',
      kid: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
      use: 'sig',
      alg: 'RS256'
    })
    expect(jwk).not.toHaveProperty('d')
  })
})
