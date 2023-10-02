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
import { inspect } from 'util'

export function raise(msg: string): never {
  console.log(msg)
  process.exit(1)
}

export function parseGQLResponse<T>(
  response: { data: T } | { errors: Array<{ message: string }> }
) {
  if ('errors' in response) {
    raise(inspect(response.errors))
  }
  return response.data
}
