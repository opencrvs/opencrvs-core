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
import { parseString } from 'fast-csv'

export type PlainObject = {
  [key: string]: string
}

export function csvToJSON(csv: string): Promise<PlainObject[]> {
  return new Promise((resolve, reject) => {
    const result = [] as any[]
    parseString(csv, { headers: false })
      .on('error', (error) => reject(error))
      .on('data', (row) => result.push(row))
      .on('end', () => resolve(result))
  })
}
