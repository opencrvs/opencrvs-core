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
import {
  EnvironmentNotRegisteredError,
  lookupEnvironment,
  runLookup
} from './lookup'
import { Registry } from './registry'
import { RegistrySnapshot } from './types'

const PRIMARY = '/home/dev/opencrvs-core'
const LINKED = '/home/dev/worktrees/feature-a'

function entry(slot: number, worktreePath: string) {
  return { slot, worktreePath, lastUsedAt: '2026-01-01T00:00:00.000Z' }
}

/**
 * A registry that reads a fixed snapshot and fails loudly on any write. Every
 * script that looks an environment up (clearing it, seeding it, reindexing it)
 * must be safe to run without creating anything, so "never writes" is asserted
 * rather than assumed.
 */
function readOnlyRegistry(snapshot: RegistrySnapshot): Registry {
  const forbidden = (operation: string) => (): never => {
    throw new Error(`lookup must not call registry.${operation}`)
  }

  return {
    stateFilePath: '/nowhere/envs.json',
    read: () => snapshot,
    write: forbidden('write'),
    findStaleNames: forbidden('findStaleNames'),
    recordUse: forbidden('recordUse'),
    release: forbidden('release')
  }
}

describe('lookupEnvironment', () => {
  it('gives the primary checkout with no --env exactly the identifiers the repository uses today', () => {
    const descriptor = lookupEnvironment({
      worktreePath: PRIMARY,
      isPrimaryWorktree: true,
      registry: {}
    })

    expect(descriptor).toMatchObject({
      name: 'opencrvs_core',
      slot: 0,
      dbName: 'events',
      esPrefix: 'events',
      esReindexingStatusIndex: 'reindexing_status',
      bucket: 'ocrvs',
      redisDb: 0
    })
  })

  it('resolves a registered environment to its recorded slot, database, prefix and bucket', () => {
    const descriptor = lookupEnvironment({
      worktreePath: LINKED,
      isPrimaryWorktree: false,
      registry: {
        opencrvs_core: entry(0, PRIMARY),
        feature_a: entry(3, LINKED)
      }
    })

    expect(descriptor).toMatchObject({
      name: 'feature_a',
      slot: 3,
      dbName: 'events_feature_a',
      esPrefix: 'events_feature_a',
      esReindexingStatusIndex: 'events_feature_a_reindexing_status',
      bucket: 'feature-a--ocrvs',
      redisDb: 3
    })
    expect(descriptor.ports.events).toBe(5555 + 3 * 10000)
  })

  it('honours --env <name> over the worktree directory', () => {
    const descriptor = lookupEnvironment({
      envOverride: 'feature-a',
      worktreePath: PRIMARY,
      isPrimaryWorktree: true,
      registry: { feature_a: entry(2, LINKED) }
    })

    expect(descriptor).toMatchObject({
      name: 'feature_a',
      slot: 2,
      dbName: 'events_feature_a',
      esPrefix: 'events_feature_a',
      bucket: 'feature-a--ocrvs'
    })
  })

  it('never allocates: an unregistered environment in a linked worktree is an error, not a new slot', () => {
    expect(() =>
      lookupEnvironment({
        worktreePath: LINKED,
        isPrimaryWorktree: false,
        registry: { opencrvs_core: entry(0, PRIMARY) }
      })
    ).toThrow(EnvironmentNotRegisteredError)
  })

  it('says how to fix an unregistered environment', () => {
    expect(() =>
      lookupEnvironment({
        worktreePath: LINKED,
        isPrimaryWorktree: false,
        registry: {}
      })
    ).toThrow(/feature_a[\s\S]*pnpm dev[\s\S]*pnpm env:list/)
  })

  it('resolves a registered environment even when every slot is taken', () => {
    const registry: RegistrySnapshot = {
      opencrvs_core: entry(0, PRIMARY),
      feature_a: entry(1, LINKED),
      b: entry(2, '/b'),
      c: entry(3, '/c'),
      d: entry(4, '/d'),
      e: entry(5, '/e')
    }

    expect(
      lookupEnvironment({
        worktreePath: LINKED,
        isPrimaryWorktree: false,
        registry
      }).slot
    ).toBe(1)
  })
})

describe('runLookup', () => {
  it('reads the registry and writes nothing at all', () => {
    const result = runLookup({
      worktreePath: PRIMARY,
      isPrimaryWorktree: true,
      registry: readOnlyRegistry({ opencrvs_core: entry(0, PRIMARY) })
    })

    expect(result.env.TARGET_DB).toBe('events')
    expect(result.exports).toContain("export TARGET_DB='events'")
    expect(result.exports).toContain("export MINIO_BUCKET='ocrvs'")
  })

  it('emits the named environment’s contract as sourceable export lines', () => {
    const result = runLookup({
      envOverride: 'feature-a',
      worktreePath: PRIMARY,
      isPrimaryWorktree: true,
      registry: readOnlyRegistry({ feature_a: entry(1, LINKED) })
    })

    expect(result.exports).toContain("export TARGET_DB='events_feature_a'")
    expect(result.exports).toContain(
      "export ES_INDEX_PREFIX='events_feature_a'"
    )
    expect(result.exports).toContain("export MINIO_BUCKET='feature-a--ocrvs'")
    expect(result.exports).toContain(
      "export GATEWAY_URL='http://localhost:17070'"
    )
  })
})
