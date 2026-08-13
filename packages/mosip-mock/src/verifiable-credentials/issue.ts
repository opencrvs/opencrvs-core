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
import { FlattenedSign } from 'jose'
import { randomUUID, createPrivateKey } from 'node:crypto'
import canonicalize from 'canonicalize'
import { env, PRIVATE_KEY } from '../constants'

const ISSUER = `${env.ISSUER_URL}/.well-known/controller.json`
export const PUBLIC_KEY_URL = `${env.ISSUER_URL}/.well-known/public-key.json`

/**
 * Issues a mock verifiable credential conforming to MOSIP standards. This is _not securely proofed_ as it's an mock. If it is, it's by accident.
 * Do not use this as a reference for production code.
 */
export async function issueVerifiableCredential(
  subject: Record<string, string>
) {
  const privateKey = createPrivateKey(PRIVATE_KEY)
  const issuanceDate = new Date().toISOString()

  const unsignedVC = {
    issuanceDate,
    credentialSubject: subject,
    id: `http://credential.idrepo/credentials/${randomUUID()}`,
    type: ['VerifiableCredential', 'MOSIPVerifiableCredential'],
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      `${env.ISSUER_URL}/.well-known/mosip-context.json`,
      { sec: 'https://w3id.org/security#' }
    ],
    issuer: ISSUER
  }

  const canonicalPayload = canonicalize(unsignedVC)

  const payloadBytes = new TextEncoder().encode(canonicalPayload)

  const protectedHeader = {
    alg: 'PS256',
    b64: false,
    crit: ['b64'],
    kid: PUBLIC_KEY_URL
  }

  const { protected: encodedHeader, signature } = await new FlattenedSign(
    payloadBytes
  )
    .setProtectedHeader(protectedHeader)
    .sign(privateKey)

  const detachedJws = `${encodedHeader}..${signature}`

  return {
    ...unsignedVC,
    proof: {
      type: 'RsaSignature2018',
      created: issuanceDate,
      proofPurpose: 'assertionMethod',
      verificationMethod: PUBLIC_KEY_URL,
      jws: detachedJws
    }
  }
}
