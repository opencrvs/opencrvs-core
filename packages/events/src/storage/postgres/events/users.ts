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
import { Kysely, sql } from 'kysely'
import { TRPCError } from '@trpc/server'
import { UUID } from '@opencrvs/commons/events'
import { getClient } from '@events/storage/postgres/events'
import { SearchUsersPayload } from '@events/service/users/api'
import { NewUsers } from './schema/app/Users'
import Schema from './schema/Database'
import { NewUserCredentials } from './schema/app/UserCredentials'

export interface SecurityQuestion {
  questionKey: string
  answerHash: string
}

export async function getUserByMobileOrEmail(
  params: { mobile: string } | { email: string }
) {
  const db = getClient()
  const query = db
    .selectFrom('users')
    .innerJoin('userCredentials', 'userCredentials.userId', 'users.id')
    .select([
      'users.id',
      'users.firstname',
      'users.surname',
      'users.mobile',
      'users.email',
      'users.role',
      'users.status',
      'userCredentials.username',
      'userCredentials.securityQuestions'
    ])

  if ('mobile' in params) {
    return query.where('users.mobile', '=', params.mobile).executeTakeFirst()
  }

  return query
    .where('users.email', '=', params.email.toLowerCase())
    .executeTakeFirst()
}

export async function getUserById(userId: UUID) {
  const db = getClient()
  return db
    .selectFrom('users')
    .innerJoin('userCredentials', 'userCredentials.userId', 'users.id')
    .innerJoin('locations', 'locations.id', 'users.officeId')
    .select([
      'users.id',
      'users.firstname',
      'users.surname',
      'users.fullHonorificName',
      'users.mobile',
      'users.email',
      'users.device',
      'users.role',
      'users.status',
      'users.officeId',
      'users.signaturePath',
      'users.profileImagePath',
      'users.data',
      'locations.administrativeAreaId',
      'userCredentials.username'
    ])
    .where('users.id', '=', userId)
    .executeTakeFirst()
}

export async function getUserCredentialsByUsername(username: string) {
  const db = getClient()
  return db
    .selectFrom('users')
    .innerJoin('userCredentials', 'userCredentials.userId', 'users.id')
    .select([
      'users.id',
      'users.firstname',
      'users.surname',
      'users.mobile',
      'users.email',
      'users.role',
      'users.status',
      'userCredentials.salt',
      'userCredentials.passwordHash'
    ])
    .where('userCredentials.username', '=', username)
    .executeTakeFirst()
}

export async function getUserCredentialsByUserId(userId: UUID) {
  const db = getClient()
  return db
    .selectFrom('users')
    .innerJoin('userCredentials', 'userCredentials.userId', 'users.id')
    .select([
      'users.id',
      'users.status',
      'userCredentials.salt',
      'userCredentials.passwordHash',
      'userCredentials.securityQuestions'
    ])
    .where('users.id', '=', userId)
    .where('users.status', '=', 'active')
    .executeTakeFirst()
}

export async function updatePasswordHash(userId: UUID, passwordHash: string) {
  const db = getClient()
  return db
    .updateTable('userCredentials')
    .set({ passwordHash })
    .where('userId', '=', userId)
    .execute()
}

async function createUserInTrx(user: NewUsers, trx: Kysely<Schema>) {
  const { id } = await trx
    .insertInto('users')
    .values(user)
    .onConflict((oc) => oc.column('legacyId').doNothing())
    .returning('id')
    .executeTakeFirstOrThrow()

  return id
}

async function createUserCredentialInTrx(
  cred: NewUserCredentials,
  trx: Kysely<Schema>
) {
  const { id } = await trx
    .insertInto('userCredentials')
    .values(cred)
    .returning('id')
    .executeTakeFirstOrThrow()

  return id
}

export async function createUserWithCredentials(
  user: NewUsers,
  cred: Omit<NewUserCredentials, 'userId'>
): Promise<UUID> {
  if (user.email) {
    user.email = user.email.toLowerCase()
  }
  const db = getClient()
  return db.transaction().execute(async (trx) => {
    const userId = await createUserInTrx(user, trx)
    await createUserCredentialInTrx({ ...cred, userId }, trx)
    return userId
  })
}

export async function searchUsersWithInput(input: SearchUsersPayload) {
  const db = getClient()

  let query = db
    .selectFrom('users')
    .innerJoin('userCredentials', 'userCredentials.userId', 'users.id')
    .innerJoin('locations', 'locations.id', 'users.officeId')
    .select([
      'users.id',
      'users.firstname',
      'users.surname',
      'users.email',
      'users.mobile',
      'users.device',
      'users.status',
      'userCredentials.username',
      'users.signaturePath',
      'users.role',
      'users.officeId',
      'users.profileImagePath',
      'users.fullHonorificName',
      'users.data',
      'locations.administrativeAreaId'
    ])

  if (input.username) {
    query = query.where(
      'userCredentials.username',
      'ilike',
      `%${input.username.toLowerCase()}%`
    )
  }

  if (input.mobile) {
    query = query.where('users.mobile', 'ilike', `%${input.mobile}%`)
  }

  if (input.email) {
    query = query.where(
      'users.email',
      'ilike',
      `%${input.email.toLowerCase()}%`
    )
  }

  if (input.status) {
    query = query.where('users.status', '=', input.status)
  }

  if (input.primaryOfficeId) {
    query = query.where('users.officeId', '=', input.primaryOfficeId)
  }

  const sortColumn = {
    createdAt: 'users.createdAt',
    firstname: 'users.firstname',
    surname: 'users.surname',
    username: 'userCredentials.username',
    email: 'users.email',
    status: 'users.status',
    role: 'users.role'
  } as const

  const result = await query
    .orderBy(sortColumn[input.sortBy], input.sortOrder)
    .limit(input.count)
    .offset(input.skip)
    .execute()

  return result
}

export async function isUsernameTaken(username: string) {
  const db = getClient()

  const query = db
    .selectFrom('userCredentials')
    .select('username')
    .where('username', '=', username)

  const user = await query.executeTakeFirst()
  return !!user
}

type UpdateUserFields = Partial<{
  firstname: string | null
  surname: string | null
  fullHonorificName: string | null
  email: string | null
  mobile: string | null
  device: string | null
  role: string
  status: string
  officeId: UUID
  signaturePath: string | null
  profileImagePath: string | null
  data: Record<string, unknown>
}>

export async function updateUserById(userId: UUID, fields: UpdateUserFields) {
  const db = getClient()
  if (fields.email) {
    fields.email = fields.email.toLowerCase()
  }
  return db.updateTable('users').set(fields).where('id', '=', userId).execute()
}

export async function updateUsernameById(userId: UUID, username: string) {
  const db = getClient()
  return db
    .updateTable('userCredentials')
    .set({ username })
    .where('userId', '=', userId)
    .execute()
}

export async function getUsersAndSystemsByIds(ids: string[]) {
  if (ids.length === 0) {
    return { users: [], systems: [] }
  }
  const legacyIds = ids.filter((id) => !UUID.safeParse(id).success)
  const uuidIds = ids.filter((id) => UUID.safeParse(id).success) as UUID[]
  const db = getClient()

  const usersQuery =
    uuidIds.length > 0
      ? db
          .selectFrom('users')
          .innerJoin('userCredentials', 'userCredentials.userId', 'users.id')
          .innerJoin('locations', 'locations.id', 'users.officeId')
          .select([
            'users.id',
            'users.firstname',
            'users.surname',
            'users.fullHonorificName',
            'users.mobile',
            'users.email',
            'users.device',
            'users.role',
            'users.status',
            'users.officeId',
            'users.signaturePath',
            'users.profileImagePath',
            'users.data',
            'locations.administrativeAreaId',
            'userCredentials.username'
          ])
          .where('users.id', 'in', uuidIds)
          .execute()
      : Promise.resolve([])

  const systemsQuery = db
    .selectFrom('systemClients')
    .select(['id', 'name', 'legacyId'])
    .where((eb) => {
      const conditions = [
        ...(uuidIds.length > 0 ? [eb('id', 'in', uuidIds)] : []),
        ...(legacyIds.length > 0 ? [eb('legacyId', 'in', legacyIds)] : [])
      ]
      return eb.or(conditions)
    })
    .execute()

  const [users, systems] = await Promise.all([usersQuery, systemsQuery])
  return { users, systems }
}

export async function activateUserWithCredentials(
  userId: UUID,
  passwordHash: string,
  salt: string,
  securityQuestions: SecurityQuestion[]
): Promise<void> {
  const db = getClient()
  await db.transaction().execute(async (trx) => {
    const user = await trx
      .selectFrom('users')
      .select(['users.id', 'users.status'])
      .where('users.id', '=', userId)
      .executeTakeFirst()

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `User not found with id: ${userId}`
      })
    }

    if (user.status !== 'pending') {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `User is not in pending state: ${userId}`
      })
    }

    await trx
      .updateTable('userCredentials')
      .set({
        passwordHash,
        salt,
        securityQuestions: sql`cast (${JSON.stringify(securityQuestions)} as jsonb)`
      })
      .where('userId', '=', userId)
      .execute()

    await trx
      .updateTable('users')
      .set({ status: 'active' })
      .where('id', '=', userId)
      .execute()
  })
}
