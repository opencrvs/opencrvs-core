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
import path from 'node:path'
import { Pool } from 'pg'
import { inject } from 'vitest'

const MIGRATION_FILE_CONTENTS = fs
  .readFileSync(path.resolve(__dirname, './0002_migrations.sql'))
  .toString()

export function getUpMigrations() {
  return MIGRATION_FILE_CONTENTS.split('-- Down Migration')[0]
}

export function getDownMigrations() {
  return MIGRATION_FILE_CONTENTS.split('-- Down Migration')[1]
}

async function runSql(sql: string) {
  const migratorPool = new Pool({
    connectionString: inject('EVENTS_MIGRATOR_POSTGRES_URI')
  })
  const migratorClient = await migratorPool.connect()

  await migratorClient.query(sql).finally(() => {
    migratorClient.release()
  })
}

export const migrate = {
  up: async () => runSql(getUpMigrations()),
  down: async () => runSql(getDownMigrations())
}
