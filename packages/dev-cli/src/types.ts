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
 * Base host ports — the values the repository uses today, i.e. the values a
 * slot-0 (primary worktree) environment must reproduce exactly. Every other
 * slot's port is `base + slot * PORT_STRIDE`.
 *
 * Each base is taken from the code that actually binds or addresses it:
 *
 * | service         | base | source of truth                                     |
 * | --------------- | ---- | --------------------------------------------------- |
 * | client          | 3000 | packages/client/package.json `vite --port=3000`      |
 * | login           | 3020 | packages/login/package.json `vite --port=3020`       |
 * | gateway         | 7070 | packages/gateway/src/environment.ts `PORT`           |
 * | auth            | 4040 | packages/auth/src/environment.ts `AUTH_PORT`         |
 * | countryConfig   | 3040 | packages/testland/src/environment.ts `COUNTRY_CONFIG_PORT` |
 * | events          | 5555 | packages/events/src/index.ts `server().listen(5555)` |
 * | documents       | 9050 | packages/documents/src/constants.ts `DOCUMENTS_PORT` |
 * | storybook       | 6060 | packages/components/package.json `storybook`         |
 * | clientStorybook | 6006 | packages/client/package.json `storybook`             |
 * | apiDocs         | 3003 | packages/api-docs/package.json `start`               |
 * | metabase        | 4444 | packages/testland/assets/metabase/run-dev.sh `MB_JETTY_PORT` |
 *
 * `storybook`, `clientStorybook`, `apiDocs` and `metabase` are not part of the
 * `pnpm dev` sweep — they are launched by hand — but they are slot-shifted all
 * the same so two worktrees can each run one without a port collision.
 *
 * Dependency ports (Postgres 5432, Elasticsearch 9200, Redis 6379, MinIO
 * 3535/3536) are deliberately absent: dependencies are a machine-wide
 * singleton shared by every environment, so they are never slot-shifted.
 */
export const BASE_PORTS = {
  client: 3000,
  login: 3020,
  gateway: 7070,
  auth: 4040,
  countryConfig: 3040,
  events: 5555,
  documents: 9050,
  storybook: 6060,
  clientStorybook: 6006,
  apiDocs: 3003,
  metabase: 4444
} as const

export type ServiceName = keyof typeof BASE_PORTS

export type ServicePorts = Record<ServiceName, number>

/**
 * Peer addresses each service uses to reach the others. Slot 0 reproduces the
 * exact strings the services default to today (including which of them carry a
 * trailing slash), so a primary checkout is byte-for-byte unchanged.
 */
export interface ServiceUrls {
  client: string
  login: string
  gateway: string
  auth: string
  countryConfig: string
  countryConfigInternal: string
  events: string
  documents: string
}

/** One environment as recorded in the machine-level registry. */
export interface RegistryEntry {
  slot: number
  worktreePath: string
  /** ISO-8601 timestamp, touched on every `resolve`. */
  lastUsedAt: string
}

/** The whole registry: environment name → entry. */
export type RegistrySnapshot = Record<string, RegistryEntry>

/**
 * Everything downstream needs to know about one environment. Produced purely,
 * from a name plus a registry snapshot — no I/O, no ambient state.
 */
export interface EnvironmentDescriptor {
  /** Sanitized name; keys all per-environment data. */
  name: string
  slot: number
  worktreePath: string
  /** Postgres database holding the app/analytics/reference_data schemas. */
  dbName: string
  /**
   * Elasticsearch index prefix. `packages/events` derives its event indices
   * from it as `${ES_INDEX_PREFIX}_${suffix}`.
   */
  esPrefix: string
  /**
   * Elasticsearch reindexing-status index. Carried separately because
   * `packages/events` reads it from its own `ES_REINDEXING_STATUS_INDEX` knob
   * and does *not* derive it from `ES_INDEX_PREFIX`
   * (`getReindexingStatusIndexName()` returns the raw value), so the prefix
   * alone does not isolate it.
   */
  esReindexingStatusIndex: string
  /** MinIO bucket for uploaded documents. */
  bucket: string
  /** Redis logical DB index; always equal to `slot`. */
  redisDb: number
  ports: ServicePorts
  urls: ServiceUrls
}
