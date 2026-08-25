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

/*
 * The native binding rather than `bcryptjs`, because bcrypt is deliberately
 * expensive and this service runs on one JS thread. `bcryptjs` computes on that
 * thread, so every login delayed every other in-flight request: profiling an
 * e2e run put 18% of all CPU time in its `_encipher`. The native version hands
 * the work to the libuv threadpool, which both frees the loop and lets hashes
 * run in parallel.
 *
 * Output is byte-identical to `bcryptjs` for a given salt, so stored hashes
 * keep verifying — worth re-checking if this is ever swapped again, since
 * verifyPasswordById compares hash strings rather than calling compare().
 */
import * as bcrypt from 'bcrypt'

const SALT_ROUNDS = 10
/*
 * `bcryptjs` minted '$2a$' salts and the native default is '$2b$'. Both
 * implementations agree on either prefix, so this is only to keep newly stored
 * salts in the same shape as the existing ones.
 */
const SALT_VERSION = 'a'

interface SaltedHash {
  hash: string
  salt: string
}

export async function compare(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function generateHash(
  content: string,
  salt: string
): Promise<string> {
  return bcrypt.hash(content, salt)
}

export async function generateSaltedHash(
  password: string
): Promise<SaltedHash> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS, SALT_VERSION)

  return {
    hash: await generateHash(password, salt),
    salt
  }
}
