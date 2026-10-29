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
import * as os from 'node:os'
import * as path from 'node:path'
import { describe, expect, it } from 'vitest'
import { EnvironmentDiscovery, planClear } from './data-plan'
import { planForTest } from './test-helpers'
import { resolveEnvironment } from './resolver'
import {
  BucketRemoval,
  EnvironmentDataServices,
  runClear,
  runDestroy
} from './environment-data'
import {
  createDockerDataServices,
  discoverEnvironmentsFromPostgres,
  isMissingBucket
} from './docker-services'
import { CommandOutcome, CommandSpec } from './exec'
import { Registry } from './registry'
import { RegistrySnapshot } from './types'

function snapshot(
  entries: Record<string, { slot: number; worktreePath: string }>
): RegistrySnapshot {
  return Object.fromEntries(
    Object.entries(entries).map(([name, entry]) => [
      name,
      { ...entry, lastUsedAt: '2026-01-01T00:00:00.000Z' }
    ])
  )
}

const registry = snapshot({
  opencrvs_core: { slot: 0, worktreePath: '/home/dev/opencrvs-core' },
  feature_a: { slot: 1, worktreePath: '/home/dev/wt/feature-a' },
  feature_b: { slot: 2, worktreePath: '/home/dev/wt/feature-b' }
})

/**
 * A `EnvironmentDataServices` that records what was asked of it instead of doing it.
 * The operation log is the assertion surface: it is the only place the question
 * "what would this actually delete?" can be answered without containers.
 */
function recordingServices(
  indices: string[] = [],
  bucketRemoval: BucketRemoval = 'removed',
  databaseExists = true
) {
  const operations: string[] = []

  const services: EnvironmentDataServices = {
    dropDatabase(dbName) {
      operations.push(`dropDatabase ${dbName}`)
    },
    listIndices() {
      operations.push('listIndices')
      return indices
    },
    deleteIndex(index) {
      operations.push(`deleteIndex ${index}`)
    },
    removeBucket(bucket) {
      operations.push(`removeBucket ${bucket}`)
      return bucketRemoval
    },
    flushRedisDb(db) {
      operations.push(`flushRedisDb ${db}`)
    },
    releaseRegistryEntry(name) {
      operations.push(`releaseRegistryEntry ${name}`)
    },
    dropSchemas(dbName, schemas) {
      operations.push(`dropSchemas ${dbName} ${schemas.join(',')}`)
      return databaseExists ? 'dropped' : 'absent'
    },
    emptyBucket(bucket) {
      operations.push(`emptyBucket ${bucket}`)
      return bucketRemoval
    },
    removeFile(filePath) {
      operations.push(`removeFile ${filePath}`)
      return true
    }
  }

  return { services, operations }
}

describe('runDestroy', () => {
  it('requests exactly the operations a registered environment’s plan describes', () => {
    const { services, operations } = recordingServices([
      'events_feature_a_v2_births',
      'events_feature_a_reindexing_status',
      'events_v2_births',
      'reindexing_status',
      'events_feature_b_v2_births'
    ])

    const outcome = runDestroy({
      plan: planForTest({ name: 'feature-a', snapshot: registry }),
      services
    })

    expect(operations).toEqual([
      'dropDatabase events_feature_a',
      'listIndices',
      'deleteIndex events_feature_a_v2_births',
      'deleteIndex events_feature_a_reindexing_status',
      'removeBucket feature-a--ocrvs',
      'flushRedisDb 1',
      'releaseRegistryEntry feature_a'
    ])
    expect(outcome.exitCode).toBe(0)
    expect(outcome.refused).toBe(false)
  })

  it('never touches another environment’s database, bucket or Redis DB', () => {
    const { services, operations } = recordingServices([
      'events_v2_births',
      'events_feature_b_v2_births'
    ])

    runDestroy({
      plan: planForTest({ name: 'feature-a', snapshot: registry }),
      services
    })

    expect(operations).not.toContain('dropDatabase events')
    expect(operations).not.toContain('dropDatabase events_feature_b')
    expect(operations).not.toContain('removeBucket ocrvs')
    expect(operations).not.toContain('removeBucket feature-b--ocrvs')
    expect(operations).not.toContain('flushRedisDb 0')
    expect(operations).not.toContain('flushRedisDb 2')
    expect(operations.filter((op) => op.startsWith('deleteIndex'))).toEqual([])
  })

  it('requests no operation at all for a refused plan', () => {
    const { services, operations } = recordingServices([
      'events_v2_births',
      'reindexing_status'
    ])
    const errors: string[] = []

    const outcome = runDestroy({
      plan: planForTest({
        name: 'opencrvs-core',
        snapshot: registry,
        registeredWorktreeIsPrimary: true
      }),
      services,
      err: (message) => errors.push(message)
    })

    expect(operations).toEqual([])
    expect(outcome.refused).toBe(true)
    expect(outcome.exitCode).toBe(1)
    expect(outcome.releasedRegistryEntry).toBe(false)
    expect(errors.join('\n')).toMatch(/--force/)
  })

  it('destroys the default environment’s shared data only when forced', () => {
    const { services, operations } = recordingServices([
      'events_v2_births',
      'reindexing_status',
      'events_feature_a_v2_births'
    ])

    runDestroy({
      plan: planForTest({
        name: 'opencrvs-core',
        snapshot: registry,
        registeredWorktreeIsPrimary: true,
        force: true
      }),
      services
    })

    expect(operations).toEqual([
      'dropDatabase events',
      'listIndices',
      'deleteIndex events_v2_births',
      'deleteIndex reindexing_status',
      'removeBucket ocrvs',
      'flushRedisDb 0',
      'releaseRegistryEntry opencrvs_core'
    ])
  })

  it('cleans up an unregistered name’s data but flushes nothing and releases nothing', () => {
    const { services, operations } = recordingServices([
      'events_gone_v2_births'
    ])
    const errors: string[] = []

    const outcome = runDestroy({
      plan: planForTest({ name: 'gone', snapshot: registry }),
      services,
      err: (message) => errors.push(message)
    })

    expect(operations).toEqual([
      'dropDatabase events_gone',
      'listIndices',
      'deleteIndex events_gone_v2_births',
      'removeBucket gone--ocrvs'
    ])
    expect(outcome.exitCode).toBe(0)
    expect(errors.join('\n')).toMatch(/not in the registry/)
  })

  it('releases the registry entry only after the data is gone', () => {
    const { services, operations } = recordingServices()

    runDestroy({
      plan: planForTest({ name: 'feature-b', snapshot: registry }),
      services
    })

    expect(operations[operations.length - 1]).toBe(
      'releaseRegistryEntry feature_b'
    )
  })

  it('leaves the slot claimed when a step fails, so data can never outlive its entry', () => {
    const { services, operations } = recordingServices()
    const failing: EnvironmentDataServices = {
      ...services,
      removeBucket() {
        throw new Error('minio is not running')
      }
    }

    expect(() =>
      runDestroy({
        plan: planForTest({ name: 'feature-a', snapshot: registry }),
        services: failing
      })
    ).toThrow(/minio is not running/)

    expect(operations).not.toContain('releaseRegistryEntry feature_a')
  })

  it('does not claim to have removed a bucket that was never there', () => {
    const { services } = recordingServices([], 'absent')
    const lines: string[] = []

    const outcome = runDestroy({
      plan: planForTest({ name: 'feature-a', snapshot: registry }),
      services,
      out: (message) => lines.push(message)
    })

    expect(lines).toContain('  no bucket feature-a--ocrvs to remove')
    expect(lines).not.toContain('  removed bucket feature-a--ocrvs')
    expect(outcome.removedBucket).toBeUndefined()
    // "There was no bucket" is still a complete destroy: the slot is freed.
    expect(outcome.releasedRegistryEntry).toBe(true)
  })

  it('reports the bucket as removed only when one actually was', () => {
    const { services } = recordingServices()

    const outcome = runDestroy({
      plan: planForTest({ name: 'feature-a', snapshot: registry }),
      services
    })

    expect(outcome.removedBucket).toBe('feature-a--ocrvs')
  })
})

describe('runClear', () => {
  function clearPlan(
    name: string,
    isDefaultEnvironment = false,
    discovery: EnvironmentDiscovery = { names: [] }
  ) {
    return planClear({
      environment: resolveEnvironment({
        name,
        worktreePath: registry[name].worktreePath,
        isDefaultEnvironment,
        registry
      }),
      snapshot: registry,
      discovery
    })
  }

  it('empties a named environment’s data but keeps its database, slot and Redis DB', () => {
    const { services, operations } = recordingServices([
      'events_feature_a_v2_births',
      'events_feature_a_reindexing_status',
      'events_v2_births',
      'events_feature_b_v2_births'
    ])

    const outcome = runClear({ plan: clearPlan('feature_a'), services })

    expect(operations).toEqual([
      'listIndices',
      'deleteIndex events_feature_a_v2_births',
      'deleteIndex events_feature_a_reindexing_status',
      'emptyBucket feature-a--ocrvs',
      'removeFile /home/dev/wt/feature-a/data/sqlite/mosip-api-feature_a.db',
      'dropSchemas events_feature_a app,analytics'
    ])
    expect(outcome.deletedIndices).toHaveLength(2)
  })

  it('clears the default environment without touching any named environment’s indices', () => {
    const { services, operations } = recordingServices([
      'events_v2_births',
      'reindexing_status',
      'events_feature_a_v2_births',
      'events_feature_b_v2_births'
    ])

    runClear({ plan: clearPlan('opencrvs_core', true), services })

    expect(operations.filter((op) => op.startsWith('deleteIndex'))).toEqual([
      'deleteIndex events_v2_births',
      'deleteIndex reindexing_status'
    ])
    expect(operations).toContain('emptyBucket ocrvs')
    expect(operations).toContain('dropSchemas events app,analytics')
  })

  it('protects an environment found only in Postgres', () => {
    const { services, operations } = recordingServices([
      'events_v2_births',
      'events_feature_c_v2_births'
    ])

    runClear({
      plan: clearPlan('opencrvs_core', true, { names: ['feature_c'] }),
      services
    })

    expect(operations).not.toContain('deleteIndex events_feature_c_v2_births')
  })

  it('deletes no index when other environments could not be established, and says why', () => {
    const { services, operations } = recordingServices(['events_v2_births'])
    const errors: string[] = []

    runClear({
      plan: clearPlan('opencrvs_core', true, {
        names: [],
        failure: 'Postgres is not reachable'
      }),
      services,
      err: (message) => errors.push(message)
    })

    expect(operations.filter((op) => op.startsWith('deleteIndex'))).toEqual([])
    expect(errors.join('\n')).toMatch(/Postgres is not reachable/)
    // Everything named exactly is still cleared.
    expect(operations).toContain('dropSchemas events app,analytics')
  })

  it('says so when the database does not exist yet', () => {
    const { services } = recordingServices([], 'absent', false)
    const messages: string[] = []

    runClear({
      plan: clearPlan('feature_a'),
      services,
      out: (message) => messages.push(message)
    })

    expect(messages.join('\n')).toMatch(/events_feature_a.*does not exist/)
  })
})

describe('createDockerDataServices', () => {
  const stubRegistry = {
    stateFilePath: '/nowhere/envs.json',
    read: () => ({}),
    write: () => undefined,
    findStaleNames: () => [],
    recordUse: () => ({}),
    release: () => ({})
  } as unknown as Registry

  function capturing(stdout = '', outcome?: Partial<CommandOutcome>) {
    const specs: CommandSpec[] = []

    const services = createDockerDataServices({
      registry: stubRegistry,
      environment: {},
      run: (spec) => {
        specs.push(spec)
        return { status: 0, stdout, stderr: '', ...outcome }
      }
    })

    return { services, specs }
  }

  it('drops the database inside the deps Postgres container, forcing sessions off', () => {
    const { services, specs } = capturing()

    services.dropDatabase('events_feature_a')

    expect(specs[0].command).toBe('docker')
    expect(specs[0].args).toContain('opencrvs-deps-postgres-1')
    expect(specs[0].args[specs[0].args.length - 1]).toBe(
      'DROP DATABASE IF EXISTS "events_feature_a" WITH (FORCE)'
    )
  })

  it('reads the index list from Elasticsearch as one name per line', () => {
    const { services } = capturing(
      'events_feature_a_v2_births\nevents_v2_births\n\n'
    )

    expect(services.listIndices()).toEqual([
      'events_feature_a_v2_births',
      'events_v2_births'
    ])
  })

  it('reports a bucket it removed', () => {
    const { services, specs } = capturing()

    expect(services.removeBucket('feature-a--ocrvs')).toBe('removed')
    expect(specs[0].args).toContain('deps/feature-a--ocrvs')
  })

  it('treats a missing bucket as success, so destroy stays idempotent', () => {
    // What `mc rb` prints when the bucket is not there: the S3 `NoSuchBucket`
    // message, rendered by `mc`, on a non-zero exit.
    const { services, specs } = capturing('', {
      status: 1,
      stderr:
        'mc: <ERROR> Unable to validate target `deps/feature-a--ocrvs`. ' +
        'The specified bucket does not exist.\n'
    })

    expect(services.removeBucket('feature-a--ocrvs')).toBe('absent')
    // Non-zero has to reach this adapter for it to tell the two cases apart.
    expect(specs[0].allowFailure).toBe(true)
  })

  it.each([
    [
      'MinIO unreachable',
      'mc: <ERROR> Unable to validate target `deps/feature-a--ocrvs`. ' +
        'Get "http://localhost:3535/feature-a--ocrvs/": dial tcp ' +
        '127.0.0.1:3535: connect: connection refused'
    ],
    [
      'the credentials are rejected',
      'mc: <ERROR> Unable to remove bucket `deps/feature-a--ocrvs`. ' +
        'Access Denied.'
    ],
    [
      'the dependency singleton is not running',
      'Error response from daemon: No such container: opencrvs-deps-minio-1'
    ]
  ])(
    'raises rather than reporting success when %s',
    (_case: string, stderr: string) => {
      const { services } = capturing('', { status: 1, stderr })

      expect(() => services.removeBucket('feature-a--ocrvs')).toThrow(
        /Could not remove the MinIO bucket "feature-a--ocrvs"/
      )
      // The message has to say the data survived, because the developer's next
      // move — believing the environment is gone — is the dangerous one.
      expect(() => services.removeBucket('feature-a--ocrvs')).toThrow(
        /slot was not freed/
      )
    }
  )

  it('drops the cleared schemas in an existing database only', () => {
    const { services, specs } = capturing('1\n')

    expect(services.dropSchemas('events_feature_a', ['app', 'analytics'])).toBe(
      'dropped'
    )
    expect(specs[0].args[specs[0].args.length - 1]).toBe(
      "SELECT 1 FROM pg_database WHERE datname = 'events_feature_a'"
    )
    expect(specs[1].args).toEqual(
      expect.arrayContaining([
        'opencrvs-deps-postgres-1',
        'events_feature_a',
        'DROP SCHEMA IF EXISTS "app" CASCADE',
        'DROP SCHEMA IF EXISTS "analytics" CASCADE'
      ])
    )
  })

  it('reports a database that does not exist yet instead of failing', () => {
    const { services, specs } = capturing('')

    expect(services.dropSchemas('events_feature_a', ['app'])).toBe('absent')
    expect(specs).toHaveLength(1)
  })

  it('empties a bucket without removing it', () => {
    const { services, specs } = capturing()

    expect(services.emptyBucket('feature-a--ocrvs')).toBe('removed')
    expect(specs[0].args.slice(-4)).toEqual([
      'rm',
      '--recursive',
      '--force',
      'deps/feature-a--ocrvs'
    ])
  })

  it('treats emptying a missing bucket as nothing to do', () => {
    // What `mc rm --recursive` prints for a bucket that is not there.
    const { services } = capturing('', {
      status: 1,
      stderr:
        'mc: <ERROR> Failed to remove `deps/feature-a--ocrvs` recursively. ' +
        'The specified bucket does not exist'
    })

    expect(services.emptyBucket('feature-a--ocrvs')).toBe('absent')
  })

  it('raises when a bucket cannot be emptied for any other reason', () => {
    const { services } = capturing('', {
      status: 1,
      stderr: 'Error response from daemon: No such container: x'
    })

    expect(() => services.emptyBucket('feature-a--ocrvs')).toThrow(
      /Could not empty the MinIO bucket "feature-a--ocrvs"/
    )
  })

  it('removes a file in the checkout, reporting whether there was one', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocrvs-dev-cli-'))
    const file = path.join(dir, 'mosip-api.db')
    fs.writeFileSync(file, '')
    const { services } = capturing()

    expect(services.removeFile(file)).toBe(true)
    expect(fs.existsSync(file)).toBe(false)
    expect(services.removeFile(file)).toBe(false)

    fs.rmSync(dir, { recursive: true, force: true })
  })

  it('honours POSTGRES_CONTAINER and MINIO_CONTAINER, like the shell scripts do', () => {
    const specs: CommandSpec[] = []
    const services = createDockerDataServices({
      registry: stubRegistry,
      environment: {
        POSTGRES_CONTAINER: 'my-postgres',
        MINIO_CONTAINER: 'my-minio'
      },
      run: (spec) => {
        specs.push(spec)
        return { status: 0, stdout: '', stderr: '' }
      }
    })

    services.dropDatabase('events_feature_a')
    services.emptyBucket('feature-a--ocrvs')

    expect(specs[0].args).toContain('my-postgres')
    expect(specs[1].args).toContain('my-minio')
  })

  it('flushes only the named logical database', () => {
    const { services, specs } = capturing()

    services.flushRedisDb(3)

    expect(specs[0].args).toContain('opencrvs-deps-redis-1')
    expect(specs[0].args.slice(-3)).toEqual(['-n', '3', 'FLUSHDB'])
  })
})

describe('isMissingBucket', () => {
  it('recognises the message mc renders for a bucket that is not there', () => {
    expect(
      isMissingBucket(
        'mc: <ERROR> Unable to validate target `deps/gone--ocrvs`. ' +
          'The specified bucket does not exist.'
      )
    ).toBe(true)
  })

  it('recognises the raw S3 error code, which is what --json output carries', () => {
    expect(
      isMissingBucket(
        '{"status":"error","error":{"cause":{"error":{"Code":"NoSuchBucket"}}}}'
      )
    ).toBe(true)
  })

  it.each([
    'dial tcp 127.0.0.1:3535: connect: connection refused',
    'mc: <ERROR> Unable to remove bucket `deps/x--ocrvs`. Access Denied.',
    'Error response from daemon: No such container: opencrvs-deps-minio-1',
    'The Access Key Id you provided does not exist in our records.',
    ''
  ])('does not mistake %j for a missing bucket', (output) => {
    expect(isMissingBucket(output)).toBe(false)
  })
})

describe('discoverEnvironmentsFromPostgres', () => {
  it('lists every events_<name> database as an environment name', () => {
    const specs: CommandSpec[] = []

    const discovery = discoverEnvironmentsFromPostgres({
      environment: {},
      run: (spec) => {
        specs.push(spec)
        return {
          status: 0,
          stdout: 'events\nevents_feature_a\nevents_feature_b\n\n',
          stderr: ''
        }
      }
    })

    expect(discovery).toEqual({ names: ['feature_a', 'feature_b'] })
    expect(specs[0].command).toBe('docker')
    expect(specs[0].args).toContain('opencrvs-deps-postgres-1')
  })

  it('reports a failure instead of an empty list when Postgres cannot be reached', () => {
    const discovery = discoverEnvironmentsFromPostgres({
      environment: {},
      run: () => {
        throw new Error('Cannot connect to the Docker daemon')
      }
    })

    expect(discovery.names).toEqual([])
    expect(discovery.failure).toMatch(/Cannot connect to the Docker daemon/)
  })

  it('honours a POSTGRES_CONTAINER override, like the shell scripts do', () => {
    const specs: CommandSpec[] = []

    discoverEnvironmentsFromPostgres({
      environment: { POSTGRES_CONTAINER: 'my-postgres' },
      run: (spec) => {
        specs.push(spec)
        return { status: 0, stdout: '', stderr: '' }
      }
    })

    expect(specs[0].args).toContain('my-postgres')
  })
})
