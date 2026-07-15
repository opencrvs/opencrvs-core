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
import fs from 'fs'
import path from 'path'
import { Client } from 'pg'
import { inject } from 'vitest'
import { sql } from 'kysely'
import { getClient } from '@events/storage/postgres/events'

/**
 * Executes the real production migration that added and backfilled the
 * `versions` column, against rows shaped like a pre-2.1 (no `versions`
 * column) database. The test database is already fully migrated, so the
 * pre-migration state is first restored by dropping the column.
 *
 * The migration file is intentionally read from packages/migration so the
 * exact SQL that runs in production is what is tested — if the file is
 * renamed or moved, this test fails loudly rather than silently testing
 * a stale copy.
 *
 * NOTE: this test inserts rows that reference the legacy `valid_until` and
 * `deleted_at` columns, so it lives only as long as they do. The future
 * contract migration that drops the legacy columns must rework or retire
 * this test along with them.
 */
const MIGRATION_FILE = path.resolve(
  __dirname,
  '../../../../migration/src/migrations/events/1784033588369_add-versions-column-to-locations-and-administrative-areas.sql'
)

const LOCATION_WITHOUT_VALID_UNTIL = '0b1f1a10-6c2b-4e2a-9d3e-111111111111'
const LOCATION_WITH_PAST_VALID_UNTIL = '0b1f1a10-6c2b-4e2a-9d3e-222222222222'
const LOCATION_WITH_FUTURE_VALID_UNTIL = '0b1f1a10-6c2b-4e2a-9d3e-333333333333'
const SOFT_DELETED_LOCATION = '0b1f1a10-6c2b-4e2a-9d3e-444444444444'
const ADMIN_AREA_WITH_PAST_VALID_UNTIL = '0b1f1a10-6c2b-4e2a-9d3e-555555555555'

test('backfills versions from valid_until when migrating a 2.0-shaped database', async () => {
  // The per-test database name is generated in test setup; recover it so the
  // superuser (who owns the tables) can run schema statements against it.
  const {
    rows: [{ db: databaseName }]
  } = await sql<{ db: string }>`SELECT current_database() AS db`.execute(
    getClient()
  )

  const superuser = new Client({
    connectionString: `postgres://postgres:postgres@${inject(
      'POSTGRES_URI'
    )}/${databaseName}`
  })
  await superuser.connect()

  try {
    // Restore the pre-migration (2.0) table shape.
    await superuser.query(
      `ALTER TABLE app.locations DROP COLUMN versions;
       ALTER TABLE app.administrative_areas DROP COLUMN versions;`
    )

    // Legacy-shaped rows the production migration will encounter.
    await superuser.query(
      `INSERT INTO app.locations (id, name, location_type, external_id, valid_until, deleted_at) VALUES
         ('${LOCATION_WITHOUT_VALID_UNTIL}', 'Everlasting Office', 'CRVS_OFFICE', 'ext-everlasting', NULL, NULL),
         ('${LOCATION_WITH_PAST_VALID_UNTIL}', 'Closed Office', 'CRVS_OFFICE', 'ext-closed', '2024-06-01T18:30:00Z', NULL),
         ('${LOCATION_WITH_FUTURE_VALID_UNTIL}', 'Closing Office', 'CRVS_OFFICE', 'ext-closing', '2030-01-05T00:00:00Z', NULL),
         ('${SOFT_DELETED_LOCATION}', 'Deleted Office', 'CRVS_OFFICE', 'ext-deleted', NULL, now());
       INSERT INTO app.administrative_areas (id, name, external_id, valid_until) VALUES
         ('${ADMIN_AREA_WITH_PAST_VALID_UNTIL}', 'Abolished District', 'ext-abolished', '2024-06-01T18:30:00Z');`
    )

    const upMigration = fs
      .readFileSync(MIGRATION_FILE, 'utf8')
      .split('-- Down Migration')[0]

    await superuser.query(upMigration)

    const activeElement = (name: string, externalId: string) => ({
      versionId: expect.any(String),
      effectiveFrom: '0001-01-01',
      name,
      externalId,
      status: 'active'
    })

    const { rows: locations } = await superuser.query(
      `SELECT id, versions FROM app.locations ORDER BY id`
    )
    const versionsById = Object.fromEntries(
      locations.map(({ id, versions }) => [id, versions])
    )

    expect(versionsById[LOCATION_WITHOUT_VALID_UNTIL]).toEqual([
      activeElement('Everlasting Office', 'ext-everlasting')
    ])

    // valid_until 2024-06-01T18:30:00Z truncates to the UTC date 2024-06-01.
    expect(versionsById[LOCATION_WITH_PAST_VALID_UNTIL]).toEqual([
      activeElement('Closed Office', 'ext-closed'),
      {
        versionId: expect.any(String),
        effectiveFrom: '2024-06-01',
        name: 'Closed Office',
        externalId: 'ext-closed',
        status: 'inactive'
      }
    ])

    // A future valid_until becomes a future-dated inactive element.
    expect(versionsById[LOCATION_WITH_FUTURE_VALID_UNTIL]).toEqual([
      activeElement('Closing Office', 'ext-closing'),
      {
        versionId: expect.any(String),
        effectiveFrom: '2030-01-05',
        name: 'Closing Office',
        externalId: 'ext-closing',
        status: 'inactive'
      }
    ])

    // Soft-deleted rows are backfilled too — NOT NULL applies to them.
    expect(versionsById[SOFT_DELETED_LOCATION]).toEqual([
      activeElement('Deleted Office', 'ext-deleted')
    ])

    const {
      rows: [adminArea]
    } = await superuser.query(
      `SELECT versions FROM app.administrative_areas WHERE id = '${ADMIN_AREA_WITH_PAST_VALID_UNTIL}'`
    )
    expect(adminArea.versions).toEqual([
      activeElement('Abolished District', 'ext-abolished'),
      {
        versionId: expect.any(String),
        effectiveFrom: '2024-06-01',
        name: 'Abolished District',
        externalId: 'ext-abolished',
        status: 'inactive'
      }
    ])

    // The migration restores NOT NULL on both tables.
    const { rows: nullability } = await superuser.query(
      `SELECT table_name, is_nullable FROM information_schema.columns
       WHERE table_schema = 'app' AND column_name = 'versions'
       ORDER BY table_name`
    )
    expect(nullability).toEqual([
      { table_name: 'administrative_areas', is_nullable: 'NO' },
      { table_name: 'locations', is_nullable: 'NO' }
    ])
  } finally {
    await superuser.end()
  }
})
