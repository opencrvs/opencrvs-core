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
import * as fs from 'node:fs'
import { BucketRemoval, EnvironmentDataServices } from './environment-data'
import {
  EnvironmentDiscovery,
  environmentNamesFromDatabases
} from './data-plan'
import { CommandRunner, describe, runCommand } from './exec'
import { Registry } from './registry'

/**
 * Containers of the shared dependency singleton, named by docker compose from
 * the project name `opencrvs-deps` (see `docker-compose.dev-deps.yml`).
 * `POSTGRES_CONTAINER`, `RUSTFS_CONTAINER` and `ELASTICSEARCH_CONTAINER`
 * override them, so an unusual local setup is not locked out.
 */
export const DEPS_CONTAINERS = {
  postgres: 'opencrvs-deps-postgres-1',
  redis: 'opencrvs-deps-redis-1',
  elasticsearch: 'opencrvs-deps-elasticsearch-1',
  rustfs: 'opencrvs-deps-rustfs-1'
} as const

export type DepsContainers = Record<keyof typeof DEPS_CONTAINERS, string>

/**
 * Ports *inside* the containers. These are not the host ports and are never
 * slot-shifted: the dependencies are a machine-wide singleton, so every
 * environment's data lives in the same four services.
 */
const ELASTICSEARCH_INTERNAL_PORT = 9200
const RUSTFS_INTERNAL_PORT = 3535

/** The dev credentials the stack ships with (`docker-compose.deps.yml`). */
const RUSTFS_DEFAULT_ACCESS_KEY = 'rustfsadmin'
const RUSTFS_DEFAULT_SECRET_KEY = 'rustfsadmin'

/**
 * The RustFS image has no S3 client, so bucket operations run the AWS CLI in a
 * one-off container. The container joins the network namespace of the RustFS
 * container, so it reaches RustFS on `localhost`. The tag is pinned so that
 * the error output that `isMissingBucket` reads does not change.
 */
const AWS_CLI_IMAGE = 'amazon/aws-cli:2.42.4'

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

export interface DockerDataServicesOptions {
  /** Where registry entries are released. */
  registry: Registry
  /** Injected in tests so no container is ever contacted. */
  run?: CommandRunner
  containers?: Partial<DepsContainers>
  environment?: NodeJS.ProcessEnv
}

/**
 * The real `EnvironmentDataServices`, implemented by `docker exec` into the dependency
 * containers.
 *
 * `docker exec` rather than network clients on purpose: this package is the
 * bootstrap step that runs before a developer's checkout is installed, so it
 * carries no `pg`, no Elasticsearch client and no S3 SDK. `psql`, `curl` and
 * `redis-cli` ship inside the image that owns the data. The RustFS image has
 * no S3 client, so bucket operations use the AWS CLI image instead.
 */
export function createDockerDataServices(
  options: DockerDataServicesOptions
): EnvironmentDataServices {
  const run = options.run ?? runCommand
  const env = options.environment ?? process.env
  const containers: DepsContainers = {
    ...DEPS_CONTAINERS,
    ...(env.POSTGRES_CONTAINER && { postgres: env.POSTGRES_CONTAINER }),
    ...(env.RUSTFS_CONTAINER && { rustfs: env.RUSTFS_CONTAINER }),
    ...(env.ELASTICSEARCH_CONTAINER && {
      elasticsearch: env.ELASTICSEARCH_CONTAINER
    }),
    ...options.containers
  }

  const s3Credentials = {
    AWS_ACCESS_KEY_ID:
      env.S3_ACCESS_KEY ?? env.RUSTFS_ACCESS_KEY ?? RUSTFS_DEFAULT_ACCESS_KEY,
    AWS_SECRET_ACCESS_KEY:
      env.S3_SECRET_KEY ?? env.RUSTFS_SECRET_KEY ?? RUSTFS_DEFAULT_SECRET_KEY,
    // RustFS accepts any region, and the CLI refuses to run without one.
    AWS_DEFAULT_REGION: 'us-east-1',
    // Stops the CLI from looking for EC2 instance credentials.
    AWS_EC2_METADATA_DISABLED: 'true'
  }

  /*
   * The credentials travel in the environment of the `docker` process. The
   * argv names only the variables (`-e NAME`), so the secret does not appear
   * in what `ps` or `docker inspect` shows.
   *
   * The runner does not throw on a non-zero exit here. One non-zero case,
   * "there was no bucket", is a success for both callers. Every other one must
   * reach the caller (see `isMissingBucket`), so the registry entry is never
   * released while the data survives.
   */
  function bucketOperation(
    s3Command: string[],
    bucket: string,
    verb: 'remove' | 'empty'
  ): BucketRemoval {
    const spec = {
      command: 'docker',
      args: [
        'run',
        '--rm',
        '--network',
        `container:${containers.rustfs}`,
        ...Object.keys(s3Credentials).flatMap((name) => ['-e', name]),
        AWS_CLI_IMAGE,
        '--endpoint-url',
        `http://localhost:${RUSTFS_INTERNAL_PORT}`,
        's3',
        ...s3Command,
        `s3://${bucket}`
      ],
      env: s3Credentials,
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
      `Could not ${verb} the S3 bucket "${bucket}": \`${describe(spec)}\` ` +
        `exited ${outcome.status}.\n` +
        `${[outcome.stderr, outcome.stdout]
          .map((stream) => stream.trim())
          .filter((stream) => stream !== '')
          .join('\n')}\n` +
        'The environment still owns its data, so nothing further was ' +
        'removed and its slot was not freed. Check that the dependency ' +
        'singleton is up (`pnpm dev --only-dependencies`) and re-run.'
    )
  }

  function psql(database: string, args: string[]) {
    return run({
      command: 'docker',
      args: [
        'exec',
        '-i',
        containers.postgres,
        'psql',
        '-U',
        'postgres',
        '-d',
        database,
        '-v',
        'ON_ERROR_STOP=1',
        ...args
      ]
    })
  }

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
      psql('postgres', [
        '-c',
        `DROP DATABASE IF EXISTS ${quoteIdentifier(dbName)} WITH (FORCE)`
      ])
    },

    dropSchemas(dbName, schemas) {
      const { stdout } = psql('postgres', [
        '-tAc',
        `SELECT 1 FROM pg_database WHERE datname = ${quoteLiteral(dbName)}`
      ])

      // Clearing an environment that has never been started is a no-op here;
      // `provision` creates the database afterwards.
      if (stdout.trim() !== '1') {
        return 'absent'
      }

      psql(
        dbName,
        schemas.flatMap((schema) => [
          '-c',
          `DROP SCHEMA IF EXISTS ${quoteIdentifier(schema)} CASCADE`
        ])
      )

      return 'dropped'
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

    removeBucket(bucket) {
      return bucketOperation(['rb', '--force'], bucket, 'remove')
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
    },

    emptyBucket(bucket) {
      // `rm --recursive` on the bucket itself removes every object but leaves
      // the bucket, so the documents service needs nothing recreated.
      return bucketOperation(['rm', '--recursive'], bucket, 'empty')
    },

    removeFile(filePath) {
      if (!fs.existsSync(filePath)) {
        return false
      }

      fs.rmSync(filePath)
      return true
    }
  }
}

/**
 * The one bucket failure that `env:destroy` and `env:clear` treat as success.
 *
 * The AWS CLI exits non-zero for a bucket that is not there. It also exits
 * non-zero when RustFS is unreachable, the credentials are wrong, the container
 * does not exist or the removal is denied. So the exit code alone cannot tell
 * a repeated run from a real failure. A blanket `allowFailure` would report
 * each of them as "removed bucket X" while the data survives and the slot is
 * freed.
 *
 * The CLI prints the S3 error code and its message:
 *
 * - `An error occurred (NoSuchBucket) when calling the ListObjectsV2
 *   operation: The specified bucket does not exist`
 *
 * Both patterns are kept, so that a change in how the code or the message is
 * printed does not break the check. The check is narrow on purpose: an
 * unmatched failure throws, which is the safe way to be wrong. "Connection
 * refused", "No such container", "SignatureDoesNotMatch" and "Access Denied"
 * all miss both patterns.
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

function quoteLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}
