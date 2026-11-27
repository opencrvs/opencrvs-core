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
import sodium from 'libsodium-wrappers'

// GitHub only accepts secrets encrypted with the public key of the repository or environment:
// a libsodium "sealed box" (X25519), base64 in and out.
export async function sealSecret(publicKeyBase64: string, value: string): Promise<string> {
  await sodium.ready
  const key = sodium.from_base64(publicKeyBase64, sodium.base64_variants.ORIGINAL)
  const sealed = sodium.crypto_box_seal(sodium.from_string(value), key)
  return sodium.to_base64(sealed, sodium.base64_variants.ORIGINAL)
}
