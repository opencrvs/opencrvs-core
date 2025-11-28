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

import { EventDocument } from '@opencrvs/commons'

// For PoC: ES256 keypair in env or config
const issuer = 'http://localhost:7070/openid4vc' // or did:web, etc.

const privateJwk = {
  // minimal PoC; load from env / secrets in real code
  kty: 'EC',
  crv: 'P-256'
  // d, x, y...
}

// actually `CryptoKey` but for PoC can't import this from Jose
let privateKeyPromise: Promise<unknown> | null = null
async function getPrivateKey() {
  const { importJWK } = await import('jose')

  if (!privateKeyPromise) {
    privateKeyPromise = importJWK(privateJwk, 'ES256')
  }
  return privateKeyPromise
}

export async function signBirthCertificateVc(params: {
  subjectId: string
  event: EventDocument
}) {
  const { SignJWT } = await import('jose')
  const { subjectId, event } = params
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 10 * 365 * 24 * 60 * 60 // 10 years PoC

  const vcPayload = {
    iss: issuer,
    sub: subjectId,
    nbf: now,
    iat: now,
    exp,
    jti: event.id, // or some VC id
    vc: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1'
        // your custom context if needed
      ],
      type: ['VerifiableCredential', 'BirthCertificateCredential'],
      credentialSubject: {
        id: subjectId,
        givenName: 'Pyry',
        familyName: 'Rouvila',
        dateOfBirth: '1998-01-01',
        placeOfBirth: 'Helsinki, Finland'
      }
    }
  }

  const key = await getPrivateKey()

  return new SignJWT(vcPayload)
    .setProtectedHeader({ alg: 'ES256', typ: 'JWT' })
    .sign(key)
}
