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

/**
 * Idempotent provisioning of one local environment's Postgres database.
 *
 * A developer (or CI job) names an environment; this makes the database
 * `events_<name>` exist, fully migrated, with the schemas and shared roles the
 * stack expects. Running it again is a no-op. It subsumes the one-shot
 * `docker-entrypoint-initdb.d` hook that used to create the single `events`
 * database, because with several environments per machine there is no single
 * first-boot moment to hang that off.
 *
 * Usage:
 *
 *   node ./src/provision.js --name <environment-name>
 *   node ./src/provision.js --db <database-name>
 *   ENV_NAME=<environment-name> node ./src/provision.js
 *   TARGET_DB=<database-name> node ./src/provision.js
 *
 * The superuser connection comes from `POSTGRES_ADMIN_URL`, or is assembled
 * from `POSTGRES_HOST` / `POSTGRES_PORT` / `POSTGRES_USER` /
 * `POSTGRES_PASSWORD` (the same variables `packages/testland` uses).
 */

import { spawn } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { Client } from 'pg'

/** The database used when no environment name is given (today's behaviour). */
export const DEFAULT_DATABASE = 'events'

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url))

/**
 * @typedef {object} SharedRole
 * @property {string} name
 * @property {string} password
 * @property {ReadonlyArray<string>} schemas Schemas the role needs USAGE on.
 */

/**
 * Roles are shared across every local environment — isolation is the database
 * boundary, not the role. Defaults mirror what the stack has always used:
 * `events_migrator` / `events_app` came from the init hook this command
 * replaces, the analytics and reference-data roles from
 * `packages/testland/assets/postgres/setup-{analytics,reference-data}.sh`.
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {SharedRole[]}
 */
export function sharedRoles(env = process.env) {
  return [
    {
      name: env.EVENTS_MIGRATOR_USER ?? 'events_migrator',
      password: env.EVENTS_MIGRATOR_PASSWORD ?? 'migrator_password',
      schemas: []
    },
    {
      name: env.EVENTS_DB_USER ?? 'events_app',
      password: env.EVENTS_DB_PASSWORD ?? 'app_password',
      schemas: ['app']
    },
    {
      name: env.ANALYTICS_POSTGRES_USER ?? 'events_analytics',
      password: env.ANALYTICS_POSTGRES_PASSWORD ?? 'analytics_password',
      schemas: ['analytics']
    },
    {
      name: env.REFERENCE_DATA_POSTGRES_USER ?? 'events_reference_data',
      password:
        env.REFERENCE_DATA_POSTGRES_PASSWORD ?? 'reference_data_password',
      schemas: ['reference_data']
    },
    {
      name: env.REFERENCE_DATA_EDITOR_USER ?? 'reference_data_editor_user',
      password:
        env.REFERENCE_DATA_EDITOR_PASSWORD ?? 'reference_data_editor_password',
      schemas: ['reference_data']
    }
  ]
}

/**
 * The database name an environment `name` maps to. Sanitisation matches the
 * environment resolver and the `${TARGET_DB//-/_}` substitution the testland
 * setup scripts already perform, so a name reaches the same database whichever
 * side computes it.
 *
 * @param {string} name
 * @returns {string}
 */
export function databaseNameForEnvironment(name) {
  const trimmed = name.trim()

  if (trimmed === '') {
    throw new Error('Environment name must not be empty')
  }

  const database = `${DEFAULT_DATABASE}_${trimmed
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')}`

  if (database.length > 63) {
    throw new Error(
      `Environment name '${name}' yields database name '${database}', which exceeds Postgres' 63 character identifier limit`
    )
  }

  return database
}

/**
 * @param {ReadonlyArray<string>} argv
 * @returns {{ name?: string, db?: string, help: boolean }}
 */
function parseArgs(argv) {
  /** @type {{ name?: string, db?: string, help: boolean }} */
  const parsed = { help: false }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === '--help' || arg === '-h') {
      parsed.help = true
    } else if (arg === '--name' || arg === '--env') {
      parsed.name = argv[++i]
    } else if (arg.startsWith('--name=') || arg.startsWith('--env=')) {
      parsed.name = arg.slice(arg.indexOf('=') + 1)
    } else if (arg === '--db' || arg === '--database') {
      parsed.db = argv[++i]
    } else if (arg.startsWith('--db=') || arg.startsWith('--database=')) {
      parsed.db = arg.slice(arg.indexOf('=') + 1)
    } else {
      throw new Error(`Unknown option: ${arg}`)
    }
  }

  return parsed
}

/**
 * Which database to provision, from CLI arguments first and environment
 * variables second. `dev.sh` exports `TARGET_DB`; CI passes `--name`.
 *
 * @param {object} [options]
 * @param {ReadonlyArray<string>} [options.argv]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @returns {string}
 */
export function resolveDatabaseName({ argv = [], env = process.env } = {}) {
  const args = parseArgs(argv)

  if (args.db !== undefined) {
    return args.db
  }
  if (args.name !== undefined) {
    return databaseNameForEnvironment(args.name)
  }
  if (env.TARGET_DB) {
    return env.TARGET_DB
  }
  if (env.ENV_NAME) {
    return databaseNameForEnvironment(env.ENV_NAME)
  }

  return DEFAULT_DATABASE
}

/**
 * The superuser connection used to create databases and roles.
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string}
 */
export function resolveAdminUrl(env = process.env) {
  if (env.POSTGRES_ADMIN_URL) {
    return env.POSTGRES_ADMIN_URL
  }

  const host = env.POSTGRES_HOST ?? 'localhost'
  const port = env.POSTGRES_PORT ?? '5432'
  const user = encodeURIComponent(env.POSTGRES_USER ?? 'postgres')
  const password = encodeURIComponent(env.POSTGRES_PASSWORD ?? 'postgres')
  const maintenanceDatabase = env.POSTGRES_MAINTENANCE_DB ?? 'postgres'

  return `postgres://${user}:${password}@${host}:${port}/${maintenanceDatabase}`
}

/**
 * @param {string} identifier
 * @returns {string}
 */
function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`
}

/**
 * @param {string} value
 * @returns {string}
 */
function quoteLiteral(value) {
  return `'${value.replace(/'/g, "''")}'`
}

/**
 * @param {unknown} error
 * @param {string} code
 * @returns {boolean}
 */
function isPostgresError(error, code) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    /** @type {{ code?: unknown }} */ (error).code === code
  )
}

/**
 * @param {string} connectionString
 * @param {(client: Client) => Promise<void>} fn
 */
async function withClient(connectionString, fn) {
  const client = new Client({ connectionString })
  await client.connect()
  try {
    await fn(client)
  } finally {
    await client.end()
  }
}

/**
 * Postgres has no `CREATE DATABASE IF NOT EXISTS`, and `CREATE DATABASE`
 * cannot run inside a transaction, so this is check-then-create with the
 * duplicate error swallowed to stay safe under a concurrent provision.
 *
 * @param {Client} admin
 * @param {string} database
 */
async function ensureDatabase(admin, database) {
  const { rowCount } = await admin.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [database]
  )

  if (rowCount) {
    return
  }

  try {
    await admin.query(`CREATE DATABASE ${quoteIdentifier(database)}`)
  } catch (error) {
    // 42P04 duplicate_database — another provision won the race.
    if (!isPostgresError(error, '42P04')) {
      throw error
    }
  }
}

/**
 * @param {Client} admin
 * @param {string} database
 * @param {ReadonlyArray<SharedRole>} roles
 */
async function ensureRoles(admin, database, roles) {
  for (const role of roles) {
    const { rowCount } = await admin.query(
      'SELECT 1 FROM pg_roles WHERE rolname = $1',
      [role.name]
    )

    const credentials = `LOGIN PASSWORD ${quoteLiteral(role.password)}`

    if (rowCount) {
      await admin.query(
        `ALTER ROLE ${quoteIdentifier(role.name)} WITH ${credentials}`
      )
    } else {
      try {
        await admin.query(
          `CREATE ROLE ${quoteIdentifier(role.name)} WITH ${credentials}`
        )
      } catch (error) {
        // 42710 duplicate_object — another provision won the race.
        if (!isPostgresError(error, '42710')) {
          throw error
        }
      }
    }

    await admin.query(
      `GRANT CONNECT ON DATABASE ${quoteIdentifier(
        database
      )} TO ${quoteIdentifier(role.name)}`
    )
  }
}

/**
 * The three schemas the stack expects to find in an environment's database.
 *
 * `app` is owned by the migrator and filled by the migrations in
 * `src/migrations/events`. `analytics` and `reference_data` are created empty
 * here and filled with tables by the testland setup scripts, which use
 * `CREATE SCHEMA IF NOT EXISTS` themselves and so are happy either way — but
 * an environment started with `--no-testland` still gets the schemas.
 *
 * @param {Client} target
 * @param {ReadonlyArray<SharedRole>} roles
 */
async function ensureSchemas(target, roles) {
  const [migrator] = roles

  await target.query(`REVOKE CREATE ON SCHEMA public FROM PUBLIC`)
  await target.query(
    `REVOKE CREATE ON SCHEMA public FROM ${quoteIdentifier(migrator.name)}`
  )

  await target.query(
    `CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION ${quoteIdentifier(
      migrator.name
    )}`
  )
  await target.query(`CREATE SCHEMA IF NOT EXISTS analytics`)
  await target.query(`CREATE SCHEMA IF NOT EXISTS reference_data`)

  for (const role of roles) {
    for (const schema of role.schemas) {
      await target.query(
        `GRANT USAGE ON SCHEMA ${quoteIdentifier(schema)} TO ${quoteIdentifier(
          role.name
        )}`
      )
    }
  }
}

/**
 * Runs the existing migrations against `database` by invoking the same
 * `run-migrations.sh` the migration service runs at boot — so provisioning and
 * the service can never drift apart.
 *
 * @param {object} options
 * @param {string} options.database
 * @param {string} options.adminUrl
 * @param {ReadonlyArray<SharedRole>} options.roles
 * @param {NodeJS.ProcessEnv} options.env
 * @returns {Promise<void>}
 */
function runMigrations({ database, adminUrl, roles, env }) {
  const [migrator, app] = roles
  const admin = new URL(adminUrl)
  const migratorUrl = `postgres://${encodeURIComponent(
    migrator.name
  )}:${encodeURIComponent(migrator.password)}@${admin.hostname}:${
    admin.port || '5432'
  }/${database}`

  return new Promise((resolve, reject) => {
    const child = spawn(
      'bash',
      [path.join(PACKAGE_ROOT, 'run-migrations.sh')],
      {
        cwd: PACKAGE_ROOT,
        stdio: 'inherit',
        env: {
          ...env,
          EVENTS_MIGRATOR_URL: migratorUrl,
          EVENTS_DB_USER: app.name
        }
      }
    )

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`run-migrations.sh exited with code ${String(code)}`))
      }
    })
  })
}

/**
 * Make one environment's database exist, be reachable by the shared roles, and
 * be fully migrated. Safe to call repeatedly.
 *
 * @param {object} [options]
 * @param {string} [options.adminUrl] Superuser connection URL.
 * @param {string} [options.name] Environment name; maps to `events_<name>`.
 * @param {string} [options.database] Explicit database name; wins over `name`.
 * @param {boolean} [options.runMigrations] Defaults to true.
 * @param {NodeJS.ProcessEnv} [options.env]
 * @returns {Promise<string>} The provisioned database name.
 */
export async function provisionEnvironment(options = {}) {
  const env = options.env ?? process.env
  const adminUrl = options.adminUrl ?? resolveAdminUrl(env)
  const database =
    options.database ??
    (options.name === undefined
      ? DEFAULT_DATABASE
      : databaseNameForEnvironment(options.name))
  const roles = sharedRoles(env)

  await withClient(adminUrl, async (admin) => {
    await ensureDatabase(admin, database)
    await ensureRoles(admin, database, roles)
  })

  const targetUrl = new URL(adminUrl)
  targetUrl.pathname = `/${database}`

  await withClient(targetUrl.toString(), async (target) => {
    await ensureSchemas(target, roles)
  })

  if (options.runMigrations !== false) {
    await runMigrations({ database, adminUrl, roles, env })
  }

  return database
}

const USAGE = `Usage: node ./src/provision.js [--name <environment>] [--db <database>]

Ensures the environment's Postgres database exists, has the app, analytics and
reference_data schemas plus the shared roles, and is fully migrated. Idempotent.

Options:
  --name, --env <name>   Environment name; provisions database events_<name>
  --db, --database <db>  Explicit database name (overrides --name)
  -h, --help             Show this message

Environment variables:
  ENV_NAME               Fallback for --name
  TARGET_DB              Fallback for --db
  POSTGRES_ADMIN_URL     Superuser connection URL
  POSTGRES_HOST/PORT/USER/PASSWORD
                         Used to build the superuser URL when the URL is unset
`

async function main() {
  const argv = process.argv.slice(2)

  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(USAGE)
    return
  }

  const database = resolveDatabaseName({ argv })

  console.log(`Provisioning Postgres database '${database}'...`)
  await provisionEnvironment({ database })
  console.log(`✅ Provisioned Postgres database '${database}'`)
}

const invokedPath = process.argv[1]

if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
