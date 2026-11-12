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
import { createPublicKey, generateKeyPairSync } from 'node:crypto'
import { toPublicJwk } from './keys'
import { signCoreRequest } from './signature'

/**
 * A new signing key that stands in for core's key in tests of routes with
 * `auth: 'core'`.
 *
 * - `jwks`: the response body for a mock of auth's `/.well-known/jwks.json`.
 * - `findPublicKey`: the `coreRequestAuth` option to use instead of `jwksUrl`.
 * - `request()`: options for Hapi's `server.inject()`. They send `payload` as
 *   JSON, with core's signature made with this key.
 */
export function createTestCoreKey() {
  const { privateKey } = generateKeyPairSync('ed25519')
  const publicKey = createPublicKey(privateKey)
  const jwk = toPublicJwk(privateKey)

  return {
    jwks: { keys: [jwk] },
    findPublicKey: async (keyid: string) =>
      keyid === jwk.kid ? publicKey : undefined,
    request(method: string, url: string, payload?: unknown) {
      const body = payload === undefined ? undefined : JSON.stringify(payload)
      const { pathname, search } = new URL(url, 'http://countryconfig')
      return {
        method,
        url,
        payload: body,
        headers: {
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...signCoreRequest({
            method,
            path: pathname,
            query: search,
            body,
            privateKey,
            keyid: jwk.kid
          })
        }
      }
    }
  }
}
