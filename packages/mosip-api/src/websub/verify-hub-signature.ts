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
import { createHmac, timingSafeEqual } from 'node:crypto'
import { env } from '../constants'

/**
 * WebSub content-distribution signature.
 *
 * We subscribe with `hub.secret` (see `subscribe.ts`), so per the WebSub spec
 * the hub signs every delivery with an HMAC of the request body keyed by that
 * secret, sent as `X-Hub-Signature: <method>=<hex>`. MOSIP's hub sends
 * `sha256=<hex>`.
 *
 * This is what establishes that a callback actually came from MOSIP. Decrypting
 * the credential does not: the payload is encrypted to OpenCRVS's public
 * certificate, which MOSIP holds and which is not a secret, so anyone with it
 * could otherwise post a credential of their own making.
 *
 * https://www.w3.org/TR/websub/#authenticated-content-distribution
 */

/** Digest algorithms a hub may name in the header, mapped to Node's names. */
const SUPPORTED_METHODS: Record<string, string> = {
  sha1: 'sha1',
  sha256: 'sha256',
  sha384: 'sha384',
  sha512: 'sha512'
}

export const verifyHubSignatureOrThrow = (
  signature: string | string[] | undefined,
  body: Buffer | undefined
) => {
  if (!signature) {
    throw new Error('❌ Missing X-Hub-Signature header')
  }

  // Which of several headers to trust is not ours to guess.
  if (Array.isArray(signature)) {
    throw new Error('❌ Multiple X-Hub-Signature headers')
  }

  if (!body) {
    throw new Error('❌ Cannot verify X-Hub-Signature without the raw body')
  }

  const [method, received] = signature.split('=')
  const algorithm = SUPPORTED_METHODS[method]

  if (!algorithm || !received) {
    throw new Error(`❌ Unsupported X-Hub-Signature format: ${signature}`)
  }

  const expected = createHmac(algorithm, env.MOSIP_WEBSUB_SECRET)
    .update(body)
    .digest('hex')

  const receivedBytes = Buffer.from(received, 'hex')
  const expectedBytes = Buffer.from(expected, 'hex')

  // `timingSafeEqual` throws on a length mismatch, so check that separately.
  if (
    receivedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(receivedBytes, expectedBytes)
  ) {
    throw new Error('❌ X-Hub-Signature does not match')
  }
}
