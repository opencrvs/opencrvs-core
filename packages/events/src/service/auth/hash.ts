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

export function compare(password: string, hash: string) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

export async function generateHash(content: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(content, salt, (err, hash) => {
      if (err) {
        return reject(err)
      }
      resolve(hash)
    })
  })
}

export async function generateSaltedHash(password: string): Promise<SaltedHash> {
  const salt = await new Promise<string>((resolve, reject) => {
    bcrypt.genSalt(10, (err, generatedSalt) => {
      if (err) {
        return reject(err)
      }
      resolve(generatedSalt)
    })
  })

  return {
    hash: await generateHash(password, salt),
    salt
  }
}
