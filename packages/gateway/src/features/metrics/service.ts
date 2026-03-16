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
import fetch from '@gateway/fetch'
import { METRICS_URL } from '@gateway/constants'
import { IAuthHeader } from '@opencrvs/commons'

export async function postMetrics(
  path: string,
  body: Record<string, unknown>,
  authHeader: IAuthHeader
) {
  const res = await fetch(`${METRICS_URL}${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })
  if (!res.ok) {
    throw new Error(`Metrics request to ${path} failed with status ${res.status}`)
  }
  return res.json()
}
