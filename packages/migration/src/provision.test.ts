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

import { Client } from 'pg'
import { beforeAll, describe, expect, inject, it } from 'vitest'
import { provisionEnvironment } from './provision.js'

const APPLICATION_SCHEMAS = ['app', 'analytics', 'reference_data']

let adminUrl: string

function urlForDatabase(database: string) {
  const url = new URL(adminUrl)
  url.pathname = `/${database}`
  return url.toString()
}

async function withClient<T>(
  database: string,
  fn: (client: Client) => Promise<T>
): Promise<T> {
  const client = new Client({ connectionString: urlForDatabase(database) })
  await client.connect()
  try {
    return await fn(client)
  } finally {
    await client.end()
  }
}

async function query<T = Record<string, unknown>>(
  database: string,
  sql: string,
  values: unknown[] = []
): Promise<T[]> {
  return withClient(database, async (client) => {
    const result = await client.query(sql, values)
    return result.rows as T[]
  })
}

/**
 * Everything about the cluster a caller could observe: which databases and
 * roles exist, and who may connect where. Deliberately excludes password
 * hashes — Postgres re-salts on every SCRAM password write, so they are not
 * stable state even when the password is unchanged.
 */
async function clusterState() {
  return {
    databases: await query(
      'postgres',
      `SELECT datname, COALESCE(array_to_string(datacl, ','), '') AS acl
       FROM pg_database
       ORDER BY datname`
    ),
    roles: await query(
      'postgres',
      `SELECT rolname, rolcanlogin, rolsuper, rolcreatedb, rolcreaterole
       FROM pg_roles
       WHERE rolname NOT LIKE 'pg\\_%'
       ORDER BY rolname`
    )
  }
}

/** Everything about one database a caller could observe. */
async function databaseState(database: string) {
  const schemas = await query(
    database,
    `SELECT nspname,
            pg_get_userbyid(nspowner) AS owner,
            COALESCE(array_to_string(nspacl, ','), '') AS acl
     FROM pg_namespace
     WHERE nspname NOT LIKE 'pg\\_%' AND nspname <> 'information_schema'
     ORDER BY nspname`
  )

  const columns = await query<{ table_schema: string; table_name: string }>(
    database,
    `SELECT table_schema, table_name, column_name, data_type, is_nullable,
            COALESCE(column_default, '') AS column_default
     FROM information_schema.columns
     WHERE table_schema = ANY($1)
     ORDER BY table_schema, table_name, column_name`,
    [APPLICATION_SCHEMAS]
  )

  const grants = await query(
    database,
    `SELECT table_schema, table_name, grantee, privilege_type
     FROM information_schema.role_table_grants
     WHERE table_schema = ANY($1)
     ORDER BY table_schema, table_name, grantee, privilege_type`,
    [APPLICATION_SCHEMAS]
  )

  const tables = [
    ...new Set(columns.map((c) => `${c.table_schema}.${c.table_name}`))
  ].sort()

  const rowCounts: Record<string, number> = {}
  for (const table of tables) {
    const [row] = await query<{ count: string }>(
      database,
      `SELECT count(*)::text AS count FROM ${table}`
    )
    rowCounts[table] = Number(row.count)
  }

  return { schemas, columns, grants, rowCounts }
}

async function schemaNames(database: string) {
  const rows = await query<{ nspname: string }>(
    database,
    `SELECT nspname FROM pg_namespace ORDER BY nspname`
  )
  return rows.map((r) => r.nspname)
}

async function roleNames() {
  const rows = await query<{ rolname: string }>(
    'postgres',
    `SELECT rolname FROM pg_roles ORDER BY rolname`
  )
  return rows.map((r) => r.rolname)
}

async function databaseExists(database: string) {
  const rows = await query(
    'postgres',
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [database]
  )
  return rows.length === 1
}

describe('provisioning a named environment', () => {
  beforeAll(() => {
    adminUrl = inject('POSTGRES_ADMIN_URL')
  })

  it('creates events_<name> with the application schemas and shared roles', async () => {
    expect(await databaseExists('events_alpha_one')).toBe(false)

    await provisionEnvironment({ adminUrl, name: 'alpha-one' })

    expect(await databaseExists('events_alpha_one')).toBe(true)

    expect(await schemaNames('events_alpha_one')).toEqual(
      expect.arrayContaining(APPLICATION_SCHEMAS)
    )

    expect(await roleNames()).toEqual(
      expect.arrayContaining([
        'events_migrator',
        'events_app',
        'events_analytics',
        'events_reference_data',
        'reference_data_editor_user'
      ])
    )

    // The migrations really ran against this database, not some other one.
    const applied = await query<{ name: string }>(
      'events_alpha_one',
      `SELECT name FROM app.pgmigrations ORDER BY id`
    )
    expect(applied.length).toBeGreaterThan(0)

    const eventTables = await query<{ table_name: string }>(
      'events_alpha_one',
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'app'`
    )
    expect(eventTables.map((t) => t.table_name)).toEqual(
      expect.arrayContaining(['events', 'event_actions', 'locations'])
    )
  })

  it('is idempotent: re-provisioning the same name changes nothing observable', async () => {
    const clusterBefore = await clusterState()
    const databaseBefore = await databaseState('events_alpha_one')

    await provisionEnvironment({ adminUrl, name: 'alpha-one' })

    expect(await clusterState()).toEqual(clusterBefore)
    expect(await databaseState('events_alpha_one')).toEqual(databaseBefore)
  })

  it('isolates two distinct names into two databases', async () => {
    await provisionEnvironment({ adminUrl, name: 'beta-two' })

    expect(await databaseExists('events_beta_two')).toBe(true)
    expect(await schemaNames('events_beta_two')).toEqual(
      expect.arrayContaining(APPLICATION_SCHEMAS)
    )

    // Data written in one environment is invisible in the other.
    await query(
      'events_alpha_one',
      `INSERT INTO app.events (event_type, transaction_id, tracking_id)
       VALUES ('v2.birth', 'tx-alpha-only', 'ALPHAONLY')`
    )

    const [alpha] = await query<{ count: string }>(
      'events_alpha_one',
      `SELECT count(*)::text AS count FROM app.events`
    )
    const [beta] = await query<{ count: string }>(
      'events_beta_two',
      `SELECT count(*)::text AS count FROM app.events`
    )
    expect(Number(alpha.count)).toBe(1)
    expect(Number(beta.count)).toBe(0)

    // Schema written in one environment is invisible in the other.
    await query('events_alpha_one', `CREATE TABLE app.alpha_only (id int)`)

    const betaTables = await query<{ table_name: string }>(
      'events_beta_two',
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'app'`
    )
    expect(betaTables.map((t) => t.table_name)).not.toContain('alpha_only')
  })
})
