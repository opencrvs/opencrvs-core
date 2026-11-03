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

/**
 * Core signs every request it sends to country config with one fixed profile
 * of RFC 9421 (HTTP Message Signatures). The verifier accepts only that
 * profile: anything else is rejected, not negotiated.
 *
 * The signature covers the method, the path, the query and the
 * `Content-Digest` header (RFC 9530), so a captured request cannot be sent to
 * another route or with another body. It can be replayed unchanged within
 * `MAX_SIGNATURE_AGE_SECONDS`; the verifier keeps no record of seen
 * signatures.
 */
import { createHash, KeyObject, sign, verify } from 'node:crypto'

const LABEL = 'core'
const COMPONENTS = '("@method" "@path" "@query" "content-digest")'
const TAG = 'opencrvs-core-request'
export const MAX_SIGNATURE_AGE_SECONDS = 300

/** Only `created` and `keyid` vary; the rest must equal `signatureParams`. */
const SIGNATURE_PARAMS_VALUES = /;created=(\d+);keyid="([^"]+)";/
const SIGNATURE = new RegExp(`^${LABEL}=:([A-Za-z0-9+/]+={0,2}):$`)

export const REJECTION = {
  UNSUPPORTED_SIGNATURE: 'Missing or unsupported core request signature',
  OUTSIDE_TIME_WINDOW: 'Signature is too old or in the future',
  UNKNOWN_KEYID: 'No public key for the keyid',
  WRONG_SIGNATURE: 'Signature does not match the request',
  WRONG_BODY: 'Body does not match Content-Digest'
} as const

/** `Content-Digest` value for a body: the SHA-256 of its raw bytes. */
export function contentDigest(body: Buffer | string) {
  return `sha-256=:${createHash('sha256').update(body).digest('base64')}:`
}

function signatureParams(created: number, keyid: string) {
  return `${COMPONENTS};created=${created};keyid="${keyid}";alg="ed25519";tag="${TAG}"`
}

function signatureBase(
  method: string,
  path: string,
  query: string,
  digest: string,
  params: string
) {
  return Buffer.from(
    [
      `"@method": ${method.toUpperCase()}`,
      `"@path": ${path}`,
      `"@query": ${query || '?'}`,
      `"content-digest": ${digest}`,
      `"@signature-params": ${params}`
    ].join('\n')
  )
}

export interface SignCoreRequestInput {
  method: string
  /** Absolute path, as sent on the request line, e.g. `/config/events`. */
  path: string
  /** Query with its leading `?`, e.g. `?a=1`; empty when there is none. */
  query?: string
  /** The exact body that is sent; empty for requests without a body. */
  body?: Buffer | string
  privateKey: KeyObject
  keyid: string
  now?: number
}

export interface CoreRequestSignatureHeaders {
  'Content-Digest': string
  'Signature-Input': string
  Signature: string
}

/** Headers that prove a request comes from core. Send them with the exact `body`. */
export function signCoreRequest({
  method,
  path,
  query = '',
  body = '',
  privateKey,
  keyid,
  now = Date.now()
}: SignCoreRequestInput): CoreRequestSignatureHeaders {
  const params = signatureParams(Math.floor(now / 1000), keyid)
  const digest = contentDigest(body)
  const signature = sign(
    null,
    signatureBase(method, path, query, digest, params),
    privateKey
  )

  return {
    'Content-Digest': digest,
    'Signature-Input': `${LABEL}=${params}`,
    Signature: `${LABEL}=:${signature.toString('base64')}:`
  }
}

export interface CoreRequest {
  method: string
  path: string
  /** Query with its leading `?`, or empty. */
  query: string
  /** The body bytes as received, before any parsing. */
  rawBody: Buffer
  /** Request headers with lower-case names, as Node gives them. */
  headers: Record<string, string | string[] | undefined>
}

export type FindPublicKey = (keyid: string) => Promise<KeyObject | undefined>

export type CoreRequestVerification =
  | { valid: true; keyid: string }
  | { valid: false; reason: string }

function header(headers: CoreRequest['headers'], name: string) {
  const value = headers[name]
  return typeof value === 'string' ? value : undefined
}

/**
 * Checks everything except the body: the profile, the age, the key and the
 * signature over the request's `Content-Digest` header. The caller must still
 * compare that header with the digest of the received body
 * (`verifyCoreRequest` does both); this split lets a server check the
 * signature before it reads the body.
 */
export async function verifyCoreSignature(
  request: Omit<CoreRequest, 'rawBody'>,
  findPublicKey: FindPublicKey,
  now = Date.now()
): Promise<CoreRequestVerification> {
  const signatureInput = header(request.headers, 'signature-input') ?? ''
  const values = SIGNATURE_PARAMS_VALUES.exec(signatureInput)
  const signature = SIGNATURE.exec(header(request.headers, 'signature') ?? '')
  const digest = header(request.headers, 'content-digest')
  const params = values && signatureParams(Number(values[1]), values[2])
  if (
    !params ||
    signatureInput !== `${LABEL}=${params}` ||
    !signature ||
    !digest
  ) {
    return { valid: false, reason: REJECTION.UNSUPPORTED_SIGNATURE }
  }

  const [, created, keyid] = values
  if (Math.abs(now / 1000 - Number(created)) > MAX_SIGNATURE_AGE_SECONDS) {
    return { valid: false, reason: REJECTION.OUTSIDE_TIME_WINDOW }
  }

  const publicKey = await findPublicKey(keyid)
  if (!publicKey) {
    return { valid: false, reason: REJECTION.UNKNOWN_KEYID }
  }

  const base = signatureBase(
    request.method,
    request.path,
    request.query,
    digest,
    params
  )
  if (!verify(null, base, publicKey, Buffer.from(signature[1], 'base64'))) {
    return { valid: false, reason: REJECTION.WRONG_SIGNATURE }
  }

  return { valid: true, keyid }
}

/** True when the received body is the one the `Content-Digest` header names. */
export function matchesContentDigest(
  headers: CoreRequest['headers'],
  rawBody: Buffer
) {
  return header(headers, 'content-digest') === contentDigest(rawBody)
}

/** Checks that a request was signed by core, for exactly this method, path, query and body. */
export async function verifyCoreRequest(
  request: CoreRequest,
  findPublicKey: FindPublicKey,
  now = Date.now()
): Promise<CoreRequestVerification> {
  const result = await verifyCoreSignature(request, findPublicKey, now)
  if (result.valid && !matchesContentDigest(request.headers, request.rawBody)) {
    return { valid: false, reason: REJECTION.WRONG_BODY }
  }
  return result
}
