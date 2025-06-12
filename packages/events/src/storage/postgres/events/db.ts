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
import { Pool } from 'pg'
import { env } from '@events/environment'
import { DB } from './types' // this is the Database interface we defined earlier

const connectionString = env.EVENTS_POSTGRES_URL
// let db: DatabasePool | null = null

// export const getClient = async (): Promise<DatabasePool> => {
//   if (!db) {
//     db = await createPool(url)
//   }
//   return db
// }

// export const sql = createSqlTag({
//   typeAliases: {
//     void: z.object({}),
//     draft: Draft
//   }
// })

// export const formatTimestamp = (columnName: string) => {
//   return sql.fragment`TO_CHAR(${sql.identifier([columnName])}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`
// }

const dialect = new PostgresDialect({
  pool: new Pool({ connectionString })
})

export const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()]
})
