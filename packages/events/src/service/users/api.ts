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

import { randomUUID } from 'crypto'
import fetch from 'node-fetch'
import { z } from 'zod'
import {
  DocumentPath,
  IUserName,
  TokenUserType,
  UUID,
  User,
  UserInput,
  UserOrSystem,
  isUUID,
  joinUrl,
  logger
} from '@opencrvs/commons'
import { env } from '@events/environment'
import {
  getSystemByLegacyId,
  getSystemClientById
} from '@events/storage/postgres/events/system-clients'
import {
  getUserById,
  createUserWithCredentials
} from '@events/storage/postgres/events/users'
import { generateSaltedHash } from '@events/service/auth/hash'

type UserAPIResult = {
  id: string
  avatar?: {
    data: DocumentPath
    type: string
  }
  signature?: {
    data: DocumentPath
    type: string
  }
  device?: string
  name: IUserName[]
  username: string
  email: string
  mobile: string
  role: string
  fullHonorificName?: string
  practitionerId: string
  primaryOfficeId: UUID
  scope: string[]
  status: string
  creationDate: number
}

type SearchUsersPayload = {
  username?: string
  mobile?: string
  email?: string
  status?: string
  primaryOfficeId?: string
  locationId?: string
  count: number
  skip: number
  sortOrder: 'asc' | 'desc'
}

export type SearchUsersResult = {
  totalItems: number
  results: UserAPIResult[]
}

export async function getUser(
  userId: string
): Promise<User & { username: string }> {
  const user = await getUserById(userId)

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  const result = {
    type: TokenUserType.enum.user,
    id: user.id,
    name: [
      { use: 'en', given: [user.firstname ?? ''], family: user.surname ?? '' }
    ],
    role: user.role,
    email: user.email ?? undefined,
    mobile: user.mobile ?? undefined,
    username: user.username,
    status: user.status as User['status'],
    signature: user.signaturePath
      ? (user.signaturePath as DocumentPath)
      : undefined,
    avatar: user.profileImagePath
      ? (user.profileImagePath as DocumentPath)
      : undefined,
    primaryOfficeId: user.officeId,
    administrativeAreaId: user.administrativeAreaId ?? undefined,
    fullHonorificName: user.fullHonorificName ?? undefined
  }

  return result
}

export async function findUserOrSystem(
  id: string
): Promise<UserOrSystem | undefined> {
  try {
    return await getUser(id)
  } catch (e) {
    logger.info(
      `No user found for id: ${id}. Will look for a system instead. Error: ${e instanceof Error ? e.message : String(e)}`
    )
  }

  try {
    const system = isUUID(id)
      ? await getSystemClientById(id)
      : await getSystemByLegacyId(id)

    return {
      type: TokenUserType.enum.system,
      id,
      legacyId: system.legacyId ? system.legacyId : undefined,
      name: system.name
    }
  } catch (e) {
    logger.info(
      `No system found for id: ${id}. User/system has probably been removed. Will return undefined. Error: ${e instanceof Error ? e.message : String(e)}`
    )
  }

  return
}

export async function searchUsers(
  payload: SearchUsersPayload,
  token: string
): Promise<User[]> {
  const res = await fetch(
    joinUrl(env.USER_MANAGEMENT_URL, 'searchUsers').href,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
  )

  if (!res.ok) {
    throw new Error(
      `Unable to search users. Error: ${res.status} status received`
    )
  }

  const { results } = (await res.json()) as SearchUsersResult

  return results.map((user) => ({
    type: TokenUserType.enum.user,
    id: user.id,
    name: user.name,
    role: user.role,
    signature: user.signature?.data ? user.signature.data : undefined,
    avatar: user.avatar?.data ? user.avatar.data : undefined,
    primaryOfficeId: user.primaryOfficeId,
    status: user.status as User['status'],
    device: user.device ? user.device : undefined,
    fullHonorificName: user.fullHonorificName
      ? user.fullHonorificName
      : undefined
  }))
}

type CreateUserPayload = z.infer<typeof UserInput>

export async function updateUser(
  input: CreateUserPayload & { id: string },
  token: string
): Promise<User> {
  const res = await fetch(joinUrl(env.USER_MANAGEMENT_URL, 'updateUser').href, {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      signature: input.signature && {
        type: input.signature.type,
        data: input.signature.path
      }
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })

  if (!res.ok) {
    throw new Error(
      `Unable to update user. Error: ${res.status} status received`
    )
  }

  return getUser(input.id)
}

export async function createUser(input: CreateUserPayload, _token: string) {
  if (!input.username) {
    throw new Error('username is required')
  }

  const englishName = input.name.find((n) => n.use === 'en') ?? input.name[0]

  // Hash the provided password, or generate a random placeholder for pending
  // users who will set their own password via the activation flow.
  const { hash, salt } = await generateSaltedHash(
    input.password ?? randomUUID()
  )

  const postgresId = await createUserWithCredentials(
    {
      firstname: englishName?.given[0] ?? null,
      surname: englishName?.family ?? null,
      fullHonorificName: input.fullHonorificName ?? null,
      role: input.role,
      status: input.status ?? 'pending',
      email: input.email ?? null,
      mobile: input.mobile ?? null,
      officeId: input.primaryOfficeId as UUID
    },
    {
      username: input.username,
      passwordHash: hash,
      salt,
      securityQuestions: []
    }
  )

  return getUser(postgresId)
}

export async function activateUser(
  input: { userId: string; password: string; securityQNAs: unknown[] },
  token: string
) {
  const res = await fetch(
    joinUrl(env.USER_MANAGEMENT_URL, 'activateUser').href,
    {
      method: 'POST',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
  )

  if (!res.ok) {
    throw new Error(
      `Unable to change password. Error: ${res.status} status received`
    )
  }
}

export async function changeUserPhone(
  payload: { userId: string; phoneNumber: string },
  token: string
): Promise<void> {
  const res = await fetch(
    joinUrl(env.USER_MANAGEMENT_URL, 'changeUserPhone').href,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
  )

  if (!res.ok) {
    throw new Error(
      `Unable to change phone number. Error: ${res.status} status received`
    )
  }
}

export async function changeUserEmail(
  payload: { userId: string; email: string },
  token: string
): Promise<void> {
  const res = await fetch(
    joinUrl(env.USER_MANAGEMENT_URL, 'changeUserEmail').href,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
  )

  if (!res.ok) {
    throw new Error(
      `Unable to change email. Error: ${res.status} status received`
    )
  }
}

export async function changeUserAvatar(
  payload: { userId: string; avatar: { type: string; data: string } },
  token: string
) {
  const res = await fetch(
    joinUrl(env.USER_MANAGEMENT_URL, 'changeUserAvatar').href,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
  )

  if (!res.ok) {
    throw new Error(
      `Unable to change avatar. Error: ${res.status} status received`
    )
  }

  return res
}
