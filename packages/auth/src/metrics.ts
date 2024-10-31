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
import { env } from './environment'
import { resolve } from 'url'

export async function postUserActionToMetrics(
  action: string,
  token: string,
  remoteAddress: string,
  userAgent: string,
  practitionerId?: string
) {
  const url = resolve(env.METRICS_URL, '/audit/events')
  const body = { action: action, practitionerId }
  const authentication = 'Bearer ' + token

  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: authentication,
      'x-real-ip': remoteAddress,
      'x-real-user-agent': userAgent
    }
  })
}
