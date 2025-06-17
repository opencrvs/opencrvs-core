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
import fs from 'node:fs'
import { join } from 'node:path'
import { DataType, IBackup, newDb } from 'pg-mem'
import { CamelCasePlugin, Kysely } from 'kysely'
import { types } from 'pg'
import { getUUID } from '@opencrvs/commons'
import Schema from '@events/storage/postgres/events/schema/Database'

// Override timestamptz (OID 1184) to return ISO 8601 strings instead of Date objects
//       `pg`: 2025-06-16 12:55:51.507875+00
// `ISO 8601`: 2025-06-16T12:55:51.507Z
//                                 ^^^ (yes, we don't cut the milliseconds, Zod still accepts it)
types.setTypeParser(1184, (str) => str.replace(' ', 'T').replace('+00', 'Z'))

let backup: IBackup | undefined
let db: Kysely<Schema> | undefined

export const getClient = () => {
  const mem = newDb()

  if (!db) {
    mem.public.registerFunction({
      name: 'gen_random_uuid',
      returns: DataType.uuid,
      implementation: getUUID,
      impure: true
    })
    mem.public.none(fs.readFileSync(join(__dirname, 'events.sql'), 'utf8'))
    backup = mem.backup()
    db = mem.adapters.createKysely(0, {
      plugins: [new CamelCasePlugin()]
    }) as import('kysely').Kysely<Schema>
  }

  return db
}

export const resetServer = () => {
  backup?.restore()
}
