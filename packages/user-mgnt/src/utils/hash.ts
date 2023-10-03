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
import { createHash } from 'crypto'

interface ISaltedHash {
  hash: string
  salt: string
}

export function generateRandomPassword(demoUser?: boolean) {
  if (!!demoUser) {
    return 'test'
  }

  const length = 6
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  let randomPassword = ''
  for (let i = 0; i < length; i += 1) {
    randomPassword += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return randomPassword
}
/*
 * In OCRVS-4979 we needed to change the hashing algorithm to conform latest security standards.
 * We still need to support users logging in with the old password hash to allow them to change their passwords to the new hash.
 *
 * TODO: In OpenCRVS 1.4, remove this check and force any users without new password hash to reset their password via sys admin.
 */
export function generateOldHash(content: string, salt: string): string {
  const hash = createHash('sha512')
  hash.update(salt)
  hash.update(content)
  return hash.digest('hex')
}

export function generateHash(content: string, salt: string): string {
  return bcrypt.hashSync(content, salt)
}

export function generateSaltedHash(password: string): ISaltedHash {
  const salt = bcrypt.genSaltSync(10)
  return {
    hash: generateHash(password, salt),
    salt
  }
}
