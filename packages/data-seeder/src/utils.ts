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
import fetch from 'node-fetch'
import { inspect } from 'util'
import { OPENHIM_URL } from './constants'

const MAX_RETRY = 5
const RETRY_DELAY_IN_MILLISECONDS = 5000

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

export async function delay(timeInMilliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMilliseconds)
  })
}

export async function verifyOpenHIMConnectivity() {
  let res
  for (let i = 1; i <= MAX_RETRY; i++) {
    try {
      res = await fetch(`${OPENHIM_URL}/ping`)
    } catch (err) {
      await delay(RETRY_DELAY_IN_MILLISECONDS)
    }
    if (res?.ok) {
      return
    }
  }
  raise('Please make sure openhim is running and try again')
}
