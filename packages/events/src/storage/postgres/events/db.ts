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

import { createPool, createSqlTag, DatabasePool } from 'slonik'
import * as z from 'zod'
import { Draft } from '@opencrvs/commons'
import { env } from '@events/environment'

const url = env.EVENTS_POSTGRES_URL
let db: DatabasePool | null = null

export const getClient = async (): Promise<DatabasePool> => {
  if (!db) {
    db = await createPool(url)
  }
  return db
}

export const sql = createSqlTag({
  typeAliases: {
    void: z.object({}),
    draft: Draft
  }
})

export const formatTimestamp = (columnName: string) => {
  return sql.fragment`TO_CHAR(${sql.identifier([columnName])}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`
}
