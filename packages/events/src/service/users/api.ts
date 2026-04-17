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
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {
  DocumentPath,
  IUserName,
  TokenUserType,
  UUID,
  User,
  UserInput,
  UserOrSystem,
  isUUID,
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
  getUsersByIds,
  createUserWithCredentials,
  searchUsersWithInput,
  activateUserWithCredentials,
  updateUserById,
  updateUsernameById,
  checkUsername,
  getUserCredentialsByUserId,
  SecurityQuestion
} from '@events/storage/postgres/events/users'
import { generateSaltedHash, generateHash } from '@events/service/auth/hash'

export type SearchUsersPayload = {
  username?: string
  mobile?: string
  email?: string
  status?: string
  primaryOfficeId?: UUID
  locationId?: UUID
  count: number
  skip: number
  sortOrder: 'asc' | 'desc'
}

async function generateUsername(
  names: UserInput['name'],
  existingUserName?: string
) {
  const { given = [], family = '' } =
    names.find((name) => name.use === 'en') || {}
  const initials = given.reduce(
    (accumulated, current) => accumulated + current.trim().charAt(0),
    ''
  )

  let proposedUsername = `${initials}${initials === '' ? '' : '.'}${family
    .trim()
    .replace(/ /g, '-')}`.toLowerCase()

  if (proposedUsername.length < 3) {
    proposedUsername =
      proposedUsername + '0'.repeat(3 - proposedUsername.length)
  }

  if (existingUserName && existingUserName === proposedUsername) {
    return proposedUsername
  }

  try {
    let usernameTaken = await checkUsername(proposedUsername)
    let i = 1
    const copyProposedName = proposedUsername
    while (usernameTaken) {
      if (existingUserName && existingUserName === proposedUsername) {
        return proposedUsername
      }
      proposedUsername = copyProposedName + i
      i += 1
      usernameTaken = await checkUsername(proposedUsername)
    }
  } catch (err) {
    logger.error(`Failed username generation: ${err}`)
    throw new Error('Failed username generation')
  }

  return proposedUsername
}

type DbUser = NonNullable<Awaited<ReturnType<typeof getUserById>>>

function mapDbUserToUser(user: DbUser): User & { username: string } {
  return {
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
}

export async function getUser(
  userId: string
): Promise<User & { username: string }> {
  const user = await getUserById(UUID.parse(userId))

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  return mapDbUserToUser(user)
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
  const existingUser = await getUserById(UUID.parse(input.id))

  if (!existingUser) {
    throw new Error(`No user found by given id: ${input.id}`)
  }

  // TODO: update FamilyName to single firstname and surname fields
  const englishName = input.name.find((n) => n.use === 'en') ?? input.name[0]
  const oldUsername = existingUser.username
  const newUsername = await generateUsername(input.name, existingUser.username)

  await updateUserById(UUID.parse(input.id), {
    firstname: englishName.given[0],
    surname: englishName.family,
    fullHonorificName: input.fullHonorificName,
    email: input.email,
    mobile: input.mobile,
    device: input.device,
    role: input.role,
    officeId: UUID.parse(input.primaryOfficeId),
    signaturePath: input.signature
      ? input.signature.path
      : existingUser.signaturePath
  })

  if (newUsername !== oldUsername) {
    await updateUsernameById(UUID.parse(input.id), newUsername)
    await triggerUserEventNotification({
      event: 'user-updated',
      payload: {
        recipient: {
          name: personNameFromV1ToV2(input.name),
          email: input.email,
          mobile: input.mobile
        },
        oldUsername,
        newUsername
      },
      countryConfigUrl: env.COUNTRY_CONFIG_URL,
      authHeader: { Authorization: token }
    })
  }

  return getUser(input.id)
}

function generateRandomPassword() {
  const length = 6
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  let randomPassword = ''
  for (let i = 0; i < length; i += 1) {
    randomPassword += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return randomPassword
}

async function sendCredentialsNotification(
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
    input.password ?? env.DEFAULT_USER_PASSWORD ?? generateRandomPassword()
  const { hash, salt } = await generateSaltedHash(password)

  const userPayload = {
    firstname: englishName.given[0],
    surname: englishName.family,
    email: input.email,
    fullHonorificName: input.fullHonorificName,
    role: input.role,
    device: input.device,
    officeId: UUID.parse(input.primaryOfficeId),
    mobile: input.mobile,
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

  await sendCredentialsNotification(
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

  const userId = UUID.parse(input.userId)
  await activateUserWithCredentials(userId, hash, salt, securityQuestions)
}

/**
 * Retrieves multiple users/systems by their IDs.
 *
 * If no user or system is found for an id, we leave them out of the result.
 * This is because a user might have been removed, and we don't want to throw an error in those cases.
 *
 * @param ids - Array of ids, which can be normal user or system ids
 * @param token - Authorization token for API requests
 * @returns Array of found users. If no users are found for some ids, we leave them out of the result.
 */
export const getUsersById = async (ids: string[]): Promise<UserOrSystem[]> => {
  if (ids.length === 0) {
    return []
  }

  const dbUsers = await getUsersByIds(ids)
  const foundUserIds = new Set(dbUsers.map((u) => u.id))

  const mappedUsers: UserOrSystem[] = dbUsers.map(mapDbUserToUser)

  const remainingIds = ids.filter((id) => !foundUserIds.has(id as UUID))
  const systems = await Promise.all(
    remainingIds.map(async (id) => {
      try {
        const system = isUUID(id)
          ? await getSystemClientById(id)
          : await getSystemByLegacyId(id)
        return {
          type: TokenUserType.enum.system,
          id,
          legacyId: system.legacyId ? system.legacyId : undefined,
          name: system.name
        } satisfies UserOrSystem
      } catch {
        return undefined
      }
    })
  )

  return [...mappedUsers, ...systems.filter((s) => s !== undefined)]
}

export function isUser(userOrSystem: UserOrSystem): userOrSystem is User {
  return userOrSystem.type === TokenUserType.enum.user
}

export const getCredentials = async (userId: string) => {
  const credentials = await getUserCredentialsByUserId(UUID.parse(userId))

  if (!credentials) {
    logger.error(`No user details found by given userid: ${userId}`)
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  if (credentials.status !== 'active') {
    logger.error(`User is not in active state for given userid: ${userId}`)
    // Don't return a 404 as this gives away that this user account exists
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return credentials
}

export const getSecurityQuestionsForUser = <
  T extends { securityQuestions: unknown }
>(
  record: T
): SecurityQuestion[] => {
  if (
    !Array.isArray(record.securityQuestions) ||
    record.securityQuestions.length === 0
  ) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: "User doesn't have security questions"
    })
  }
  return record.securityQuestions
}

export async function checkSecurityQuestionMatch({
  questions,
  input,
  salt
}: {
  questions: { questionKey: string; answerHash: string }[]
  input: { questionKey: string; answer: string }
  salt: string
}) {
  const target = questions.find((q) => q.questionKey === input.questionKey)

  if (!target) {
    return {
      matched: false,
      questionKey: questions[0]?.questionKey ?? input.questionKey
    }
  }

  const hash = await generateHash(input.answer.toLowerCase(), salt)
  const matched = hash === target.answerHash

  const fallback = questions.find(
    (q) => q.questionKey !== input.questionKey
  )?.questionKey

  return {
    matched,
    questionKey: matched ? input.questionKey : (fallback ?? input.questionKey)
  }
}
