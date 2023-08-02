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
export function raise(msg: string): never {
  console.log(msg)
  process.exit(1)
}

export function parseGQLResponse<T>(
  response: { data: T } | { errors: Array<{ message: string }> }
) {
  if ('errors' in response) {
    raise(JSON.stringify(response.errors))
  }
  return response.data
}
