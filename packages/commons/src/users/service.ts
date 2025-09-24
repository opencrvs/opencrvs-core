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
import { UUID } from '../uuid'
import { FullDocumentPath } from '../documents'
import { joinUrl } from '../url'

export interface IUserName {
  use: string
  family: string
  given: string[]
}

type ObjectId = string

/*
 * Let's add more fields as they are needed
 */
type User = {
  id: string
  avatar?: {
    data: FullDocumentPath
    type: string
  }
  signature?: FullDocumentPath
  name: IUserName[]
  username: string
  email: string
  role: ObjectId
  fullHonorificName?: string
  practitionerId: string
  primaryOfficeId: UUID
  scope: string[]
  status: string
  creationDate: number
}
type System = {
  name: string
  createdBy: string
  username: string
  client_id: string
  status: string
  scope: string[]
  sha_secret: string
  type: string
}

export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with id ${userId} not found`)
    this.name = 'UserNotFoundError'
  }
}

export async function getUser(
  userManagementHost: string,
  userId: string,
  token: string
) {
  const res = await fetch(joinUrl(userManagementHost, 'getUser').href, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })

  if (res.status === 404) {
    throw new UserNotFoundError(userId)
  }

  if (!res.ok) {
    throw new Error(
      `Unable to retrieve user details. Error: ${res.status} status received`
    )
  }

  return res.json() as Promise<User>
}

export async function getSystem(
  userManagementHost: string,
  systemId: string,
  token: string
) {
  const hostWithTrailingSlash = userManagementHost.endsWith('/')
    ? userManagementHost
    : userManagementHost + '/'

  const res = await fetch(new URL('getSystem', hostWithTrailingSlash).href, {
    method: 'POST',
    body: JSON.stringify({ systemId }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })

  if (!res.ok) {
    throw new Error(
      `Unable to retrieve system details. Error: ${res.status} status received`
    )
  }

  return res.json() as Promise<System>
}
