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
import { EnvironmentDescriptor } from './types'

/**
 * Postgres connection coordinates. Host and port belong to the shared
 * dependency singleton and never move; only the database name is
 * per-environment. Roles are shared across environments by design (see
 * ADR-0003), so their credentials are the same fixed dev credentials the
 * services default to today.
 */
const POSTGRES_HOST = 'localhost'
const POSTGRES_PORT = 5432

const POSTGRES_ROLES = {
  app: { user: 'events_app', password: 'app_password' },
  /*
   * Owns schema `app` and is the only role allowed to change its shape. Kept
   * strictly apart from `app` in the contract because the two names used to
   * collide on `EVENTS_POSTGRES_URL`, which made the migration runner connect
   * as `events_app` — a role holding USAGE, never CREATE, on schema `app`.
   */
  migrator: { user: 'events_migrator', password: 'migrator_password' },
  analytics: { user: 'events_analytics', password: 'analytics_password' },
  referenceData: {
    user: 'events_reference_data',
    password: 'reference_data_password'
  }
} as const

function postgresUrl(
  role: keyof typeof POSTGRES_ROLES,
  dbName: string
): string {
  const { user, password } = POSTGRES_ROLES[role]
  return `postgres://${user}:${password}@${POSTGRES_HOST}:${POSTGRES_PORT}/${dbName}`
}

/**
 * The environment-variable contract `dev.sh` exports before starting the node
 * processes, and the only thing the services see of an environment. Services
 * stay dumb env-var readers; every piece of port and name arithmetic happens
 * here.
 *
 * At slot 0 every value equals what the repository uses today.
 */
export function toEnvironmentVariables(
  descriptor: EnvironmentDescriptor
): Record<string, string> {
  const { ports, urls } = descriptor

  return {
    // Identity — for diagnostics and for the lifecycle verbs.
    OPENCRVS_ENV_NAME: descriptor.name,
    OPENCRVS_ENV_SLOT: String(descriptor.slot),

    // Per-environment isolation knobs (ADR-0003).
    TARGET_DB: descriptor.dbName,
    EVENTS_POSTGRES_URL: postgresUrl('app', descriptor.dbName),
    /*
     * The migration connection, distinct from the application one above:
     * `run-migrations.sh` / `revert-migrations.sh` need DDL rights on schema
     * `app`, which only `events_migrator` has.
     */
    EVENTS_MIGRATOR_URL: postgresUrl('migrator', descriptor.dbName),
    ANALYTICS_DATABASE_URL: postgresUrl('analytics', descriptor.dbName),
    REFERENCE_DATA_DATABASE_URL: postgresUrl(
      'referenceData',
      descriptor.dbName
    ),
    ES_INDEX_PREFIX: descriptor.esPrefix,
    /*
     * Needed on top of ES_INDEX_PREFIX: packages/events reads this index name
     * from its own knob and does not derive it from the prefix, so without it
     * every environment would share one `reindexing_status` index.
     */
    ES_REINDEXING_STATUS_INDEX: descriptor.esReindexingStatusIndex,
    MINIO_BUCKET: descriptor.bucket,
    REDIS_DB: String(descriptor.redisDb),

    // Listen ports.
    CLIENT_PORT: String(ports.client),
    LOGIN_PORT: String(ports.login),
    GATEWAY_PORT: String(ports.gateway),
    /*
     * `packages/gateway` reads the bare `PORT` key (see
     * packages/gateway/src/environment.ts). GATEWAY_PORT is the name in this
     * contract; PORT is the compatibility alias the gateway actually reads.
     */
    PORT: String(ports.gateway),
    AUTH_PORT: String(ports.auth),
    COUNTRY_CONFIG_PORT: String(ports.countryConfig),
    EVENTS_PORT: String(ports.events),
    DOCUMENTS_PORT: String(ports.documents),
    /*
     * Ports for tools launched by hand rather than by the `pnpm dev` sweep.
     * They are still slot-shifted so two worktrees can each run one.
     */
    STORYBOOK_PORT: String(ports.storybook),
    CLIENT_STORYBOOK_PORT: String(ports.clientStorybook),
    API_DOCS_PORT: String(ports.apiDocs),
    METABASE_PORT: String(ports.metabase),

    // Peer addresses.
    CLIENT_APP_URL: urls.client,
    LOGIN_URL: urls.login,
    GATEWAY_URL: urls.gateway,
    AUTH_URL: urls.auth,
    EVENTS_URL: urls.events,
    COUNTRY_CONFIG_URL: urls.countryConfig,
    COUNTRY_CONFIG_URL_INTERNAL: urls.countryConfigInternal,
    DOCUMENTS_URL: urls.documents
  }
}

/** Single-quote a value so a POSIX shell cannot reinterpret it. */
function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

/**
 * Render the contract as `export VAR=value` lines for `dev.sh` to source, e.g.
 * `eval "$(pnpm --silent dev:env:resolve)"`.
 */
export function formatExportLines(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `export ${key}=${shellQuote(value)}`)
    .join('\n')
}
