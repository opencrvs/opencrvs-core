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
import { env } from '@events/environment'
import Schema from './schema/Database' // this is the Database interface we defined earlier

const connectionString = env.EVENTS_POSTGRES_URL

// Override timestamptz (OID 1184) to return ISO 8601 strings instead of Date objects
types.setTypeParser(1184, (str) => str)

const pool = new Pool({ connectionString })
const dialect = new PostgresDialect({
  pool: new Pool({ connectionString })
})

export const db = new Kysely<Schema>({
  dialect,
  plugins: [new CamelCasePlugin()]
})

/** export pool for streaming */
export const postgresPool = pool
