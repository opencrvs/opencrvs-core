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
  copyMigrations,
  createDatabase,
  dropDatabase,
  initializeSchemaAccess,
  runMigrations
} from '@events/tests/postgres'

// node-pg-migrate throws this when a migration has no down migration: a SQL
// file without a `-- Down Migration` section, or a JS file exporting
// `down = false`. Those migrations are one-way on purpose.
const ONE_WAY_MIGRATION_ERROR = 'User has disabled down migration'

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

    const client = getClient(database)
    await client.connect()
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
    const migrate = async (direction: 'up' | 'down') => {
      const [migrated] = await runMigrations(
        inject('POSTGRES_URI'),
        database,
        migrations.dir,
        direction,
        1
      )
      return migrated
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
