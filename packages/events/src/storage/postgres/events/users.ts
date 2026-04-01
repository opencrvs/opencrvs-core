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
import { Kysely } from 'kysely'
import { getClient } from '@events/storage/postgres/events'
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

export async function createUserInTrx(user: NewUsers, trx: Kysely<Schema>) {
  const { id } = await trx
    .insertInto('users')
    .values(user)
    .onConflict((oc) => oc.column('legacyId').doNothing())
    .returning('id')
    .executeTakeFirstOrThrow()

  return id
}

export async function createUserCredentialInTrx(
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
