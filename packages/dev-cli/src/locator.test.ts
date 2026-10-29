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
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createEnvironmentLocator,
  EnvironmentNotRegisteredError
} from './locator'
import { createRegistry, Registry } from './registry'
import { RegistrySnapshot } from './types'
import { inspectWorktree } from './worktree'

const PRIMARY = '/home/dev/opencrvs-core'
const LINKED = '/home/dev/worktrees/feature-a'

function entry(slot: number, worktreePath: string) {
  return { slot, worktreePath, lastUsedAt: '2026-01-01T00:00:00.000Z' }
}

/**
 * A registry that reads a fixed snapshot and fails loudly on any write, so
 * "lookup never creates anything" is asserted rather than assumed.
 * `findStaleNames` is allowed: it only stats the recorded worktree directories.
 */
function readOnlyRegistry(
  snapshot: RegistrySnapshot,
  staleNames: string[] = []
): Registry {
  const forbidden = (operation: string) => (): never => {
    throw new Error(`lookup must not call registry.${operation}`)
  }

  return {
    stateFilePath: '/nowhere/envs.json',
    read: () => snapshot,
    write: forbidden('write'),
    findStaleNames: () => staleNames,
    recordUse: forbidden('recordUse'),
    release: forbidden('release')
  }
}

/**
 * The checkout the command runs in is `cwd`; every other path is primary only
 * when it is listed in `primaryPaths`.
 */
function locatorIn(
  cwd: { path: string; isPrimary: boolean },
  registry: Registry,
  options: { ambient?: NodeJS.ProcessEnv; primaryPaths?: string[] } = {}
) {
  return createEnvironmentLocator({
    registry,
    inspectWorktree: (worktreePath) =>
      worktreePath === undefined
        ? cwd
        : {
            path: worktreePath,
            isPrimary: (options.primaryPaths ?? []).includes(worktreePath)
          },
    ambient: options.ambient
  })
}

describe('resolve', () => {
  let tempDir: string
  let stateFilePath: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocrvs-dev-cli-'))
    stateFilePath = path.join(tempDir, 'state', 'opencrvs', 'envs.json')
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  function worktree(name: string) {
    const dir = path.join(tempDir, 'worktrees', name)
    fs.mkdirSync(dir, { recursive: true })
    return dir
  }

  function readState() {
    return JSON.parse(fs.readFileSync(stateFilePath, 'utf8'))
  }

  function resolveIn(
    worktreePath: string,
    isPrimary: boolean,
    registry: Registry,
    envOverride?: string
  ) {
    return locatorIn({ path: worktreePath, isPrimary }, registry).resolve(
      envOverride
    )
  }

  it('registers the resolved environment in the injected state file', () => {
    const worktreePath = worktree('opencrvs-core')
    const registry = createRegistry({
      stateFilePath,
      now: () => new Date('2026-03-01T09:00:00.000Z')
    })

    const { descriptor, warnings } = resolveIn(worktreePath, true, registry)

    expect(warnings).toEqual([])
    expect(descriptor.slot).toBe(0)
    expect(readState()).toEqual({
      opencrvs_core: {
        slot: 0,
        worktreePath,
        lastUsedAt: '2026-03-01T09:00:00.000Z'
      }
    })
  })

  it('is stable across repeated resolves but touches lastUsedAt each time', () => {
    const worktreePath = worktree('feature-a')
    let clock = new Date('2026-03-01T09:00:00.000Z')
    const registry = createRegistry({ stateFilePath, now: () => clock })

    const first = resolveIn(worktreePath, false, registry)
    clock = new Date('2026-03-05T18:45:00.000Z')
    const second = resolveIn(worktreePath, false, registry)

    expect(second.descriptor).toEqual(first.descriptor)
    expect(readState().feature_a.lastUsedAt).toBe('2026-03-05T18:45:00.000Z')
  })

  it('lets --env override the worktree directory basename', () => {
    const registry = createRegistry({ stateFilePath })

    const { descriptor } = resolveIn(
      worktree('scratch-42'),
      false,
      registry,
      'pinned-env'
    )

    expect(descriptor.name).toBe('pinned_env')
    expect(descriptor.dbName).toBe('events_pinned_env')
    expect(Object.keys(readState())).toEqual(['pinned_env'])
  })

  it('ignores an exported contract: pnpm dev always resolves its own checkout', () => {
    const worktreePath = worktree('feature-a')
    const registry = createRegistry({ stateFilePath })

    const { descriptor } = locatorIn(
      { path: worktreePath, isPrimary: false },
      registry,
      {
        ambient: {
          OPENCRVS_ENV_NAME: 'other',
          OPENCRVS_ENV_SLOT: '1',
          TARGET_DB: 'events_other'
        }
      }
    ).resolve()

    expect(descriptor.name).toBe('feature_a')
  })

  describe('legacy identifiers for the default environment', () => {
    it('gives the primary checkout with no --env exactly today’s database, prefix and bucket', () => {
      const registry = createRegistry({ stateFilePath })

      const { descriptor } = resolveIn(
        worktree('opencrvs-core'),
        true,
        registry
      )

      expect(descriptor).toMatchObject({
        dbName: 'events',
        esPrefix: 'events',
        esReindexingStatusIndex: 'reindexing_status',
        bucket: 'ocrvs'
      })
    })

    it('gives the primary checkout derived identifiers as soon as --env is passed', () => {
      const registry = createRegistry({ stateFilePath })

      const { descriptor } = resolveIn(
        worktree('opencrvs-core'),
        true,
        registry,
        'side-quest'
      )

      expect(descriptor.dbName).toBe('events_side_quest')
      expect(descriptor.esPrefix).toBe('events_side_quest')
      expect(descriptor.bucket).toBe('side-quest--ocrvs')
    })

    it('treats a blank --env as no override at all', () => {
      const registry = createRegistry({ stateFilePath })

      const { descriptor } = resolveIn(
        worktree('opencrvs-core'),
        true,
        registry,
        '   '
      )

      expect(descriptor.name).toBe('opencrvs_core')
      expect(descriptor.dbName).toBe('events')
    })

    it('never gives a linked worktree the legacy identifiers', () => {
      const registry = createRegistry({ stateFilePath })

      const { descriptor } = resolveIn(worktree('feature-a'), false, registry)

      expect(descriptor.dbName).toBe('events_feature_a')
      expect(descriptor.esReindexingStatusIndex).toBe(
        'events_feature_a_reindexing_status'
      )
      expect(descriptor.bucket).toBe('feature-a--ocrvs')
    })
  })

  describe('lazy garbage collection', () => {
    function withStaleEntry() {
      const gonePath = path.join(tempDir, 'worktrees', 'deleted-branch')
      fs.mkdirSync(path.dirname(stateFilePath), { recursive: true })
      fs.writeFileSync(
        stateFilePath,
        JSON.stringify({
          opencrvs_core: entry(0, worktree('opencrvs-core')),
          deleted_branch: {
            slot: 1,
            worktreePath: gonePath,
            lastUsedAt: '2026-01-02T00:00:00.000Z'
          }
        })
      )
      return gonePath
    }

    it('frees the slot of an entry whose worktree is gone', () => {
      withStaleEntry()
      const registry = createRegistry({ stateFilePath })

      const { descriptor } = resolveIn(worktree('feature-new'), false, registry)

      expect(descriptor.slot).toBe(1)
    })

    it('never drops the stale entry — its data stays keyed by name', () => {
      const gonePath = withStaleEntry()
      const registry = createRegistry({ stateFilePath })

      resolveIn(worktree('feature-new'), false, registry)

      expect(readState().deleted_branch).toEqual({
        slot: 1,
        worktreePath: gonePath,
        lastUsedAt: '2026-01-02T00:00:00.000Z'
      })
    })

    it('warns about the stale environment and points at env:destroy', () => {
      withStaleEntry()
      const registry = createRegistry({ stateFilePath })

      const { warnings } = resolveIn(worktree('feature-new'), false, registry)

      expect(warnings).toHaveLength(1)
      expect(warnings[0]).toContain('deleted_branch')
      expect(warnings[0]).toContain('no longer exists')
      expect(warnings[0]).toContain('env:destroy deleted_branch')
    })

    it('does not warn about the environment currently being resolved', () => {
      const worktreePath = worktree('feature-a')
      fs.mkdirSync(path.dirname(stateFilePath), { recursive: true })
      fs.writeFileSync(
        stateFilePath,
        JSON.stringify({
          feature_a: entry(2, path.join(tempDir, 'worktrees', 'old-location'))
        })
      )
      const registry = createRegistry({ stateFilePath })

      const { descriptor, warnings } = resolveIn(worktreePath, false, registry)

      // Re-registering an old name resurfaces its slot (and so its data).
      expect(descriptor.slot).toBe(2)
      expect(warnings).toEqual([])
      expect(readState().feature_a.worktreePath).toBe(worktreePath)
    })
  })
})

describe('lookup', () => {
  const primary = { path: PRIMARY, isPrimary: true }
  const linked = { path: LINKED, isPrimary: false }

  it('gives the primary checkout with no --env exactly the identifiers the repository uses today', () => {
    const descriptor = locatorIn(primary, readOnlyRegistry({})).lookup()

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
    const descriptor = locatorIn(
      linked,
      readOnlyRegistry({
        opencrvs_core: entry(0, PRIMARY),
        feature_a: entry(3, LINKED)
      })
    ).lookup()

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
    const descriptor = locatorIn(
      primary,
      readOnlyRegistry({ feature_a: entry(2, LINKED) })
    ).lookup('feature-a')

    expect(descriptor).toMatchObject({
      name: 'feature_a',
      slot: 2,
      dbName: 'events_feature_a',
      bucket: 'feature-a--ocrvs'
    })
  })

  it('never allocates: an unregistered environment in a linked worktree is an error, not a new slot', () => {
    expect(() =>
      locatorIn(
        linked,
        readOnlyRegistry({ opencrvs_core: entry(0, PRIMARY) })
      ).lookup()
    ).toThrow(EnvironmentNotRegisteredError)
  })

  it('never allocates: an unregistered --env in the primary checkout is an error, not a new slot', () => {
    expect(() =>
      locatorIn(
        primary,
        readOnlyRegistry({ opencrvs_core: entry(0, PRIMARY) })
      ).lookup('typo')
    ).toThrow(EnvironmentNotRegisteredError)
  })

  it('says how to fix an unregistered environment', () => {
    expect(() => locatorIn(linked, readOnlyRegistry({})).lookup()).toThrow(
      /feature_a[\s\S]*pnpm dev[\s\S]*pnpm env:list/
    )
  })

  it('resolves a registered environment even when every slot is taken', () => {
    const registry = readOnlyRegistry({
      opencrvs_core: entry(0, PRIMARY),
      feature_a: entry(1, LINKED),
      b: entry(2, '/b'),
      c: entry(3, '/c'),
      d: entry(4, '/d'),
      e: entry(5, '/e')
    })

    expect(locatorIn(linked, registry).lookup().slot).toBe(1)
  })

  describe('with a contract already exported by an enclosing script', () => {
    const registry = readOnlyRegistry({
      opencrvs_core: entry(0, PRIMARY),
      feature_a: entry(2, LINKED)
    })

    it('acts on the exported environment, not the checkout’s', () => {
      const descriptor = locatorIn(primary, registry, {
        ambient: {
          OPENCRVS_ENV_NAME: 'feature_a',
          OPENCRVS_ENV_SLOT: '1',
          TARGET_DB: 'events_feature_a'
        }
      }).lookup()

      expect(descriptor).toMatchObject({ name: 'feature_a', slot: 2 })
    })

    it('keeps the default environment’s identifiers when that is what was exported', () => {
      const descriptor = locatorIn(linked, registry, {
        ambient: {
          OPENCRVS_ENV_NAME: 'opencrvs_core',
          OPENCRVS_ENV_SLOT: '1',
          TARGET_DB: 'events'
        }
      }).lookup()

      expect(descriptor).toMatchObject({
        name: 'opencrvs_core',
        slot: 0,
        dbName: 'events',
        esPrefix: 'events'
      })
    })

    it('gives a named environment its own data even if its name is the primary checkout’s', () => {
      const descriptor = locatorIn(
        linked,
        readOnlyRegistry({ opencrvs_core: entry(4, PRIMARY) }),
        {
          ambient: {
            OPENCRVS_ENV_NAME: 'opencrvs_core',
            OPENCRVS_ENV_SLOT: '1',
            TARGET_DB: 'events_opencrvs_core'
          }
        }
      ).lookup()

      expect(descriptor.dbName).toBe('events_opencrvs_core')
    })

    it('yields to an explicit --env', () => {
      const descriptor = locatorIn(primary, registry, {
        ambient: {
          OPENCRVS_ENV_NAME: 'feature_a',
          OPENCRVS_ENV_SLOT: '1',
          TARGET_DB: 'events_feature_a'
        }
      }).lookup('opencrvs-core')

      // `--env` names a separate environment even from the primary checkout.
      expect(descriptor.name).toBe('opencrvs_core')
      expect(descriptor.dbName).toBe('events_opencrvs_core')
    })

    it('is ignored unless every variable environment.sh checks is set', () => {
      for (const ambient of [
        { OPENCRVS_ENV_NAME: 'feature_a' },
        { OPENCRVS_ENV_NAME: 'feature_a', TARGET_DB: 'events_feature_a' },
        { OPENCRVS_ENV_NAME: 'feature_a', OPENCRVS_ENV_SLOT: '2' }
      ]) {
        expect(locatorIn(primary, registry, { ambient }).lookup().name).toBe(
          'opencrvs_core'
        )
      }
    })

    it('sanitizes an exported name the way every other spelling is', () => {
      const descriptor = locatorIn(primary, registry, {
        ambient: {
          OPENCRVS_ENV_NAME: 'Feature-A',
          OPENCRVS_ENV_SLOT: '2',
          TARGET_DB: 'events_feature_a'
        }
      }).lookup()

      expect(descriptor.name).toBe('feature_a')
    })
  })

  it('agrees with resolve on the slot when a stale entry sits on the slot the registry recorded', () => {
    const snapshot: RegistrySnapshot = {
      feature_a: entry(2, LINKED),
      deleted: entry(2, '/home/dev/worktrees/deleted')
    }
    // Writable, because resolve legitimately records the use; writes dropped.
    const recording: Registry = {
      ...readOnlyRegistry(snapshot, ['deleted']),
      write: () => undefined,
      recordUse: () => snapshot,
      release: () => snapshot
    }

    const resolved = locatorIn(linked, recording).resolve().descriptor
    const lookedUp = locatorIn(
      linked,
      readOnlyRegistry(snapshot, ['deleted'])
    ).lookup()

    // The recorded slot: the only other claim on it lapsed with its worktree.
    expect(resolved.slot).toBe(2)
    expect(lookedUp).toEqual(resolved)
  })
})

describe('locate', () => {
  const snapshot: RegistrySnapshot = {
    opencrvs_core: entry(0, PRIMARY),
    feature_a: entry(1, LINKED)
  }
  const elsewhere = { path: LINKED, isPrimary: false }

  function locate(
    name: string,
    registry: RegistrySnapshot = snapshot,
    primaryPaths: string[] = [PRIMARY]
  ) {
    return locatorIn(elsewhere, readOnlyRegistry(registry), {
      primaryPaths
    }).locate(name)
  }

  it('finds a registered environment by any spelling of its name', () => {
    for (const spelling of ['feature-a', 'feature_a', 'Feature-A']) {
      expect(locate(spelling)).toEqual({
        name: 'feature_a',
        entry: snapshot.feature_a,
        isDefaultEnvironment: false
      })
    }
  })

  it('recognises the default environment from any checkout, however it is spelled', () => {
    for (const spelling of ['opencrvs-core', 'OpenCRVS-Core']) {
      expect(locate(spelling).isDefaultEnvironment).toBe(true)
    }
  })

  it('locates an unregistered name without throwing', () => {
    expect(locate('never-seen')).toEqual({
      name: 'never_seen',
      entry: undefined,
      isDefaultEnvironment: false
    })
  })

  it('does not treat slot 0 alone as default: a --env environment in the primary checkout is ordinary', () => {
    expect(
      locate('side-quest', { side_quest: entry(0, PRIMARY) })
        .isDefaultEnvironment
    ).toBe(false)
  })

  it('does not treat a linked worktree that shares the primary’s basename as default', () => {
    expect(
      locate(
        'opencrvs-core',
        { opencrvs_core: entry(3, '/home/dev/wt/opencrvs-core') },
        [PRIMARY]
      ).isDefaultEnvironment
    ).toBe(false)
  })

  it('does not treat an entry whose worktree has been deleted as default', () => {
    const orphanPath = '/home/dev/wt/deleted-a'
    expect(fs.existsSync(orphanPath)).toBe(false)

    const located = createEnvironmentLocator({
      registry: readOnlyRegistry({ deleted_a: entry(2, orphanPath) }),
      inspectWorktree: (worktreePath) => inspectWorktree(worktreePath)
    }).locate('deleted-a')

    expect(located.isDefaultEnvironment).toBe(false)
  })
})
