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
import {
  joinUrl,
  FullDocumentPath,
  UUID,
  IUserName,
  UserOrSystem,
  TokenUserType,
  logger,
  SystemRole
} from '@opencrvs/commons'
import { env } from '@events/environment'

type UserAPIResult = {
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
  fullHonorificName?: string
  practitionerId: string
  primaryOfficeId: UUID
  scope: string[]
  status: string
  creationDate: number
}

export async function getUser(
  userId: string,
  token: string
): Promise<UserAPIResult> {
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

  return res.json() as Promise<UserAPIResult>
}

type SystemAPIResult = {
  name: string
  createdBy: string
  username: string
  client_id: string
  status: string
  scope: string[]
  sha_secret: string
  type: SystemRole
}

export async function getSystem(
  systemId: string,
  token: string
): Promise<SystemAPIResult> {
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

  return res.json() as Promise<SystemAPIResult>
}

export async function getUserOrSystem(
  id: string,
  token: string
): Promise<UserOrSystem | undefined> {
  try {
    const user = await getUser(id, token)

    return {
      type: TokenUserType.enum.user,
      id: user.id,
      name: user.name,
      role: user.role,
      signature: user.signature ? user.signature : undefined,
      avatar: user.avatar?.data ? user.avatar.data : undefined,
      primaryOfficeId: user.primaryOfficeId,
      fullHonorificName: user.fullHonorificName
        ? user.fullHonorificName
        : undefined
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    logger.info(`No user found for id: ${id}. Will look for a system instead.`)
  }

  try {
    const system = await getSystem(id, token)

    return {
      type: TokenUserType.enum.system,
      id,
      name: system.name,
      role: system.type
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    logger.info(
      `No system found for id: ${id}. User/system has probably been removed. Will return undefined.`
    )
  }

  return
}
