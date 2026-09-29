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
import { inject } from 'vitest'
import {
  createDatabase,
  dropDatabase,
  initializeSchemaAccess
} from '@events/tests/postgres'

const MIGRATIONS_DIR = path.resolve(
  __dirname,
  '../../../../migration/src/migrations/events'
)

// run-migrations.sh fills these in with envsubst before running the SQL files
const SQL_PLACEHOLDERS: Record<string, string> = {
  EVENTS_DB_USER: 'events_app',
  MINIO_BUCKET: 'ocrvs'
}

// node-pg-migrate throws this when a migration has no down migration: a SQL
// file without a `-- Down Migration` section, or a JS file exporting
// `down = false`. Those migrations are one-way on purpose.
const ONE_WAY_MIGRATION_ERROR = 'User has disabled down migration'

/**
 * Copies the migrations with the SQL placeholders filled in. The copy sits
 * inside this package so the JS migrations still resolve their imports.
 */
function copyMigrations() {
  const cacheDir = path.resolve(__dirname, '../../../node_modules/.cache')
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

    fs.writeFileSync(
      path.join(dir, file),
      file.endsWith('.sql')
        ? content.replace(/\$\{(\w+)\}/g, (placeholder, name: string) => {
            if (!(name in SQL_PLACEHOLDERS)) {
              throw new Error(`No test value for ${placeholder} in ${file}`)
            }
            return SQL_PLACEHOLDERS[name]
          })
        : content
    )
  }

  return { root, dir, files }
}

function getClient(database: string) {
  return new Client({
    connectionString: `postgres://postgres:postgres@${inject('POSTGRES_URI')}/${database}`
  })
}

describe('events migrations', () => {
  const database = `events_migrations_${Date.now()}`
  const migrations = copyMigrations()

  beforeAll(async () => {
    const cluster = getClient('postgres')
    await cluster.connect()
    await createDatabase(cluster, database)
    await cluster.end()

    // Same setup as packages/migration/src/migrations/postgres/0001_init.sql
    const client = getClient(database)
    await client.connect()
    await client.query('CREATE SCHEMA app AUTHORIZATION events_migrator')
    await initializeSchemaAccess(client)
    await client.end()
  })

  afterAll(async () => {
    fs.rmSync(migrations.root, { recursive: true, force: true })

    const cluster = getClient('postgres')
    await cluster.connect()
    await dropDatabase(cluster, database)
    await cluster.end()
  })

  test('each migration can be rolled back and applied again, unless it is one-way', async () => {
    const { runner } = await import('node-pg-migrate')

    const migrate = async (direction: 'up' | 'down') => {
      const migrated = await runner({
        databaseUrl: `postgres://events_migrator:migrator_password@${inject('POSTGRES_URI')}/${database}`,
        dir: migrations.dir,
        direction,
        count: 1,
        schema: 'app',
        migrationsTable: 'pgmigrations',
        checkOrder: false,
        log: () => undefined
      })
      return migrated.at(0)?.name
    }

    const step = async (
      description: string,
      direction: 'up' | 'down',
      file: string
    ) => {
      try {
        const migrated = await migrate(direction)
        expect(migrated, `${description} ${file} ran another migration`).toBe(
          path.parse(file).name
        )
        return 'done'
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)

        if (direction === 'down' && message.includes(ONE_WAY_MIGRATION_ERROR)) {
          return 'one-way'
        }
        throw new Error(`${description} ${file} failed: ${message}`)
      }
    }

    for (const file of migrations.files) {
      await step('Applying', 'up', file)

      if ((await step('Rolling back', 'down', file)) === 'one-way') {
        continue
      }

      await step('Re-applying', 'up', file)
    }
  }, 300_000)
})
