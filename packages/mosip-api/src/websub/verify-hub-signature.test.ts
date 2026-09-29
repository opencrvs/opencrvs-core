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
import test, { it } from 'node:test'
import assert from 'node:assert'
import { createHmac } from 'node:crypto'
import { env } from '../constants'
import { verifyHubSignatureOrThrow } from './verify-hub-signature'

/*
 * That MOSIP's hub really produces `sha256=<hex>` over the verbatim request
 * body, keyed by `hub.secret`, was confirmed against a live MOSIP Collab
 * delivery: the recomputed digest matched the received header byte for byte,
 * with the raw body length equal to `content-length`. These tests pin the
 * behaviour that verification depends on.
 */

const rawBody = Buffer.from(
  JSON.stringify({
    publisher: 'CREDENTIAL_SERVICE',
    topic: 'CREDENTIAL_ISSUED'
  })
)

const sign = (body: Buffer, secret = env.MOSIP_WEBSUB_SECRET) =>
  `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`

test('X-Hub-Signature', async () => {
  await it('accepts a signature produced with the hub secret', () => {
    assert.doesNotThrow(() => verifyHubSignatureOrThrow(sign(rawBody), rawBody))
  })

  await it('rejects a signature produced with a different secret', () => {
    assert.throws(
      () =>
        verifyHubSignatureOrThrow(sign(rawBody, 'not-the-hub-secret'), rawBody),
      /does not match/
    )
  })

  // The point of the whole exercise: the body cannot be altered in transit.
  await it('rejects a body that does not match the signature', () => {
    const tampered = Buffer.concat([rawBody, Buffer.from(' ')])
    assert.throws(
      () => verifyHubSignatureOrThrow(sign(rawBody), tampered),
      /does not match/
    )
  })

  await it('rejects a missing header', () => {
    assert.throws(
      () => verifyHubSignatureOrThrow(undefined, rawBody),
      /Missing X-Hub-Signature/
    )
  })

  await it('rejects a truncated signature rather than comparing short', () => {
    assert.throws(
      () => verifyHubSignatureOrThrow(sign(rawBody).slice(0, 30), rawBody),
      /does not match/
    )
  })

  await it('rejects an unknown digest method', () => {
    assert.throws(
      () => verifyHubSignatureOrThrow('md5=deadbeef', rawBody),
      /Unsupported X-Hub-Signature format/
    )
  })

  // A body that was parsed but never retained must fail closed, not pass.
  await it('refuses to pass when the raw body was not captured', () => {
    assert.throws(
      () => verifyHubSignatureOrThrow(sign(rawBody), undefined),
      /without the raw body/
    )
  })
})
