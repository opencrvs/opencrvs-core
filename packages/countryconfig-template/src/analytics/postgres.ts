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
import { Settings, DateTime } from 'luxon'
import { ANALYTICS_DATABASE_URL } from '@countryconfig/constants'

// Override timestamptz to return ISO 8601 strings instead of Date objects
//       `pg`: 2025-06-16 12:55:51.507+00 -- postgres limits the precision to xxx milliseconds.
// `ISO 8601`: 2025-06-16T12:55:51.507Z
//                                 ^^^ (We set Z for UTC timezone)
Settings.defaultZone = 'utc'
types.setTypeParser(types.builtins.TIMESTAMPTZ, (str) =>
  DateTime.fromSQL(str).toISO()
)

let db: Kysely<any> | undefined
let pool: Pool | undefined

const getPool = (connectionString = ANALYTICS_DATABASE_URL) => {
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

    db = new Kysely({
      dialect,
      plugins: [new CamelCasePlugin()]
    })
  }

  return db.withSchema('analytics')
}
