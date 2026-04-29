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
/* eslint-disable max-lines */
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {
  CreateUserInput,
  CreateUserInputInternal,
  DocumentPath,
  FamilyName,
  IUserName,
  TokenUserType,
  TriggerEvent,
  UUID,
  UpdateUserInput,
  User,
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
  getUsersAndSystemsByIds,
  createUserWithCredentials,
  searchUsersWithInput,
  activateUserWithCredentials,
  updateUserById,
  updateUsernameById,
  isUsernameTaken,
  getUserCredentialsByUserId,
  SecurityQuestion,
  getUserByMobileOrEmail,
  resetUserCredentialsAndStatus
} from '@events/storage/postgres/events/users'
import { generateSaltedHash, generateHash } from '@events/service/auth/hash'
import { updatePasswordHashAndSalt } from '@events/storage/postgres/events/users'
import { getRoles } from '../config/config'

export type UserSortBy =
  | 'createdAt'
  | 'firstname'
  | 'surname'
  | 'username'
  | 'email'
  | 'status'
  | 'role'

export type SearchUsersPayload = {
  username?: string
  mobile?: string
  email?: string
  status?: string
  primaryOfficeId?: UUID
  locationId?: UUID
  count: number
  skip: number
  sortBy: UserSortBy
  sortOrder: 'asc' | 'desc'
}

async function generateUsername(names: FamilyName, existingUserName?: string) {
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
    let usernameTaken = await isUsernameTaken(proposedUsername)
    let i = 1
    const copyProposedName = proposedUsername
    while (usernameTaken) {
      if (existingUserName && existingUserName === proposedUsername) {
        return proposedUsername
      }
      proposedUsername = copyProposedName + i
      i += 1
      usernameTaken = await isUsernameTaken(proposedUsername)
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
    fullHonorificName: user.fullHonorificName ?? undefined,
    data: Object.keys(user.data).length > 0 ? user.data : undefined
  }
}

export async function getUser(
  userId: string
): Promise<User & { username: string }> {
  const user = await getUserById(UUID.parse(userId))

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `User not found: ${userId}`
    })
  }

  return mapDbUserToUser(user)
}

export async function findUserOrSystem(
  id: UUID
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

  return results.map(mapDbUserToUser)
}

export async function updateUser(
  input: UpdateUserInput,
  token: string
): Promise<User> {
  const existingUser = await getUserById(input.id)

  if (!existingUser) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `User not found: ${input.id}`
    })
  }

  const name: IUserName[] = input.name ?? [
    {
      use: 'en',
      given: [existingUser.firstname ?? ''],
      family: existingUser.surname ?? ''
    }
  ]

  const oldUsername = existingUser.username
  const newUsername = await generateUsername(name, existingUser.username)

  await updateUserById(input.id, {
    firstname: personNameFromV1ToV2(name).firstname,
    surname: personNameFromV1ToV2(name).surname,
    fullHonorificName: input.fullHonorificName,
    email: input.email,
    mobile: input.mobile,
    device: input.device,
    status: input.status,
    role: input.role,
    officeId: input.primaryOfficeId,
    signaturePath: input.signature
      ? input.signature.path
      : existingUser.signaturePath,
    data: input.data
  })

  if (newUsername !== oldUsername) {
    await updateUsernameById(UUID.parse(input.id), newUsername)
    await triggerUserEventNotification({
      event: 'user-updated',
      payload: {
        recipient: {
          name: personNameFromV1ToV2(name),
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
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const length = 12
  // Rejection sampling eliminates modulo bias (256 % 62 = 8, so bytes 248-255 are discarded)
  const result: string[] = []
  const limit = 256 - (256 % charset.length)
  while (result.length < length) {
    const byte = randomBytes(1)[0]
    if (byte < limit) {
      result.push(charset[byte % charset.length])
    }
  }
  return result.join('')
}

async function sendCredentialsNotification(
  event: typeof TriggerEvent.USER_CREATED | typeof TriggerEvent.RESEND_INVITE,
  userFullName: IUserName[],
  username: string,
  password: string,
  token: string,
  msisdn?: string,
  email?: string
) {
  try {
    await triggerUserEventNotification({
      event,
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
    logger.error(`Unable to send ${event} notification for error : ${err}`)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Unable to send notification to for error : ${err}`
    })
  }
}

export const ResolvedCreateUserInput = CreateUserInput.extend({
  ...CreateUserInputInternal.shape,
  // Ensure defaults are resolved.
  password: z.string(),
  username: z.string(),
  status: z.enum(['active', 'pending'])
})
export type ResolvedCreateUserInput = z.infer<typeof ResolvedCreateUserInput>

export async function resolveCreateUserInput(
  input: CreateUserInput | CreateUserInputInternal
): Promise<ResolvedCreateUserInput> {
  return ResolvedCreateUserInput.parse({
    ...input,
    password:
      (input as CreateUserInputInternal).password ??
      env.DEFAULT_USER_PASSWORD ??
      generateRandomPassword(),
    status: (input as CreateUserInputInternal).status ?? 'pending',
    username: input.username ?? (await generateUsername(input.name))
  })
}

export async function createUser(
  input: CreateUserInput | CreateUserInputInternal,
  _token: string
) {
  const resolvedUser = await resolveCreateUserInput(input)
  const v2Name = personNameFromV1ToV2(resolvedUser.name)

  const userPayload = {
    firstname: v2Name.firstname,
    surname: v2Name.surname,
    // Normalise to undefined for the same reason as mobile above.
    email: resolvedUser?.email?.toLowerCase() || undefined,
    fullHonorificName: resolvedUser.fullHonorificName,
    role: resolvedUser.role,
    device: resolvedUser.device,
    officeId: resolvedUser.primaryOfficeId,
    // Normalise to undefined — PostgreSQL's unique constraint treats "" as a
    // duplicate, so any empty string must be stored as NULL instead.
    mobile: resolvedUser.mobile || undefined,
    status: resolvedUser.status,
    signaturePath: resolvedUser.signature?.path,
    data: resolvedUser.data ?? {}
  }

  // Hash the provided password, or generate a random placeholder for pending
  // users who will set their own password via the activation flow.
  const { hash, salt } = await generateSaltedHash(resolvedUser.password)
  const userCredentialPayload = {
    username: resolvedUser.username,
    passwordHash: hash,
    salt,
    securityQuestions: []
  }

  await sendCredentialsNotification(
    TriggerEvent.USER_CREATED,
    input.name,
    userCredentialPayload.username,
    resolvedUser.password,
    _token,
    userPayload.mobile ?? undefined,
    userPayload.email
  )

  const postgresId = await createUserWithCredentials(
    userPayload,
    userCredentialPayload
  )

  return getUser(postgresId)
}

export async function activateUser(input: {
  userId: UUID
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

export async function resendInvite(userId: UUID, token: string): Promise<void> {
  const user = await getUserById(userId)

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `User not found: ${userId}`
    })
  }

  if (user.status !== 'pending') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Can only resend invite to a user in pending status'
    })
  }

  const password = env.DEFAULT_USER_PASSWORD ?? generateRandomPassword()
  const { hash, salt } = await generateSaltedHash(password)

  const userName: IUserName[] = [
    {
      use: 'en',
      given: user.firstname ? [user.firstname] : [],
      family: user.surname ?? ''
    }
  ]

  await sendCredentialsNotification(
    TriggerEvent.RESEND_INVITE,
    userName,
    user.username,
    password,
    token,
    user.mobile ?? undefined,
    user.email ?? undefined
  )

  await resetUserCredentialsAndStatus(userId, hash, salt)
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
  const { users, systems } = await getUsersAndSystemsByIds(ids)

  const mappedUsers: UserOrSystem[] = users.map(mapDbUserToUser)
  const mappedSystems: UserOrSystem[] = systems.map((s) => ({
    type: TokenUserType.enum.system,
    id: s.id,
    legacyId: s.legacyId ?? undefined,
    name: s.name
  }))

  return [...mappedUsers, ...mappedSystems]
}

export function isUser(userOrSystem: UserOrSystem): userOrSystem is User {
  return userOrSystem.type === TokenUserType.enum.user
}

export const getCredentials = async (userId: UUID) => {
  const credentials = await getUserCredentialsByUserId(userId)

  if (!credentials) {
    logger.error(`No user details found by given userid: ${userId}`)
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
      questionKey: input.questionKey
    }
  }

  const hash = await generateHash(input.answer.toLowerCase(), salt)
  const matched = hash === target.answerHash

  // On a wrong answer, rotate to a different question so the same prompt
  // can't be brute-forced.
  const fallback = questions.find(
    (q) => q.questionKey !== input.questionKey
  )?.questionKey

  return {
    matched,
    questionKey: matched ? input.questionKey : (fallback ?? input.questionKey)
  }
}

export async function verifyUser(input: { mobile?: string; email?: string }) {
  const user = await getUserByMobileOrEmail(
    input.mobile ? { mobile: input.mobile } : { email: input.email ?? '' }
  )

  if (!user) {
    // Don't reveal whether the account exists
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const questions = getSecurityQuestionsForUser(user)

  const securityQuestionKey =
    questions[Math.floor(Math.random() * questions.length)].questionKey

  const roles = await getRoles()
  const scope = roles.find((r) => r.id === user.role)?.scopes ?? []

  return {
    id: user.id,
    username: user.username,
    mobile: user.mobile ?? undefined,
    email: user.email ?? undefined,
    status: user.status,
    name: [
      {
        use: 'en',
        given: [user.firstname ?? ''],
        family: user.surname ?? ''
      }
    ],
    securityQuestionKey,
    scope
  }
}

export async function sendResetPasswordInvite(
  userId: UUID,
  admin: { id: string; name: IUserName[]; role: string },
  token: string
): Promise<void> {
  const user = await getUser(userId)

  const temporaryPassword = generateRandomPassword()
  const { hash, salt } = await generateSaltedHash(temporaryPassword)
  await updatePasswordHashAndSalt(userId, hash, salt)

  const userName: IUserName[] = [
    {
      use: 'en',
      given: user.name[0]?.given ?? [],
      family: user.name[0]?.family ?? ''
    }
  ]

  try {
    await triggerUserEventNotification({
      event: 'reset-password-by-admin',
      payload: {
        recipient: {
          name: personNameFromV1ToV2(userName),
          email: user.email,
          mobile: user.mobile
        },
        temporaryPassword,
        admin: {
          id: admin.id,
          name: personNameFromV1ToV2(admin.name),
          role: admin.role
        }
      },
      countryConfigUrl: env.COUNTRY_CONFIG_URL,
      authHeader: { Authorization: token }
    })
  } catch (err) {
    logger.error(`Unable to send reset password notification for error: ${err}`)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Unable to send notification: ${err}`
    })
  }
}

export async function sendUsernameReminder(
  userId: UUID,
  token: string
): Promise<void> {
  const user = await getUser(userId)

  const userName: IUserName[] = [
    {
      use: 'en',
      given: user.name[0]?.given ?? [],
      family: user.name[0]?.family ?? ''
    }
  ]

  try {
    await triggerUserEventNotification({
      event: 'username-reminder',
      payload: {
        recipient: {
          name: personNameFromV1ToV2(userName),
          email: user.email,
          mobile: user.mobile
        },
        username: user.username
      },
      countryConfigUrl: env.COUNTRY_CONFIG_URL,
      authHeader: { Authorization: token }
    })
  } catch (err) {
    logger.error(
      `Unable to send username reminder notification for error: ${err}`
    )
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Unable to send notification: ${err}`
    })
  }
}
