/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { readFile } from 'fs'
import { join } from 'path'
import { lookup } from 'mime-types'

export async function getAssest(file: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    readFile(join(__dirname, `./files/${file}`), (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

export function getAssestMimeType(file: string) {
  return lookup(join(__dirname, `./files/${file}`)) as string
}
