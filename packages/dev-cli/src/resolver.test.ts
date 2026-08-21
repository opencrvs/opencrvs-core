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
import { RegistrySnapshot, ServiceName } from './types'
import {
  BASE_PORTS,
  LEGACY_BUCKET,
  LEGACY_DB_NAME,
  LEGACY_ES_PREFIX,
  LEGACY_ES_REINDEXING_STATUS_INDEX,
  LEGACY_MOSIP_DATABASE_FILE,
  MAX_SLOT,
  PORT_STRIDE,
  SlotAllocationError,
  portsForSlot,
  strideFor,
  bucketNameForEnvironment,
  deriveEnvironmentName,
  hasExplicitName,
  resolveEnvironment,
  sanitizeEnvironmentName
} from './resolver'

const AT = '2026-01-01T00:00:00.000Z'

/**
 * The port values asserted here are the values the repository uses today, each
 * verified against its source:
 *
 * - client 3000            packages/client/package.json (`vite --port=3000`)
 * - login 3020             packages/login/package.json (`vite --port=3020`)
 * - gateway 7070           packages/gateway/src/environment.ts (`PORT`)
 * - auth 4040              packages/auth/src/environment.ts (`AUTH_PORT`)
 * - countryConfig 3040     packages/testland/src/environment.ts
 * - events 5555            packages/events/src/index.ts (`server().listen`)
 * - documents 9050         packages/documents/src/constants.ts
 * - storybook 6060         packages/components/package.json (`storybook`)
 * - clientStorybook 6006   packages/client/package.json (`storybook`)
 * - apiDocs 3003           packages/api-docs/package.json (`start`)
 * - metabase 4444          packages/testland/assets/metabase/run-dev.sh
 * - mosipApi 2024          packages/mosip-api/src/constants.ts
 * - mosipMock 20240        packages/mosip-mock/src/constants.ts
 * - esignetMock 20260      packages/esignet-mock/src/constants.ts
 */
const TODAYS_PORTS = {
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
  metabase: 4444,
  mosipApi: 2024,
  mosipMock: 20240,
  esignetMock: 20260
}

function entry(slot: number, worktreePath: string) {
  return { slot, worktreePath, lastUsedAt: AT }
}

const primaryRegistered: RegistrySnapshot = {
  opencrvs_core: entry(0, '/home/dev/opencrvs-core')
}

describe('resolveEnvironment: primary worktree', () => {
  it('assigns slot 0 and reproduces the ports the repo uses today', () => {
    const descriptor = resolveEnvironment({
      name: 'opencrvs-core',
      worktreePath: '/home/dev/opencrvs-core',
      isPrimaryWorktree: true,
      isDefaultEnvironment: true,
      registry: {}
    })

    expect(descriptor.slot).toBe(0)
    expect(descriptor.ports).toEqual(TODAYS_PORTS)
  })

  it('keeps today’s legacy identifiers, so the primary checkout never re-seeds', () => {
    const descriptor = resolveEnvironment({
      name: 'opencrvs-core',
      worktreePath: '/home/dev/opencrvs-core',
      isPrimaryWorktree: true,
      isDefaultEnvironment: true,
      registry: {}
    })

    // Today's values: packages/events EVENTS_POSTGRES_URL devDefault database
    // and ES_INDEX_PREFIX default, packages/documents MINIO_BUCKET default.
    expect(descriptor.dbName).toBe('events')
    expect(descriptor.esPrefix).toBe('events')
    expect(descriptor.esReindexingStatusIndex).toBe('reindexing_status')
    expect(descriptor.bucket).toBe('ocrvs')
    expect(descriptor.redisDb).toBe(0)
    // The registry is still keyed by the sanitized worktree name.
    expect(descriptor.name).toBe('opencrvs_core')
  })

  it('keeps slot 0 even when linked worktrees already occupy other slots', () => {
    const descriptor = resolveEnvironment({
      name: 'opencrvs-core',
      worktreePath: '/home/dev/opencrvs-core',
      isPrimaryWorktree: true,
      isDefaultEnvironment: true,
      registry: {
        feature_a: entry(1, '/home/dev/wt/feature-a'),
        feature_b: entry(2, '/home/dev/wt/feature-b')
      }
    })

    expect(descriptor.slot).toBe(0)
    expect(descriptor.ports).toEqual(TODAYS_PORTS)
  })

  it('switches to derived identifiers when the primary is given an explicit name', () => {
    const descriptor = resolveEnvironment({
      name: 'scratch-env',
      worktreePath: '/home/dev/opencrvs-core',
      isPrimaryWorktree: true,
      // `--env scratch-env` was passed: a named environment is a separate one.
      isDefaultEnvironment: false,
      registry: {}
    })

    expect(descriptor.slot).toBe(0)
    expect(descriptor.ports).toEqual(TODAYS_PORTS)
    expect(descriptor.dbName).toBe('events_scratch_env')
    expect(descriptor.esPrefix).toBe('events_scratch_env')
    expect(descriptor.esReindexingStatusIndex).toBe(
      'events_scratch_env_reindexing_status'
    )
    expect(descriptor.bucket).toBe('scratch-env--ocrvs')
  })

  it('does not key legacy identifiers off slot 0 — a linked worktree at slot 0 would still derive', () => {
    // A linked worktree can never be the default environment, so even if it
    // somehow held slot 0 it must not claim the shared `events` database.
    const descriptor = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: { feature_a: entry(0, '/home/dev/wt/feature-a') }
    })

    expect(descriptor.slot).toBe(0)
    expect(descriptor.dbName).toBe('events_feature_a')
    expect(descriptor.bucket).toBe('feature-a--ocrvs')
  })
})

describe('resolveEnvironment: linked worktrees', () => {
  it('takes the next lowest free slot and offsets every port by slot*10000', () => {
    const descriptor = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: primaryRegistered
    })

    expect(descriptor.slot).toBe(1)
    expect(descriptor.ports).toEqual({
      client: 13000,
      login: 13020,
      gateway: 17070,
      auth: 14040,
      countryConfig: 13040,
      events: 15555,
      documents: 19050,
      storybook: 16060,
      clientStorybook: 16006,
      apiDocs: 13003,
      metabase: 14444,
      mosipApi: 12024,
      // The MOSIP mocks ride a 100-port stride; their bases are too high for
      // the default one to survive to slot 5. See PORT_STRIDES.
      mosipMock: 20340,
      esignetMock: 20360
    })

    for (const [service, port] of Object.entries(descriptor.ports)) {
      expect(port).toBe(
        TODAYS_PORTS[service as keyof typeof TODAYS_PORTS] +
          descriptor.slot * strideFor(service as ServiceName)
      )
    }
  })

  it('never hands slot 0 to a linked worktree, so the primary keeps it', () => {
    const descriptor = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: {}
    })

    expect(descriptor.slot).toBe(1)
  })

  it('reuses the lowest freed slot rather than appending after the highest', () => {
    const descriptor = resolveEnvironment({
      name: 'feature-d',
      worktreePath: '/home/dev/wt/feature-d',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      // slot 2 was freed by a destroyed environment
      registry: {
        ...primaryRegistered,
        feature_a: entry(1, '/home/dev/wt/feature-a'),
        feature_c: entry(3, '/home/dev/wt/feature-c')
      }
    })

    expect(descriptor.slot).toBe(2)
    expect(descriptor.ports.documents).toBe(9050 + 2 * PORT_STRIDE)
  })

  it('treats slots held by stale entries as free', () => {
    const descriptor = resolveEnvironment({
      name: 'feature-new',
      worktreePath: '/home/dev/wt/feature-new',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: {
        ...primaryRegistered,
        deleted_worktree: entry(1, '/home/dev/wt/deleted-worktree'),
        feature_c: entry(2, '/home/dev/wt/feature-c')
      },
      staleNames: ['deleted_worktree']
    })

    expect(descriptor.slot).toBe(1)
  })
})

describe('resolveEnvironment: stability', () => {
  it('re-resolving a registered name returns the same slot, ports and identifiers', () => {
    const first = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: primaryRegistered
    })

    const registry: RegistrySnapshot = {
      ...primaryRegistered,
      [first.name]: entry(first.slot, first.worktreePath),
      // a neighbour has since claimed the next slot up
      feature_b: entry(2, '/home/dev/wt/feature-b')
    }

    const second = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry
    })

    expect(second).toEqual(first)
  })

  it('reuses the recorded slot of a stale entry when its name is resolved again', () => {
    const descriptor = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a-recreated',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: {
        ...primaryRegistered,
        feature_a: entry(3, '/home/dev/wt/feature-a')
      },
      staleNames: ['feature_a']
    })

    expect(descriptor.slot).toBe(3)
  })
})

describe('resolveEnvironment: slot uniqueness after lazy GC', () => {
  it('does not hand a name back the slot a live environment took over while it was stale', () => {
    // 1. `feature-a` holds slot 1.
    const registry: RegistrySnapshot = {
      ...primaryRegistered,
      feature_a: entry(1, '/home/dev/wt/feature-a')
    }

    // 2. Its worktree is deleted, so lazy GC stops its claim on slot 1, and
    //    `feature-b` is allocated it.
    const b = resolveEnvironment({
      name: 'feature-b',
      worktreePath: '/home/dev/wt/feature-b',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry,
      staleNames: ['feature_a']
    })

    expect(b.slot).toBe(1)
    registry.feature_b = entry(b.slot, b.worktreePath)

    // 3. The worktree is recreated, so `feature-a` is no longer stale and
    //    resolves again — against a registry where slot 1 is now taken.
    const a = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry
    })

    // 4. Two live environments must never share a slot: same port block, same
    //    REDIS_DB.
    expect(a.slot).not.toBe(b.slot)
    expect(a.slot).toBe(2)
    expect(a.redisDb).not.toBe(b.redisDb)
    expect(a.ports.documents).not.toBe(b.ports.documents)
  })

  it('still returns a re-registered name its own data, because data follows the name not the slot', () => {
    const a = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: {
        ...primaryRegistered,
        // `feature-a`'s recorded slot, taken over by a live neighbour.
        feature_a: entry(1, '/home/dev/wt/feature-a'),
        feature_b: entry(1, '/home/dev/wt/feature-b')
      }
    })

    expect(a.slot).not.toBe(1)
    expect(a.dbName).toBe('events_feature_a')
    expect(a.esPrefix).toBe('events_feature_a')
    expect(a.esReindexingStatusIndex).toBe('events_feature_a_reindexing_status')
    expect(a.bucket).toBe('feature-a--ocrvs')
  })

  it('keeps the recorded slot when the environment that borrowed it is itself now stale', () => {
    const descriptor = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: {
        ...primaryRegistered,
        feature_a: entry(1, '/home/dev/wt/feature-a'),
        feature_b: entry(1, '/home/dev/wt/feature-b')
      },
      staleNames: ['feature_b']
    })

    expect(descriptor.slot).toBe(1)
  })

  it('refuses rather than doubling up when the recorded slot is taken and none is free', () => {
    const resolve = () =>
      resolveEnvironment({
        name: 'feature-a',
        worktreePath: '/home/dev/wt/feature-a',
        isPrimaryWorktree: false,
        isDefaultEnvironment: false,
        registry: {
          ...primaryRegistered,
          feature_a: entry(1, '/home/dev/wt/feature-a'),
          env_1: entry(1, '/home/dev/wt/1'),
          env_2: entry(2, '/home/dev/wt/2'),
          env_3: entry(3, '/home/dev/wt/3'),
          env_4: entry(4, '/home/dev/wt/4'),
          env_5: entry(5, '/home/dev/wt/5')
        }
      })

    expect(resolve).toThrow(SlotAllocationError)
  })
})

describe('resolveEnvironment: derived identifiers', () => {
  it('uses the `_` form for Postgres/Elasticsearch and the `-` form for the bucket', () => {
    const descriptor = resolveEnvironment({
      name: 'my-feature-branch',
      worktreePath: '/home/dev/wt/my-feature-branch',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: primaryRegistered
    })

    expect(descriptor.name).toBe('my_feature_branch')
    expect(descriptor.dbName).toBe('events_my_feature_branch')
    expect(descriptor.esPrefix).toBe('events_my_feature_branch')
    // Composed the way packages/events/src/storage/elasticsearch.ts composes
    // every other index name: `${ES_INDEX_PREFIX}_${suffix}`.
    expect(descriptor.esReindexingStatusIndex).toBe(
      'events_my_feature_branch_reindexing_status'
    )
    // Underscores are illegal in S3/MinIO bucket names, so the bucket keeps
    // hyphens — the ADR table's literal `<name>--ocrvs`.
    expect(descriptor.bucket).toBe('my-feature-branch--ocrvs')
  })

  it('produces a legal bucket even when the directory name itself has underscores', () => {
    const descriptor = resolveEnvironment({
      name: 'my_feature',
      worktreePath: '/home/dev/wt/my_feature',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: primaryRegistered
    })

    expect(descriptor.name).toBe('my_feature')
    expect(descriptor.dbName).toBe('events_my_feature')
    expect(descriptor.bucket).toBe('my-feature--ocrvs')
  })

  it('gives every named environment its own reindexing-status index', () => {
    // ES_REINDEXING_STATUS_INDEX is NOT derived from ES_INDEX_PREFIX inside
    // packages/events, so without this the whole machine would share one
    // `reindexing_status` index and a reindex in one environment would stomp
    // another's status.
    const descriptor = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: primaryRegistered
    })

    expect(descriptor.esReindexingStatusIndex).toBe(
      'events_feature_a_reindexing_status'
    )
    expect(
      descriptor.esReindexingStatusIndex.startsWith(descriptor.esPrefix)
    ).toBe(true)
  })

  it('sets redisDb equal to slot for every allocatable slot', () => {
    const registry: RegistrySnapshot = {}

    for (let slot = 0; slot <= MAX_SLOT; slot++) {
      const descriptor = resolveEnvironment({
        name: `env-${slot}`,
        worktreePath: `/home/dev/wt/env-${slot}`,
        isPrimaryWorktree: slot === 0,
        isDefaultEnvironment: slot === 0,
        registry
      })

      expect(descriptor.slot).toBe(slot)
      expect(descriptor.redisDb).toBe(slot)
      registry[descriptor.name] = entry(
        descriptor.slot,
        descriptor.worktreePath
      )
    }
  })

  it('derives peer URLs from the slot-shifted ports', () => {
    const descriptor = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: primaryRegistered
    })

    expect(descriptor.urls).toEqual({
      client: 'http://localhost:13000/',
      login: 'http://localhost:13020/',
      gateway: 'http://localhost:17070',
      auth: 'http://localhost:14040',
      countryConfig: 'http://localhost:13040',
      countryConfigInternal: 'http://localhost:13040/',
      events: 'http://localhost:15555/',
      documents: 'http://localhost:19050',
      mosipApi: 'http://localhost:12024',
      mosipMock: 'http://localhost:20340',
      esignetMock: 'http://localhost:20360'
    })
  })
})

describe('resolveEnvironment: slot ceiling', () => {
  const full: RegistrySnapshot = {
    opencrvs_core: entry(0, '/home/dev/opencrvs-core'),
    env_a: entry(1, '/home/dev/wt/a'),
    env_b: entry(2, '/home/dev/wt/b'),
    env_c: entry(3, '/home/dev/wt/c'),
    env_d: entry(4, '/home/dev/wt/d'),
    env_e: entry(5, '/home/dev/wt/e')
  }

  it('refuses the seventh environment with an actionable error', () => {
    const resolve = () =>
      resolveEnvironment({
        name: 'env-f',
        worktreePath: '/home/dev/wt/f',
        isPrimaryWorktree: false,
        isDefaultEnvironment: false,
        registry: full
      })

    expect(resolve).toThrow(SlotAllocationError)
    try {
      resolve()
    } catch (error) {
      const message = (error as Error).message
      // Names the ceiling, lists who holds what, and says how to free a slot.
      expect(message).toContain('0-5')
      expect(message).toContain('env_f')
      expect(message).toContain('env_e')
      expect(message).toContain('env:destroy')
    }
  })

  it('still resolves an already-registered name when every slot is taken', () => {
    const descriptor = resolveEnvironment({
      name: 'env-c',
      worktreePath: '/home/dev/wt/c',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: full
    })

    expect(descriptor.slot).toBe(3)
  })
})

/**
 * The port map's safety properties, checked exhaustively rather than argued
 * for in a comment.
 *
 * These matter across slots, not within one: every allocatable slot may be
 * running at the same moment on one machine, so a port belonging to slot 1
 * colliding with a port belonging to slot 4 is exactly as broken as two
 * services colliding inside one slot. The check is therefore over every
 * (service, slot) pair at once.
 */
describe('portsForSlot: the whole allocatable port map', () => {
  const services = Object.keys(BASE_PORTS) as ServiceName[]

  const everyAllocation = () => {
    const allocations: Array<{
      service: ServiceName
      slot: number
      port: number
    }> = []

    for (let slot = 0; slot <= MAX_SLOT; slot++) {
      const ports = portsForSlot(slot)
      for (const service of services) {
        allocations.push({ service, slot, port: ports[service] })
      }
    }

    return allocations
  }

  it('reproduces every base port exactly at slot 0', () => {
    expect(portsForSlot(0)).toEqual(BASE_PORTS)
  })

  it('never allocates the same port twice, at any pair of slots', () => {
    const seen = new Map<number, string>()
    const collisions: string[] = []

    for (const { service, slot, port } of everyAllocation()) {
      const owner = `${service}@${slot}`
      const previous = seen.get(port)

      if (previous !== undefined) {
        collisions.push(`${port}: ${previous} and ${owner}`)
      } else {
        seen.set(port, owner)
      }
    }

    expect(collisions).toEqual([])
  })

  it('stays inside the 16-bit port range for every allocatable slot', () => {
    const overflowing = everyAllocation()
      .filter(({ port }) => port > 65535)
      .map(({ service, slot, port }) => `${service}@${slot} = ${port}`)

    expect(overflowing).toEqual([])
  })

  it('never lands on a port the shared dependency singleton owns', () => {
    // Postgres, Elasticsearch, Redis, MinIO and its console. Fixed, never
    // slot-shifted, because the dependencies are machine-wide (ADR-0003).
    const dependencyPorts = [5432, 9200, 6379, 3535, 3536]

    const clashes = everyAllocation()
      .filter(({ port }) => dependencyPorts.includes(port))
      .map(({ service, slot, port }) => `${service}@${slot} = ${port}`)

    expect(clashes).toEqual([])
  })

  it('gives every service its own port block, so slots stay independent', () => {
    // Two services sharing a base would collide at every slot at once; the
    // collision check above would catch it, this says why it happened.
    expect(new Set(Object.values(BASE_PORTS)).size).toBe(services.length)
  })
})

describe('the mosip-api SQLite file', () => {
  it('leaves the default environment on the path mosip-api already defaults to', () => {
    const descriptor = resolveEnvironment({
      name: 'opencrvs-core',
      worktreePath: '/home/dev/opencrvs-core',
      isPrimaryWorktree: true,
      isDefaultEnvironment: true,
      registry: {}
    })

    expect(descriptor.mosipDatabaseFile).toBe(LEGACY_MOSIP_DATABASE_FILE)
  })

  it('names the file after the environment, in the one directory dev.sh creates', () => {
    const descriptor = resolveEnvironment({
      name: 'feature-a',
      worktreePath: '/home/dev/wt/feature-a',
      isPrimaryWorktree: false,
      isDefaultEnvironment: false,
      registry: {}
    })

    expect(descriptor.mosipDatabaseFile).toBe(
      'data/sqlite/mosip-api-feature_a.db'
    )
  })
})

describe('sanitizeEnvironmentName', () => {
  it('replaces `-` with `_`', () => {
    expect(sanitizeEnvironmentName('my-feature')).toBe('my_feature')
  })

  it('lowercases and folds any other identifier-hostile character', () => {
    expect(sanitizeEnvironmentName('OCRVS.Feature 12')).toBe('ocrvs_feature_12')
  })

  it('trims leading and trailing separators', () => {
    expect(sanitizeEnvironmentName('--edge--')).toBe('edge')
  })

  it('rejects a name that sanitizes to nothing', () => {
    expect(() => sanitizeEnvironmentName('---')).toThrow(/environment name/i)
  })
})

describe('bucketNameForEnvironment', () => {
  /**
   * S3/MinIO bucket rules exercised here: 3-63 characters, only lowercase
   * letters, digits and hyphens, first and last character alphanumeric.
   * (Adjacent hyphens are legal — only adjacent dots are not — which is what
   * makes the ADR's `--ocrvs` separator safe.)
   */
  const LEGAL_BUCKET = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/

  it('keeps hyphens rather than folding them to underscores', () => {
    expect(bucketNameForEnvironment('feature-a')).toBe('feature-a--ocrvs')
  })

  it('folds an underscore in the directory name to a hyphen', () => {
    expect(bucketNameForEnvironment('my_feature')).toBe('my-feature--ocrvs')
  })

  it('agrees whether it is handed the raw name or the sanitized identifier', () => {
    expect(bucketNameForEnvironment('my-feature')).toBe(
      bucketNameForEnvironment(sanitizeEnvironmentName('my-feature'))
    )
    expect(bucketNameForEnvironment('OCRVS.Feature 12')).toBe(
      bucketNameForEnvironment(sanitizeEnvironmentName('OCRVS.Feature 12'))
    )
  })

  it.each([
    'feature-a',
    'my_feature',
    'OCRVS.Feature 12',
    'Fix--Bug',
    '__leading_and_trailing__',
    'ocrvs-core',
    'a',
    '2024-11-release'
  ])('produces an S3-legal bucket for %j', (raw) => {
    const bucket = bucketNameForEnvironment(raw)

    expect(bucket).toMatch(LEGAL_BUCKET)
    expect(bucket.length).toBeGreaterThanOrEqual(3)
    expect(bucket.length).toBeLessThanOrEqual(63)
    expect(bucket.endsWith('--ocrvs')).toBe(true)
  })

  it('never leaves a separator next to the --ocrvs suffix', () => {
    expect(bucketNameForEnvironment('trailing-')).toBe('trailing--ocrvs')
    expect(bucketNameForEnvironment('trailing_')).toBe('trailing--ocrvs')
  })

  it('rejects a name too long to fit the 63-character bucket limit', () => {
    expect(() => bucketNameForEnvironment('a'.repeat(57))).toThrow(/--env/)
    expect(bucketNameForEnvironment('a'.repeat(56))).toHaveLength(63)
  })

  it('rejects a name with nothing usable in it', () => {
    expect(() => bucketNameForEnvironment('---')).toThrow(/bucket name/i)
  })
})

describe('hasExplicitName', () => {
  it('is true only for a non-blank --env value', () => {
    expect(hasExplicitName('feature-a')).toBe(true)
    expect(hasExplicitName(undefined)).toBe(false)
    expect(hasExplicitName('')).toBe(false)
    expect(hasExplicitName('   ')).toBe(false)
  })
})

describe('legacy identifier constants', () => {
  it('match the defaults the services ship today', () => {
    // packages/events: EVENTS_POSTGRES_URL devDefault database, ES_INDEX_PREFIX
    // packages/documents: MINIO_BUCKET
    expect(LEGACY_DB_NAME).toBe('events')
    expect(LEGACY_ES_PREFIX).toBe('events')
    // packages/events: ES_REINDEXING_STATUS_INDEX default
    expect(LEGACY_ES_REINDEXING_STATUS_INDEX).toBe('reindexing_status')
    expect(LEGACY_BUCKET).toBe('ocrvs')
  })
})

describe('deriveEnvironmentName', () => {
  it('uses the worktree directory basename by default', () => {
    expect(
      deriveEnvironmentName({ worktreePath: '/home/dev/wt/feature-a' })
    ).toBe('feature_a')
  })

  it('lets --env take precedence over the directory basename', () => {
    expect(
      deriveEnvironmentName({
        envOverride: 'pinned-name',
        worktreePath: '/home/dev/wt/feature-a'
      })
    ).toBe('pinned_name')
  })

  it('ignores an empty --env value and falls back to the basename', () => {
    expect(
      deriveEnvironmentName({
        envOverride: '',
        worktreePath: '/home/dev/wt/feature-a'
      })
    ).toBe('feature_a')
  })
})
