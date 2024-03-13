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
import { USER_MANAGEMENT_URL } from '@auth/constants'
import { resolve } from 'url'

export async function changePassword(
  userId: string,
  password: string,
  remoteAddress: string,
  userAgent: string
) {
  const url = resolve(USER_MANAGEMENT_URL, '/changePassword')

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ userId, password }),
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': remoteAddress,
      'x-real-user-agent': userAgent
    }
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }
}
