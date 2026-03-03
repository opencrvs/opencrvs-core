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
import { UUID } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import { NewSystemClients } from './schema/app/SystemClients'
import Schema from './schema/Database'

export async function createSystemClient(
  data: NewSystemClients,
  trx?: Kysely<Schema>
) {
  const db = trx ?? getClient()
  const row = await db
    .insertInto('systemClients')
    .values({
      ...data,
      // JSONB columns require explicit JSON serialisation because Kysely's
      // pg driver doesn't do it automatically for array values.
      scopes: JSON.stringify(data.scopes ?? []) as unknown as string[]
    })
    .returning(['id', 'name', 'scopes', 'status', 'shaSecret', 'createdAt'])
    .executeTakeFirstOrThrow()

  return row
}

export async function listSystemClients(
  filter?: { status?: 'active' | 'disabled' },
  trx?: Kysely<Schema>
) {
  const db = trx ?? getClient()
  let query = db
    .selectFrom('systemClients')
    .select(['id', 'name', 'scopes', 'status'])

  if (filter?.status) {
    query = query.where('status', '=', filter.status)
  }

  return query.execute()
}

export async function getSystemClientById(
  id: UUID,
  trx?: Kysely<Schema>
) {
  const db = trx ?? getClient()
  return db
    .selectFrom('systemClients')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
}
