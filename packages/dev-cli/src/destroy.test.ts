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
  DestroyPlan,
  EnvironmentDiscovery,
  environmentNamesFromDatabases,
  planDestroy,
  PlanDestroyInput,
  selectIndicesToDelete
} from './destroy'
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
 * Every case below plans with discovery that ran and found nothing beyond the
 * registry. Discovery is a required input precisely so that no call site can
 * quietly assume the registry is a complete list of what exists — the cases
 * that exercise that assumption call `planDestroy` directly.
 */
function planFor(input: Omit<PlanDestroyInput, 'discovery'>): DestroyPlan {
  return planDestroy({ ...input, discovery: { names: [] } })
}

describe('planDestroy', () => {
  it('derives every identifier of a registered environment from its name', () => {
    const plan = planFor({ name: 'feature-a', snapshot: registry })

    expect(plan.refusal).toBe(undefined)
    expect(plan.name).toBe('feature_a')
    expect(plan.registered).toBe(true)
    expect(plan.slot).toBe(1)
    expect(plan.identifiers).toEqual({
      dbName: 'events_feature_a',
      esPrefix: 'events_feature_a',
      esReindexingStatusIndex: 'events_feature_a_reindexing_status',
      bucket: 'feature-a--ocrvs'
    })
    expect(plan.redisDb).toBe(1)
    expect(plan.releaseRegistryEntry).toBe(true)
  })

  it('plans identically whether the name is spelled with a hyphen or an underscore', () => {
    expect(planFor({ name: 'feature_a', snapshot: registry })).toEqual(
      planFor({ name: 'feature-a', snapshot: registry })
    )
  })

  it('keys the plan on the name, never on the slot', () => {
    // `feature_a` freed slot 1 and `later` picked it up. Destroying `feature_a`
    // must still describe `feature_a`'s own data, not slot 1's occupant.
    const reused = snapshot({
      feature_a: { slot: 1, worktreePath: '/home/dev/wt/feature-a' },
      later: { slot: 1, worktreePath: '/home/dev/wt/later' }
    })

    const plan = planFor({ name: 'feature-a', snapshot: reused })

    expect(plan.identifiers.dbName).toBe('events_feature_a')
    expect(plan.identifiers.bucket).toBe('feature-a--ocrvs')
  })

  it('lists the other registered environments’ index prefixes as off limits', () => {
    const plan = planFor({ name: 'feature-a', snapshot: registry })

    expect(plan.otherEsPrefixes.sort()).toEqual([
      'events_feature_b',
      'events_opencrvs_core'
    ])
  })

  describe('an environment that is not in the registry', () => {
    const plan = planFor({ name: 'gone', snapshot: registry })

    it('still cleans up the data its name derives', () => {
      expect(plan.refusal).toBe(undefined)
      expect(plan.registered).toBe(false)
      expect(plan.identifiers.dbName).toBe('events_gone')
      expect(plan.identifiers.bucket).toBe('gone--ocrvs')
    })

    it('cannot flush Redis, because the slot is only known from the registry', () => {
      expect(plan.slot).toBe(undefined)
      expect(plan.redisDb).toBe(undefined)
      expect(plan.redisSkipReason).toMatch(/registry/)
    })

    it('has no registry entry to release, and says so', () => {
      expect(plan.releaseRegistryEntry).toBe(false)
      expect(plan.notes.join('\n')).toMatch(/not in the registry/)
    })
  })

  describe('the default environment', () => {
    const defaultEnvironment = {
      name: 'opencrvs-core',
      snapshot: registry,
      registeredWorktreeIsPrimary: true
    }

    it('is refused without --force, naming the data at stake', () => {
      const plan = planFor(defaultEnvironment)

      expect(plan.isDefaultEnvironment).toBe(true)
      expect(plan.refusal).toMatch(/events/)
      expect(plan.refusal).toMatch(/ocrvs/)
      expect(plan.refusal).toMatch(/--force/)
    })

    it('destroys today’s legacy identifiers — not events_<name> — when forced', () => {
      const plan = planFor({ ...defaultEnvironment, force: true })

      expect(plan.refusal).toBe(undefined)
      expect(plan.identifiers).toEqual({
        dbName: 'events',
        esPrefix: 'events',
        esReindexingStatusIndex: 'reindexing_status',
        bucket: 'ocrvs'
      })
      expect(plan.redisDb).toBe(0)
    })

    it('is not triggered by slot 0 alone: a --env environment in the primary checkout is ordinary', () => {
      const withNamedPrimary = snapshot({
        side_quest: { slot: 0, worktreePath: '/home/dev/opencrvs-core' }
      })

      const plan = planFor({
        name: 'side-quest',
        snapshot: withNamedPrimary,
        registeredWorktreeIsPrimary: true
      })

      expect(plan.isDefaultEnvironment).toBe(false)
      expect(plan.refusal).toBe(undefined)
      expect(plan.identifiers.dbName).toBe('events_side_quest')
    })

    it('is not triggered by a linked worktree that happens to share its basename', () => {
      const linked = snapshot({
        opencrvs_core: { slot: 3, worktreePath: '/home/dev/wt/opencrvs-core' }
      })

      const plan = planFor({
        name: 'opencrvs-core',
        snapshot: linked,
        registeredWorktreeIsPrimary: false
      })

      expect(plan.isDefaultEnvironment).toBe(false)
      expect(plan.identifiers.dbName).toBe('events_opencrvs_core')
    })
  })

  describe('Redis', () => {
    it('flushes the environment’s own logical DB', () => {
      expect(planFor({ name: 'feature-b', snapshot: registry }).redisDb).toBe(2)
    })

    it('never flushes DB 0 for a named environment sitting at slot 0', () => {
      const withNamedPrimary = snapshot({
        side_quest: { slot: 0, worktreePath: '/home/dev/opencrvs-core' }
      })

      const plan = planFor({
        name: 'side-quest',
        snapshot: withNamedPrimary,
        registeredWorktreeIsPrimary: true
      })

      expect(plan.redisDb).toBe(undefined)
      expect(plan.redisSkipReason).toMatch(/default environment/)
    })
  })
})

describe('selectIndicesToDelete', () => {
  const plan = planFor({ name: 'feature-a', snapshot: registry })

  it('takes the environment’s own indices', () => {
    expect(
      selectIndicesToDelete(
        [
          'events_feature_a_v2_birth',
          'events_feature_a_v2_death',
          'events_feature_a_reindexing_status'
        ],
        plan
      )
    ).toEqual([
      'events_feature_a_v2_birth',
      'events_feature_a_v2_death',
      'events_feature_a_reindexing_status'
    ])
  })

  it('leaves the default environment’s indices alone', () => {
    expect(
      selectIndicesToDelete(['events_v2_birth', 'reindexing_status'], plan)
    ).toEqual([])
  })

  it('leaves another environment’s indices alone even when its name extends this one', () => {
    const extended = snapshot({
      feature_a: { slot: 1, worktreePath: '/home/dev/wt/feature-a' },
      feature_a_2: { slot: 2, worktreePath: '/home/dev/wt/feature-a-2' }
    })

    expect(
      selectIndicesToDelete(
        ['events_feature_a_v2_birth', 'events_feature_a_2_v2_birth'],
        planFor({ name: 'feature-a', snapshot: extended })
      )
    ).toEqual(['events_feature_a_v2_birth'])
  })

  it('leaves unrelated indices alone', () => {
    expect(
      selectIndicesToDelete(['other', 'events_feature_b_v2_birth'], plan)
    ).toEqual([])
  })

  it('sweeps the default environment’s own indices when it is forcibly destroyed, and only those', () => {
    const forced = planFor({
      name: 'opencrvs-core',
      snapshot: registry,
      registeredWorktreeIsPrimary: true,
      force: true
    })

    expect(
      selectIndicesToDelete(
        [
          'events_v2_birth',
          'reindexing_status',
          'events_feature_a_v2_birth',
          'events_feature_a_reindexing_status'
        ],
        forced
      )
    ).toEqual(['events_v2_birth', 'reindexing_status'])
  })
})

describe('environmentNamesFromDatabases', () => {
  it('reads an environment name out of every events_<name> database', () => {
    expect(
      environmentNamesFromDatabases([
        'events',
        'events_feature_a',
        'events_feature_a_2',
        'postgres',
        'template0',
        'template1'
      ])
    ).toEqual(['feature_a', 'feature_a_2'])
  })

  it('ignores blank lines, whitespace and databases that are not environments', () => {
    expect(
      environmentNamesFromDatabases([
        '  events_feature_a  ',
        '',
        'events',
        'events_',
        'metabase'
      ])
    ).toEqual(['feature_a'])
  })

  it('deduplicates names that sanitize to the same identifier', () => {
    expect(
      environmentNamesFromDatabases(['events_feature_a', 'events_feature_a'])
    ).toEqual(['feature_a'])
  })
})

describe('environments that exist but are not in the registry', () => {
  const registryWithoutFeatureA = snapshot({
    opencrvs_core: { slot: 0, worktreePath: '/home/dev/opencrvs-core' }
  })

  const liveIndices = [
    'events_v2_birth',
    'reindexing_status',
    'events_feature_a_v2_birth',
    'events_feature_a_reindexing_status'
  ]

  /*
   * The registry records slots; it is not a record of what exists. An entry
   * disappears whenever `env:destroy` releases it, the state file is lost, or
   * the database was created by another user or restored from a colleague's
   * dump — while the data itself lives on in the docker volumes.
   */
  it('protects a discovered environment the registry has never heard of', () => {
    const forced = planDestroy({
      name: 'opencrvs-core',
      snapshot: registryWithoutFeatureA,
      registeredWorktreeIsPrimary: true,
      force: true,
      discovery: { names: environmentNamesFromDatabases(['events_feature_a']) }
    })

    expect(forced.otherEsPrefixes).toContain('events_feature_a')
    expect(selectIndicesToDelete(liveIndices, forced)).toEqual([
      'events_v2_birth',
      'reindexing_status'
    ])
  })

  it('would sweep it up on the registry alone — which is why discovery is not optional', () => {
    const registryOnly = planDestroy({
      name: 'opencrvs-core',
      snapshot: registryWithoutFeatureA,
      registeredWorktreeIsPrimary: true,
      force: true,
      discovery: { names: [] }
    })

    expect(selectIndicesToDelete(liveIndices, registryOnly)).toEqual(
      liveIndices
    )
  })

  it('unions the two sources without duplicating a name both know', () => {
    const plan = planDestroy({
      name: 'opencrvs-core',
      snapshot: registry,
      registeredWorktreeIsPrimary: true,
      force: true,
      discovery: { names: ['feature_a', 'feature_c'] }
    })

    expect(plan.otherEsPrefixes.sort()).toEqual([
      'events_feature_a',
      'events_feature_b',
      'events_feature_c'
    ])
  })

  it('still applies longest-prefix-wins to a discovered environment', () => {
    const plan = planDestroy({
      name: 'feature-a',
      snapshot: snapshot({
        feature_a: { slot: 1, worktreePath: '/home/dev/wt/feature-a' }
      }),
      discovery: { names: ['feature_a_2'] }
    })

    expect(
      selectIndicesToDelete(
        ['events_feature_a_v2_birth', 'events_feature_a_2_v2_birth'],
        plan
      )
    ).toEqual(['events_feature_a_v2_birth'])
  })
})

describe('when discovery fails', () => {
  const failed: EnvironmentDiscovery = {
    names: [],
    failure: 'Postgres is not reachable'
  }

  it('deletes no index at all, rather than deleting under an incomplete picture', () => {
    const plan = planDestroy({
      name: 'opencrvs-core',
      snapshot: registry,
      registeredWorktreeIsPrimary: true,
      force: true,
      discovery: failed
    })

    expect(
      selectIndicesToDelete(['events_v2_birth', 'reindexing_status'], plan)
    ).toEqual([])
  })

  it('says why, naming the underlying failure', () => {
    const plan = planDestroy({
      name: 'feature-a',
      snapshot: registry,
      discovery: failed
    })

    expect(plan.indexSelectionSkipReason).toMatch(/Postgres is not reachable/)
    expect(plan.indexSelectionSkipReason).toMatch(/no index was deleted/i)
  })

  it('still plans the unambiguous work: the database, the bucket and the slot', () => {
    const plan = planDestroy({
      name: 'feature-a',
      snapshot: registry,
      discovery: failed
    })

    expect(plan.identifiers.dbName).toBe('events_feature_a')
    expect(plan.identifiers.bucket).toBe('feature-a--ocrvs')
    expect(plan.redisDb).toBe(1)
    expect(plan.releaseRegistryEntry).toBe(true)
  })
})
