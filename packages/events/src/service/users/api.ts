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
import { z } from 'zod'
import {
  DocumentPath,
  IUserName,
  SCOPES,
  TokenUserType,
  UUID,
  User,
  UserInput,
  UserOrSystem,
  hasScope,
  isUUID,
  joinUrl,
  logger,
  personNameFromV1ToV2,
  triggerUserEventNotification
} from '@opencrvs/commons'
import { env } from '@events/environment'
import {
  getSystemByLegacyId,
  getSystemClientById
} from '@events/storage/postgres/events/system-clients'
import {
  getUserById,
  createUserWithCredentials,
  searchUsersWithInput,
  activateUserWithCredentials
} from '@events/storage/postgres/events/users'
import { generateSaltedHash, generateHash } from '@events/service/auth/hash'
import { generateUsername } from './users'

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
  emailForNotification: string
  mobile: string
  role: string
  fullHonorificName?: string
  practitionerId: string
  primaryOfficeId: UUID
  scope: string[]
  status: string
  creationDate: number
}

export type SearchUsersPayload = {
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
    device: user.device ?? undefined,
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
  payload: SearchUsersPayload
): Promise<User[]> {
  const results = await searchUsersWithInput(payload)

  return results.map((user) => ({
    type: TokenUserType.enum.user,
    id: user.id,
    name: [
      {
        use: 'en',
        given: [user.firstname ?? ''],
        family: user.surname ?? ''
      }
    ],
    role: user.role,
    signature: user.signaturePath
      ? (user.signaturePath as DocumentPath)
      : undefined,
    avatar: user.profileImagePath
      ? (user.profileImagePath as DocumentPath)
      : undefined,
    primaryOfficeId: user.officeId,
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

function hasDemoScope(request: string): boolean {
  return hasScope(request, SCOPES.DEMO)
}

function generateRandomPassword(demoUser?: boolean) {
  if (!!demoUser) {
    return 'test'
  }

  const length = 6
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  let randomPassword = ''
  for (let i = 0; i < length; i += 1) {
    randomPassword += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return randomPassword
}

export async function sendCredentialsNotification(
  userFullName: IUserName[],
  username: string,
  password: string,
  token: string,
  msisdn?: string,
  email?: string
) {
  try {
    await triggerUserEventNotification({
      event: 'user-created',
      payload: {
        recipient: {
          name: personNameFromV1ToV2(userFullName),
          email,
          mobile: msisdn
        },
        username,
        temporaryPassword: password
      },
      countryConfigUrl: env.COUNTRY_CONFIG_URL,
      authHeader: { Authorization: token }
    })
  } catch (err) {
    logger.error(`Unable to send notification for error : ${err}`)
  }
}

export async function createUser(input: CreateUserPayload, _token: string) {
  const englishName = input.name.find((n) => n.use === 'en') ?? input.name[0]

  // Hash the provided password, or generate a random placeholder for pending
  // users who will set their own password via the activation flow.
  const password =
    input.password ?? generateRandomPassword(hasDemoScope(_token))
  const { hash, salt } = await generateSaltedHash(password)

  const userPayload = {
    firstname: englishName?.given[0] ?? null,
    surname: englishName?.family ?? null,
    email: input.email ?? null,
    fullHonorificName: input.fullHonorificName ?? null,
    role: input.role,
    device: input.device ?? null,
    officeId: input.primaryOfficeId as UUID,
    mobile: input.mobile ?? null,
    status: input.status ?? 'pending'
  }

  const userCredentialPayload = {
    username: input.username ?? (await generateUsername(input.name)),
    passwordHash: hash,
    salt,
    securityQuestions: []
  }

  const postgresId = await createUserWithCredentials(
    userPayload,
    userCredentialPayload
  )

  sendCredentialsNotification(
    input.name,
    userCredentialPayload.username,
    password,
    _token,
    userPayload.mobile ?? undefined,
    userPayload.email
  )

  return getUser(postgresId)
}

export async function activateUser(input: {
  userId: string
  password: string
  securityQNAs: { questionKey: string; answer: string }[]
}): Promise<void> {
  const { hash, salt } = await generateSaltedHash(input.password)

  const securityQuestions = await Promise.all(
    input.securityQNAs.map(async (qna) => ({
      questionKey: qna.questionKey,
      answerHash: await generateHash(qna.answer.toLowerCase(), salt)
    }))
  )

  await activateUserWithCredentials(input.userId, hash, salt, securityQuestions)
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
