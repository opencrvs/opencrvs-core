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
import { generateKeyPairSync } from 'crypto'
import { vi } from 'vitest'
import { signCoreRequest, toPublicJwk } from '@opencrvs/toolkit/request-signing'

const coreKey = generateKeyPairSync('ed25519').privateKey
const coreJwk = toPublicJwk(coreKey)

/** Serves the test key as auth's key list. Call before `createServer`. */
export function publishCoreKey() {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ keys: [coreJwk] }))
  )
}

/** A request as core sends it: the JSON body and the signature for it. */
export function asCore(method: string, url: string, payload?: unknown) {
  const body = payload === undefined ? undefined : JSON.stringify(payload)
  return {
    method,
    url,
    payload: body,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...signCoreRequest({
        method,
        path: url,
        body,
        privateKey: coreKey,
        keyid: coreJwk.kid
      })
    }
  }
}
