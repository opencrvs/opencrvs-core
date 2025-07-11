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
import { Client } from 'pg'

const MIGRATION_SQL = fs
  .readFileSync(path.resolve(__dirname, './postgres-migrations.sql'))
  .toString()

export const migrate = async (client: Client) => client.query(MIGRATION_SQL)

export const createDatabase = async (client: Client, databaseName: string) => {
  await client.query(`CREATE DATABASE "${databaseName}"`)
  await client.query(
    `GRANT CONNECT ON DATABASE "${databaseName}" TO events_migrator, events_app`
  )
}

export const initializeSchemaAccess = async (client: Client) => {
  await client.query(`REVOKE CREATE ON SCHEMA public FROM PUBLIC`)
  await client.query(`REVOKE CREATE ON SCHEMA public FROM events_migrator`)
  await client.query(`GRANT USAGE ON SCHEMA app TO events_app`)
}
