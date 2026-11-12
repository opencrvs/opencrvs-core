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
import { createPublicKey, JsonWebKey, KeyObject } from 'node:crypto'

const REFETCH_INTERVAL_MS = 60_000
const STARTUP_RETRY_INTERVAL_MS = 5_000

interface CoreKeyListOptions {
  /** Auth's key list, e.g. `http://auth:4040/.well-known/jwks.json`. */
  jwksUrl: string
  fetch?: (url: string) => Promise<Response>
  now?: () => number
  /** Called when a fetch of the list fails; the lookup then uses the known keys. */
  onFetchError?: (error: unknown) => void
}

/** Only Ed25519 signature keys can verify core requests; the JWT key is RSA. */
function toRequestSigningKey(jwk: JsonWebKey): Array<[string, KeyObject]> {
  if (
    typeof jwk.kid !== 'string' ||
    jwk.kty !== 'OKP' ||
    jwk.crv !== 'Ed25519' ||
    (jwk.use !== undefined && jwk.use !== 'sig') ||
    (jwk.alg !== undefined && jwk.alg !== 'EdDSA')
  ) {
    return []
  }
  try {
    return [[jwk.kid, createPublicKey({ key: jwk, format: 'jwk' })]]
  } catch {
    return []
  }
}

/**
 * Auth's request-signing public keys, by kid. A lookup of a kid that is not
 * in the list fetches the list again, so a new key is picked up without a
 * restart. Fetches happen at most once a minute, so requests with made-up
 * kids cannot flood auth; a failed fetch keeps the known keys. Until the
 * first list arrives the wait is 5 seconds instead, so a country config that
 * starts before auth does not reject core for a minute.
 */
export function createCoreKeyList({
  jwksUrl,
  fetch: fetchKeys = fetch,
  now = Date.now,
  onFetchError = () => undefined
}: CoreKeyListOptions) {
  let keys = new Map<string, KeyObject>()
  let loaded = false
  let attemptedAt: number | undefined
  let pending: Promise<void> | undefined

  async function load() {
    attemptedAt = now()
    const response = await fetchKeys(jwksUrl)
    if (!response.ok) {
      throw new Error(`${jwksUrl} returned ${response.status}`)
    }
    const body = (await response.json()) as { keys?: JsonWebKey[] }
    keys = new Map((body.keys ?? []).flatMap(toRequestSigningKey))
    loaded = true
  }

  /** Fetches the list now; concurrent callers share one request. Rejects when the fetch fails. */
  function refresh() {
    pending ??= load().finally(() => {
      pending = undefined
    })
    return pending
  }

  function mayFetch() {
    const wait = loaded ? REFETCH_INTERVAL_MS : STARTUP_RETRY_INTERVAL_MS
    return attemptedAt === undefined || now() - attemptedAt >= wait
  }

  async function findPublicKey(keyid: string) {
    const known = keys.get(keyid)
    if (known) {
      return known
    }
    if (pending || mayFetch()) {
      await refresh().catch(onFetchError)
    }
    return keys.get(keyid)
  }

  return { findPublicKey, refresh }
}
