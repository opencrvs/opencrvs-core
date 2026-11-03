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
import type { CoreSigningKey } from './signature'
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  KeyObject
} from 'node:crypto'

/** RFC 7638: the members that identify a key, by key type. */
const THUMBPRINT_MEMBERS: Record<string, string[]> = {
  OKP: ['crv', 'kty', 'x'],
  RSA: ['e', 'kty', 'n']
}

const ALGORITHMS: Record<string, string> = { OKP: 'EdDSA', RSA: 'RS256' }

export interface PublicJwk {
  kty: string
  kid: string
  use: 'sig'
  alg: string
  [member: string]: string
}

/**
 * The public JWK of a key, with its RFC 7638 thumbprint as the kid. The kid
 * follows from the key, so a new key gets a new kid without configuration.
 */
export function toPublicJwk(key: KeyObject): PublicJwk {
  const publicKey = key.type === 'public' ? key : createPublicKey(key)
  const jwk = publicKey.export({ format: 'jwk' }) as Record<string, string>
  const members = THUMBPRINT_MEMBERS[jwk.kty]
  if (!members) {
    throw new Error(`Cannot publish a ${jwk.kty} key`)
  }
  const canonical = JSON.stringify(
    Object.fromEntries(members.map((name) => [name, jwk[name]]))
  )
  return {
    ...jwk,
    kty: jwk.kty,
    kid: createHash('sha256').update(canonical).digest('base64url'),
    use: 'sig',
    alg: ALGORITHMS[jwk.kty]
  }
}

/** Reads the private key that core signs its requests to country config with. */
export function loadCoreSigningKey(pem: string | Buffer): CoreSigningKey {
  const privateKey = createPrivateKey(pem)
  if (privateKey.asymmetricKeyType !== 'ed25519') {
    throw new Error(
      `The core request-signing key must be Ed25519, not ${privateKey.asymmetricKeyType}`
    )
  }
  return { privateKey, keyid: toPublicJwk(privateKey).kid }
}
