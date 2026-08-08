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
import { describe, expect, it } from 'vitest'
import { DestroyPlan, planDestroy, PlanDestroyInput } from './destroy'
import { DestroyServices, runDestroy } from './destroy-command'
import {
  createDockerDestroyServices,
  discoverEnvironmentsFromPostgres
} from './destroy-services'
import { CommandSpec } from './exec'
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
 * A `DestroyServices` that records what was asked of it instead of doing it.
 * The operation log is the assertion surface: it is the only place the question
 * "what would this actually delete?" can be answered without containers.
 */
function recordingServices(indices: string[] = []) {
  const operations: string[] = []

  const services: DestroyServices = {
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
    },
    flushRedisDb(db) {
      operations.push(`flushRedisDb ${db}`)
    },
    releaseRegistryEntry(name) {
      operations.push(`releaseRegistryEntry ${name}`)
    }
  }

  return { services, operations }
}

/**
 * Every case below plans with discovery that ran and found nothing beyond the
 * registry. Discovery is a required input precisely so that no call site can
 * quietly assume the registry is a complete list of what exists — the cases
 * that exercise that assumption call `planDestroy` directly.
 */
function planFor(input: Omit<PlanDestroyInput, 'discovery'>): DestroyPlan {
  return planDestroy({ ...input, discovery: { names: [] } })
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
      plan: planFor({ name: 'feature-a', snapshot: registry }),
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
      plan: planFor({ name: 'feature-a', snapshot: registry }),
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
      plan: planFor({
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
      plan: planFor({
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
      plan: planFor({ name: 'gone', snapshot: registry }),
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
      plan: planFor({ name: 'feature-b', snapshot: registry }),
      services
    })

    expect(operations[operations.length - 1]).toBe(
      'releaseRegistryEntry feature_b'
    )
  })

  it('leaves the slot claimed when a step fails, so data can never outlive its entry', () => {
    const { services, operations } = recordingServices()
    const failing: DestroyServices = {
      ...services,
      removeBucket() {
        throw new Error('minio is not running')
      }
    }

    expect(() =>
      runDestroy({
        plan: planFor({ name: 'feature-a', snapshot: registry }),
        services: failing
      })
    ).toThrow(/minio is not running/)

    expect(operations).not.toContain('releaseRegistryEntry feature_a')
  })
})

describe('createDockerDestroyServices', () => {
  const stubRegistry = {
    stateFilePath: '/nowhere/envs.json',
    read: () => ({}),
    write: () => undefined,
    findStaleNames: () => [],
    recordUse: () => ({}),
    release: () => ({})
  } as unknown as Registry

  function capturing(stdout = '') {
    const specs: CommandSpec[] = []

    const services = createDockerDestroyServices({
      registry: stubRegistry,
      environment: {},
      run: (spec) => {
        specs.push(spec)
        return { status: 0, stdout, stderr: '' }
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

  it('treats a missing bucket as success, so destroy stays idempotent', () => {
    const { services, specs } = capturing()

    services.removeBucket('feature-a--ocrvs')

    expect(specs[0].allowFailure).toBe(true)
    expect(specs[0].args).toContain('deps/feature-a--ocrvs')
  })

  it('flushes only the named logical database', () => {
    const { services, specs } = capturing()

    services.flushRedisDb(3)

    expect(specs[0].args).toContain('opencrvs-deps-redis-1')
    expect(specs[0].args.slice(-3)).toEqual(['-n', '3', 'FLUSHDB'])
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
