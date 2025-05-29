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

interface IUserName {
  use: string
  family: string
  given: string[]
}

type ObjectId = string

/*
 * Let's add more fields as they are needed
 */
type User = {
  name: IUserName[]
  username: string
  email: string
  role: ObjectId
  practitionerId: string
  primaryOfficeId: string
  scope: string[]
  status: string
  creationDate: number
  signature?: string
}

export async function getUser(
  userManagementHost: string,
  userId: string,
  token: string
) {
  const hostWithTrailingSlash = userManagementHost.endsWith('/')
    ? userManagementHost
    : userManagementHost + '/'

  const res = await fetch(new URL('getUser', hostWithTrailingSlash).href, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })

  if (!res.ok) {
    throw new Error(
      `Unable to retrieve user details. Error: ${res.status} status received`
    )
  }

  return res.json() as Promise<User>
}
