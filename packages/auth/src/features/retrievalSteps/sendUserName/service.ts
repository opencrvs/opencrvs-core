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
import { NOTIFICATION_SERVICE_URL, JWT_ISSUER } from '@auth/constants'
import { resolve } from 'url'
import { IUserName, createToken } from '@auth/features/authenticate/service'

export async function sendUserName(
  username: string,
  userFullName: IUserName[],
  mobile?: string,
  email?: string
) {
  const url = resolve(NOTIFICATION_SERVICE_URL, '/retrieveUserName')
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ msisdn: mobile, email, username, userFullName }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await createToken(
        'auth',
        ['service'],
        ['opencrvs:notification-user', 'opencrvs:countryconfig-user'],
        JWT_ISSUER,
        true
      )}`
    }
  })
  if (res.status !== 200) {
    throw Error(`Unable to send username`)
  }
}
