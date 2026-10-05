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

/** Migrated once per test run, then copied for each test's database. */
export const TEMPLATE_DATABASE = 'events_template'

const MIGRATIONS_DIR = path.resolve(
  __dirname,
  '../../../migration/src/migrations/events'
)

// run-migrations.sh fills these in with envsubst before running the SQL files
const SQL_PLACEHOLDER_VALUES: Record<string, string> = {
  EVENTS_DB_USER: 'events_app',
  MINIO_BUCKET: 'ocrvs'
}

// Matches a ${NAME} placeholder and captures NAME
const SQL_PLACEHOLDER_PATTERN = /\$\{(\w+)\}/g

/**
 * Copies the migrations with the SQL placeholders filled in. The copy sits
 * inside this package so the JS migrations still resolve their imports.
 */
export function copyMigrations() {
  const cacheDir = path.resolve(__dirname, '../../node_modules/.cache')
  fs.mkdirSync(cacheDir, { recursive: true })
  const root = fs.mkdtempSync(path.join(cacheDir, 'migrations-'))

  // The JS migrations are ES modules. The package.json sits a level above the
  // migrations, as node-pg-migrate treats every file in its directory as one.
  fs.writeFileSync(path.join(root, 'package.json'), '{ "type": "module" }')
  const dir = path.join(root, 'events')
  fs.mkdirSync(dir)

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => /\.(sql|js)$/.test(file))
    .sort()

  for (const file of files) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')

    // Write the copy, filling in placeholders in SQL files; JS files are copied as-is
    fs.writeFileSync(
      path.join(dir, file),
      file.endsWith('.sql')
        ? content.replace(
            SQL_PLACEHOLDER_PATTERN,
            (placeholder, name: string) => {
              if (!(name in SQL_PLACEHOLDER_VALUES)) {
                throw new Error(`No test value for ${placeholder} in ${file}`)
              }
              return SQL_PLACEHOLDER_VALUES[name]
            }
          )
        : content
    )
  }

  return { root, dir, files }
}

/** Runs the migrations in `dir` as events_migrator, like run-migrations.sh. */
export async function runMigrations(
  postgresUri: string,
  database: string,
  dir: string,
  direction: 'up' | 'down',
  count?: number
) {
  const { runner } = await import('node-pg-migrate')

  const migrated = await runner({
    databaseUrl: `postgres://events_migrator:migrator_password@${postgresUri}/${database}`,
    dir,
    direction,
    count,
    schema: 'app',
    migrationsTable: 'pgmigrations',
    checkOrder: false,
    log: () => undefined
  })

  return migrated.map(({ name }) => name)
}

export const createDatabase = async (
  client: Client,
  databaseName: string,
  template?: string
) => {
  await client.query(
    template
      ? `CREATE DATABASE "${databaseName}" TEMPLATE "${template}"`
      : `CREATE DATABASE "${databaseName}"`
  )
  await client.query(
    `GRANT CONNECT ON DATABASE "${databaseName}" TO events_migrator, events_app`
  )
}

/** Same schema setup as packages/migration/src/provision.js */
export const initializeSchemaAccess = async (client: Client) => {
  await client.query(`CREATE SCHEMA app AUTHORIZATION events_migrator`)
  await client.query(`REVOKE CREATE ON SCHEMA public FROM PUBLIC`)
  await client.query(`REVOKE CREATE ON SCHEMA public FROM events_migrator`)
  await client.query(`GRANT USAGE ON SCHEMA app TO events_app`)
}

export const dropDatabase = async (client: Client, databaseName: string) =>
  // FORCE terminates any backends still connected to the database, so the
  // drop cannot fail on a connection a test left open.
  client.query(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`)
