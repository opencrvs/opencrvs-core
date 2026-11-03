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
import { createPublicKey, KeyObject } from 'crypto'
import { readFileSync } from 'fs'
import { toPublicJwk } from '@opencrvs/commons/request-signing'
import { env } from '@auth/environment'
import { coreSigningKey } from '@auth/request-signing'

/**
 * The public keys of core: the one that verifies user tokens and the ones
 * that verify core's signed requests to country config. A previous
 * request-signing key stays published while senders move to a new one.
 */
export function publishedKeys({
  jwtPublicKey,
  requestSigningKey,
  previousRequestSigningKey
}: {
  jwtPublicKey: KeyObject
  requestSigningKey: KeyObject
  previousRequestSigningKey?: KeyObject
}) {
  return [jwtPublicKey, requestSigningKey, previousRequestSigningKey]
    .filter((key) => key !== undefined)
    .map(toPublicJwk)
}

const keys = publishedKeys({
  jwtPublicKey: createPublicKey(readFileSync(env.CERT_PUBLIC_KEY_PATH)),
  requestSigningKey: coreSigningKey.privateKey,
  previousRequestSigningKey: env.CORE_REQUEST_SIGNING_PREVIOUS_KEY_PATH
    ? createPublicKey(readFileSync(env.CORE_REQUEST_SIGNING_PREVIOUS_KEY_PATH))
    : undefined
})

export function jwksHandler() {
  return { keys }
}
