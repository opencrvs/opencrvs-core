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
import { joinUrl, FullDocumentPath, UUID, IUserName } from '@opencrvs/commons'
import { logger } from '@opencrvs/commons'
import { env } from '@events/environment'

export type User = {
  id: string
  avatar?: {
    data: FullDocumentPath
    type: string
  }
  signature?: FullDocumentPath
  name: IUserName[]
  username: string
  email: string
  role: string
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

export async function getUser(userId: string, token: string): Promise<User> {
  const res = await fetch(joinUrl(env.USER_MANAGEMENT_URL, 'getUser').href, {
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

// @todo cihan remove the knipignore
/** @knipignore */
export async function getSystem(
  systemId: string,
  token: string
): Promise<System> {
  const res = await fetch(joinUrl(env.USER_MANAGEMENT_URL, 'getSystem').href, {
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

export interface UserDetails {
  id: string
  name: IUserName[]
  role: string
  signature?: string
  avatar?: string
  primaryOfficeId?: UUID
}

export async function getUserOrSystem(
  id: string,
  token: string
): Promise<UserDetails | undefined> {
  try {
    const user = await getUser(id, token)

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      signature: user.signature ? user.signature : undefined,
      avatar: user.avatar?.data ? user.avatar.data : undefined,
      primaryOfficeId: user.primaryOfficeId
    }
  } catch (e) {
    logger.info(`No user found for id: ${id}. Will look for a system instead.`)
  }

  try {
    const system = await getSystem(id, token)

    return {
      id,
      name: [{ use: system.name, given: [], family: '' }],
      role: system.type
    }
  } catch (e) {
    logger.info(
      `No system found for id: ${id}. User/system has probably been removed. Will return undefined.`
    )
  }

  return
}
