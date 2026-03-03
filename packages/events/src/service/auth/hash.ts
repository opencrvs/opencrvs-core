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

import * as bcrypt from 'bcryptjs'

interface SaltedHash {
  hash: string
  salt: string
}

export function generateHash(content: string, salt: string): string {
  return bcrypt.hashSync(content, salt)
}

export function generateSaltedHash(password: string): SaltedHash {
  const salt = bcrypt.genSaltSync(10)
  return {
    hash: generateHash(password, salt),
    salt
  }
}
