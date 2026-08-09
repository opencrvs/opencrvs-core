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
import { BucketRemoval, DestroyServices } from './destroy-command'
import { EnvironmentDiscovery, environmentNamesFromDatabases } from './destroy'
import { CommandRunner, describe, runCommand } from './exec'
import { Registry } from './registry'

/**
 * Containers of the shared dependency stack, named by docker compose from the
 * project name `opencrvs-deps` (see `docker-compose.dev-deps.yml`). Overridable
 * so an unusual local setup is not locked out, matching the
 * `${POSTGRES_CONTAINER:-...}` escape hatch `clear-all-data.sh` already offers.
 */
export const DEPS_CONTAINERS = {
  postgres: 'opencrvs-deps-postgres-1',
  redis: 'opencrvs-deps-redis-1',
  elasticsearch: 'opencrvs-deps-elasticsearch-1',
  minio: 'opencrvs-deps-minio-1'
} as const

export type DepsContainers = Record<keyof typeof DEPS_CONTAINERS, string>

/**
 * Ports *inside* the containers. These are not the host ports and are never
 * slot-shifted: the dependency stack is a machine-wide singleton, so every
 * environment's data lives in the same four services.
 */
const ELASTICSEARCH_INTERNAL_PORT = 9200
const MINIO_INTERNAL_PORT = 3535

/** The dev credentials the stack ships with (`packages/documents`). */
const MINIO_DEFAULT_ACCESS_KEY = 'minioadmin'
const MINIO_DEFAULT_SECRET_KEY = 'minioadmin'

/** `mc` alias name. Supplied per-invocation via `MC_HOST_<alias>`. */
const MC_ALIAS = 'deps'

export interface DiscoverEnvironmentsOptions {
  /** Injected in tests so no container is ever contacted. */
  run?: CommandRunner
  containers?: Partial<DepsContainers>
  environment?: NodeJS.ProcessEnv
}

/**
 * Ask Postgres which environments exist.
 *
 * The registry records slots and is routinely incomplete (see
 * `EnvironmentDiscovery`); the databases are the durable record. Every
 * environment has one — `pnpm dev` provisions it before starting anything — so
 * `events_%` is a complete-enough list of the environments whose search data
 * must be protected from a neighbouring environment's clear.
 *
 * A failure is *reported*, never swallowed into an empty list: an empty list
 * and "I could not look" are the same value but opposite meanings, and the
 * second one must stop index deletion.
 */
export function discoverEnvironmentsFromPostgres(
  options: DiscoverEnvironmentsOptions = {}
): EnvironmentDiscovery {
  const run = options.run ?? runCommand
  const env = options.environment ?? process.env
  const container =
    options.containers?.postgres ??
    env.POSTGRES_CONTAINER ??
    DEPS_CONTAINERS.postgres

  try {
    const { stdout } = run({
      command: 'docker',
      args: [
        'exec',
        '-i',
        container,
        'psql',
        '-U',
        'postgres',
        '-d',
        'postgres',
        '-tAc',
        // Backslash is Postgres' default LIKE escape, so `\_` is a literal
        // underscore rather than the single-character wildcard.
        String.raw`SELECT datname FROM pg_database WHERE datname LIKE 'events\_%'`
      ]
    })

    return { names: environmentNamesFromDatabases(stdout.split('\n')) }
  } catch (error) {
    return { names: [], failure: (error as Error).message }
  }
}

export interface DockerDestroyServicesOptions {
  /** Where registry entries are released. */
  registry: Registry
  /** Injected in tests so no container is ever contacted. */
  run?: CommandRunner
  containers?: Partial<DepsContainers>
  environment?: NodeJS.ProcessEnv
}

/**
 * The real `DestroyServices`, implemented by `docker exec` into the dependency
 * containers.
 *
 * `docker exec` rather than network clients on purpose: this package is the
 * bootstrap step that runs before a developer's checkout is installed, so it
 * carries no `pg`, no Elasticsearch client and no S3 SDK. Every tool it needs
 * (`psql`, `curl`, `mc`, `redis-cli`) already ships inside the image that owns
 * the data. It is the same approach `development-environment/clear-all-data.sh`
 * takes.
 */
export function createDockerDestroyServices(
  options: DockerDestroyServicesOptions
): DestroyServices {
  const run = options.run ?? runCommand
  const containers: DepsContainers = {
    ...DEPS_CONTAINERS,
    ...options.containers
  }
  const env = options.environment ?? process.env

  const minioAccessKey =
    env.MINIO_ROOT_USER ?? env.MINIO_ACCESS_KEY ?? MINIO_DEFAULT_ACCESS_KEY
  const minioSecretKey =
    env.MINIO_ROOT_PASSWORD ?? env.MINIO_SECRET_KEY ?? MINIO_DEFAULT_SECRET_KEY

  return {
    dropDatabase(dbName) {
      /*
       * `WITH (FORCE)` terminates any session still attached. Without it a
       * forgotten `psql` — or a dev server nobody stopped — makes destroying an
       * environment fail with "database is being accessed by other users", and
       * a half-finished destroy is worse than none.
       *
       * `IF EXISTS` keeps the verb idempotent: destroying an environment whose
       * database was already dropped still cleans up everything else.
       */
      run({
        command: 'docker',
        args: [
          'exec',
          '-i',
          containers.postgres,
          'psql',
          '-U',
          'postgres',
          '-d',
          'postgres',
          '-v',
          'ON_ERROR_STOP=1',
          '-c',
          `DROP DATABASE IF EXISTS ${quoteIdentifier(dbName)} WITH (FORCE)`
        ]
      })
    },

    listIndices() {
      const { stdout } = run({
        command: 'docker',
        args: [
          'exec',
          containers.elasticsearch,
          'curl',
          '--silent',
          '--show-error',
          '--fail',
          `http://localhost:${ELASTICSEARCH_INTERNAL_PORT}/_cat/indices?h=index`
        ]
      })

      return stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '')
    },

    deleteIndex(index) {
      run({
        command: 'docker',
        args: [
          'exec',
          containers.elasticsearch,
          'curl',
          '--silent',
          '--show-error',
          '--fail',
          '-X',
          'DELETE',
          `http://localhost:${ELASTICSEARCH_INTERNAL_PORT}/${encodeURIComponent(index)}`
        ]
      })
    },

    removeBucket(bucket): BucketRemoval {
      /*
       * Credentials travel in `MC_HOST_<alias>` rather than an `mc alias set`
       * call, so nothing is written to the container's config and the secret
       * never appears in an argv a `docker inspect` or `ps` would show.
       */
      const spec = {
        command: 'docker',
        args: [
          'exec',
          '-e',
          `MC_HOST_${MC_ALIAS}=http://${encodeURIComponent(minioAccessKey)}:${encodeURIComponent(minioSecretKey)}@localhost:${MINIO_INTERNAL_PORT}`,
          containers.minio,
          'mc',
          'rb',
          '--force',
          `${MC_ALIAS}/${bucket}`
        ],
        /*
         * Non-zero is inspected here rather than thrown by the runner, because
         * exactly one non-zero case — "there was no bucket" — is a success for
         * this verb. Every other one must reach the caller. See below.
         */
        allowFailure: true
      }

      const outcome = run(spec)

      if (outcome.status === 0) {
        return 'removed'
      }

      if (isMissingBucket(outcome.stderr, outcome.stdout)) {
        return 'absent'
      }

      throw new Error(
        `Could not remove the MinIO bucket "${bucket}": \`${describe(spec)}\` ` +
          `exited ${outcome.status}.\n` +
          `${[outcome.stderr, outcome.stdout]
            .map((stream) => stream.trim())
            .filter((stream) => stream !== '')
            .join('\n')}\n` +
          'The environment still owns its data, so nothing further was ' +
          'removed and its slot was not freed. Check that the dependency ' +
          'stack is up (`pnpm dev` or `docker compose -p opencrvs-deps up ' +
          '-d`) and re-run.'
      )
    },

    flushRedisDb(db) {
      run({
        command: 'docker',
        args: [
          'exec',
          containers.redis,
          'redis-cli',
          '-n',
          String(db),
          'FLUSHDB'
        ]
      })
    },

    releaseRegistryEntry(name) {
      options.registry.release(name)
    }
  }
}

/**
 * The one `mc rb` failure `env:destroy` is allowed to treat as success.
 *
 * `mc` exits non-zero for a bucket that is not there *and* for MinIO being
 * unreachable, the credentials being wrong, the container not existing, or the
 * removal being denied — so the exit code alone cannot tell idempotency from a
 * genuine failure, and a blanket `allowFailure` reports every one of them as
 * "removed bucket X" while the data survives and the slot is freed.
 *
 * Two signatures, because `mc` renders the same underlying S3 error two ways:
 *
 * - `mc: <ERROR> Unable to validate target 'deps/x--ocrvs'. The specified
 *   bucket does not exist.` — the human-readable rendering, which is the S3
 *   `NoSuchBucket` error's `Message` verbatim.
 * - `NoSuchBucket` — the S3 error *code*, which is what surfaces in `--json`
 *   output and in some `mc` versions' plain rendering.
 *
 * Deliberately narrow: an unmatched failure throws, which is the safe way to be
 * wrong. "Connection refused", "No such container" and "Access Denied" all miss
 * both patterns.
 */
export function isMissingBucket(...streams: string[]): boolean {
  const output = streams.join('\n')

  return (
    /\bNoSuchBucket\b/.test(output) ||
    /(bucket|specified)[^\n]*does not exist/i.test(output)
  )
}

/**
 * Quote a Postgres identifier. Names reaching here are already sanitized to
 * `[a-z0-9_]`, so this is belt and braces rather than the only defence — but a
 * `DROP DATABASE` is not the statement to leave undefended.
 */
function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`
}
