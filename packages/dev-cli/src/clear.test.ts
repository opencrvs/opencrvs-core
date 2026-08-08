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
import { indexIdentityFromEnvironment, selectEnvironmentIndices } from './clear'
import { RegistrySnapshot } from './types'

const REGISTRY: RegistrySnapshot = {
  opencrvs_core: {
    slot: 0,
    worktreePath: '/home/dev/opencrvs-core',
    lastUsedAt: 'x'
  },
  feature_a: {
    slot: 1,
    worktreePath: '/home/dev/wt/feature-a',
    lastUsedAt: 'x'
  },
  feature_a_2: {
    slot: 2,
    worktreePath: '/home/dev/wt/feature-a-2',
    lastUsedAt: 'x'
  }
}

/** What Elasticsearch reports on a machine running all three environments. */
const LIVE_INDICES = [
  'events',
  'events_v2_birth',
  'reindexing_status',
  'events_feature_a',
  'events_feature_a_v2_birth',
  'events_feature_a_reindexing_status',
  'events_feature_a_2',
  'events_feature_a_2_v2_birth',
  'events_feature_a_2_reindexing_status',
  '.kibana',
  'unrelated'
]

describe('selectEnvironmentIndices', () => {
  it('clears the default environment without touching any named environment', () => {
    expect(
      selectEnvironmentIndices(
        LIVE_INDICES,
        {
          name: 'opencrvs_core',
          esPrefix: 'events',
          esReindexingStatusIndex: 'reindexing_status'
        },
        REGISTRY,
        { names: [] }
      )
    ).toEqual(['events', 'events_v2_birth', 'reindexing_status'])
  })

  it('clears a named environment without touching the one whose prefix extends it', () => {
    expect(
      selectEnvironmentIndices(
        LIVE_INDICES,
        {
          name: 'feature_a',
          esPrefix: 'events_feature_a',
          esReindexingStatusIndex: 'events_feature_a_reindexing_status'
        },
        REGISTRY,
        { names: [] }
      )
    ).toEqual([
      'events_feature_a',
      'events_feature_a_v2_birth',
      'events_feature_a_reindexing_status'
    ])
  })

  it('clears the longer-named environment without touching its shorter neighbour', () => {
    expect(
      selectEnvironmentIndices(
        LIVE_INDICES,
        {
          name: 'feature_a_2',
          esPrefix: 'events_feature_a_2',
          esReindexingStatusIndex: 'events_feature_a_2_reindexing_status'
        },
        REGISTRY,
        { names: [] }
      )
    ).toEqual([
      'events_feature_a_2',
      'events_feature_a_2_v2_birth',
      'events_feature_a_2_reindexing_status'
    ])
  })

  it('leaves indices no environment claims alone', () => {
    const selected = selectEnvironmentIndices(
      LIVE_INDICES,
      {
        name: 'opencrvs_core',
        esPrefix: 'events',
        esReindexingStatusIndex: 'reindexing_status'
      },
      REGISTRY,
      { names: [] }
    )

    expect(selected).not.toContain('.kibana')
    expect(selected).not.toContain('unrelated')
  })

  it('selects nothing when the environment has no indices yet', () => {
    expect(
      selectEnvironmentIndices(
        ['events', 'reindexing_status'],
        {
          name: 'feature_a',
          esPrefix: 'events_feature_a',
          esReindexingStatusIndex: 'events_feature_a_reindexing_status'
        },
        REGISTRY,
        { names: [] }
      )
    ).toEqual([])
  })
})

describe('indexIdentityFromEnvironment', () => {
  it('reads an already-loaded contract out of the environment', () => {
    expect(
      indexIdentityFromEnvironment({
        OPENCRVS_ENV_NAME: 'feature_a',
        ES_INDEX_PREFIX: 'events_feature_a',
        ES_REINDEXING_STATUS_INDEX: 'events_feature_a_reindexing_status'
      })
    ).toEqual({
      name: 'feature_a',
      esPrefix: 'events_feature_a',
      esReindexingStatusIndex: 'events_feature_a_reindexing_status'
    })
  })

  it('reports no contract when any part of it is missing, so nothing is guessed', () => {
    expect(
      indexIdentityFromEnvironment({
        OPENCRVS_ENV_NAME: 'feature_a',
        ES_INDEX_PREFIX: 'events_feature_a'
      })
    ).toBeUndefined()
    expect(indexIdentityFromEnvironment({})).toBeUndefined()
    expect(
      indexIdentityFromEnvironment({
        OPENCRVS_ENV_NAME: '',
        ES_INDEX_PREFIX: 'events',
        ES_REINDEXING_STATUS_INDEX: 'reindexing_status'
      })
    ).toBeUndefined()
  })
})

describe('selectEnvironmentIndices with environments outside the registry', () => {
  /** Only the default environment is registered; `feature_a` is not. */
  const REGISTRY_WITHOUT_FEATURE_A: RegistrySnapshot = {
    opencrvs_core: {
      slot: 0,
      worktreePath: '/home/dev/opencrvs-core',
      lastUsedAt: 'x'
    }
  }

  const DEFAULT_IDENTITY = {
    name: 'opencrvs_core',
    esPrefix: 'events',
    esReindexingStatusIndex: 'reindexing_status'
  }

  it('protects an environment discovered in Postgres but missing from the registry', () => {
    expect(
      selectEnvironmentIndices(
        LIVE_INDICES,
        DEFAULT_IDENTITY,
        REGISTRY_WITHOUT_FEATURE_A,
        { names: ['feature_a', 'feature_a_2'] }
      )
    ).toEqual(['events', 'events_v2_birth', 'reindexing_status'])
  })

  it('deletes nothing when the set of other environments could not be established', () => {
    expect(
      selectEnvironmentIndices(
        LIVE_INDICES,
        DEFAULT_IDENTITY,
        REGISTRY_WITHOUT_FEATURE_A,
        { names: [], failure: 'Postgres is not reachable' }
      )
    ).toEqual([])
  })

  it('unions registry and discovery, and keeps longest-prefix-wins', () => {
    expect(
      selectEnvironmentIndices(
        LIVE_INDICES,
        {
          name: 'feature_a',
          esPrefix: 'events_feature_a',
          esReindexingStatusIndex: 'events_feature_a_reindexing_status'
        },
        REGISTRY_WITHOUT_FEATURE_A,
        { names: ['feature_a', 'feature_a_2'] }
      )
    ).toEqual([
      'events_feature_a',
      'events_feature_a_v2_birth',
      'events_feature_a_reindexing_status'
    ])
  })
})
