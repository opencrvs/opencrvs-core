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
import { NewUsers } from './schema/app/Users'
import Schema from './schema/Database'
import { NewUserCredentials } from './schema/app/UserCredentials'

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
