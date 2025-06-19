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

import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely'
import { Pool, types } from 'pg'
import { inject } from 'vitest'
import Schema from '../events/schema/Database'

/**
 * @important
 * If you update this file, @see {@link ../events.ts}
 *
 * This file runs everything in transaction so tests can rollback in between.
 */

const connectionString = inject('EVENTS_APP_POSTGRES_URI')

// Override timestamptz (OID 1184) to return ISO 8601 strings instead of Date objects
//       `pg`: 2025-06-16 12:55:51.507875+00
// `ISO 8601`: 2025-06-16T12:55:51.507Z
//                                 ^^^ (yes, we don't cut the milliseconds, Zod still accepts it)
types.setTypeParser(1184, (str) => str.replace(' ', 'T').replace('+00', 'Z'))

let db: Kysely<Schema> | undefined
let pool: Pool | undefined

export const getPool = () => {
  if (!pool) {
    pool = new Pool({ connectionString })
  }

  return pool
}

export function getClient() {
  if (!db) {
    const dialect = new PostgresDialect({
      pool: getPool()
    })

    db = new Kysely<Schema>({
      dialect,
      plugins: [new CamelCasePlugin()]
    })
  }

  return db
}
