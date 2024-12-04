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
import { AUTH_URL } from '@gateway/constants'
import { logger } from '@opencrvs/commons'
import fetch from 'node-fetch'

export default async function getPublicKey(): Promise<string> {
  const authUrl = new URL('/.well-known', AUTH_URL)
  const res = await fetch(authUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) {
    logger.error(await res.text())
    throw new Error(
      `Error occured when calling getPublicKey endpoint [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }
  return await res.text()
}
