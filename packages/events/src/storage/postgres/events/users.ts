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
import { UUID } from '@opencrvs/commons/events'
import { getClient } from '@events/storage/postgres/events'
import { SearchUsersPayload } from '@events/service/users/api'
import { NewUsers } from './schema/app/Users'
import Schema from './schema/Database'
import { NewUserCredentials } from './schema/app/UserCredentials'

interface SecurityQuestion {
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

export type { SecurityQuestion }

export async function getUserById(userId: string) {
  const db = getClient()
  return db
    .selectFrom('users')
    .innerJoin('userCredentials', 'userCredentials.userId', 'users.id')
    .leftJoin('locations', 'locations.id', 'users.officeId')
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
      'locations.administrativeAreaId',
      'userCredentials.username'
    ])
    .where('users.id', '=', userId as UUID)
    .executeTakeFirst()
}

export async function getUserByUsername(username: string) {
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

export async function getUserCredentialsByUserId(userId: string) {
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
    .where('users.id', '=', userId as UUID)
    .executeTakeFirst()
}

export async function updatePasswordHash(userId: string, passwordHash: string) {
  const db = getClient()
  return db
    .updateTable('userCredentials')
    .set({ passwordHash })
    .where('userId', '=', userId as UUID)
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

export async function deleteSuperUser(username: string): Promise<void> {
  const db = getClient()
  await db.transaction().execute(async (trx) => {
    const user = await trx
      .selectFrom('users')
      .innerJoin('userCredentials', 'userCredentials.userId', 'users.id')
      .leftJoin('locations', 'locations.id', 'users.officeId')
      .select(['users.id', 'users.officeId', 'locations.administrativeAreaId'])
      .where('userCredentials.username', '=', username)
      .executeTakeFirst()

    if (!user) {
      return
    }

    // user_credentials are deleted via ON DELETE CASCADE
    await trx.deleteFrom('users').where('id', '=', user.id).execute()

    if (user.officeId) {
      await trx
        .deleteFrom('locations')
        .where('id', '=', user.officeId)
        .execute()
    }

    if (user.administrativeAreaId) {
      await trx
        .deleteFrom('administrativeAreas')
        .where('id', '=', user.administrativeAreaId as UUID)
        .execute()
    }
  })
}

export async function createUserWithCredentials(
  user: NewUsers,
  cred: Omit<NewUserCredentials, 'userId'>
): Promise<UUID> {
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
    .leftJoin('locations', 'locations.id', 'users.officeId')
    .select([
      'users.id',
      'users.firstname',
      'users.surname',
      'users.email',
      'users.mobile',
      'users.device',
      'users.status',
      'users.officeId',
      'userCredentials.username',
      'users.signaturePath',
      'users.role',
      'users.officeId',
      'users.status',
      'users.profileImagePath',
      'users.fullHonorificName'
    ])
    .orderBy('users.firstname', 'asc')

  // 🔍 Dynamic filters
  if (input.username) {
    query = query.where(
      'userCredentials.username',
      'ilike',
      `%${input.username}%`
    )
  }

  if (input.mobile) {
    query = query.where('users.mobile', 'ilike', `%${input.mobile}%`)
  }

  if (input.email) {
    query = query.where('users.email', 'ilike', `%${input.email}%`)
  }

  if (input.status) {
    query = query.where('users.status', '=', input.status)
  }

  if (input.primaryOfficeId) {
    query = query.where('users.officeId', '=', input.primaryOfficeId as UUID)
  }

  if (input.locationId) {
    query = query.where('locations.id', '=', input.locationId as UUID)
  }

  const result = await query
    .orderBy('users.createdAt', input.sortOrder)
    .limit(input.count)
    .offset(input.skip)
    .execute()

  return result
}

export async function checkUsername(username: string) {
  const db = getClient()

  const query = db
    .selectFrom('userCredentials')
    .select('username')
    .where('username', '=', username)

  const user = await query.executeTakeFirst()
  return !!user
}

export async function updateUserById(
  userId: string,
  fields: Partial<{
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
  }>
) {
  const db = getClient()
  return db
    .updateTable('users')
    .set(fields)
    .where('id', '=', userId as UUID)
    .execute()
}

export async function updateUsernameById(userId: string, username: string) {
  const db = getClient()
  return db
    .updateTable('userCredentials')
    .set({ username })
    .where('userId', '=', userId as UUID)
    .execute()
}

export async function activateUserWithCredentials(
  userId: string,
  passwordHash: string,
  salt: string,
  securityQuestions: Array<{ questionKey: string; answerHash: string }>
): Promise<void> {
  const db = getClient()
  await db.transaction().execute(async (trx) => {
    const user = await trx
      .selectFrom('users')
      .select(['users.id', 'users.status'])
      .where('users.id', '=', userId as UUID)
      .executeTakeFirst()

    if (!user) {
      throw new Error(`User not found: ${userId}`)
    }

    if (user.status !== 'pending') {
      throw new Error(`User is not in pending state: ${userId}`)
    }

    await trx
      .updateTable('userCredentials')
      .set({
        passwordHash,
        salt,
        securityQuestions: sql`cast (${JSON.stringify(securityQuestions)} as jsonb)`
      })
      .where('userId', '=', userId as UUID)
      .execute()

    await trx
      .updateTable('users')
      .set({ status: 'active' })
      .where('id', '=', userId as UUID)
      .execute()
  })
}
