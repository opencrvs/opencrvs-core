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
import { createRegistry } from './registry'
import { runResolve } from './resolve-command'

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

describe('runResolve', () => {
  it('registers the resolved environment in the injected state file', () => {
    const worktreePath = worktree('opencrvs-core')
    const registry = createRegistry({
      stateFilePath,
      now: () => new Date('2026-03-01T09:00:00.000Z')
    })

    const { descriptor, warnings } = runResolve({
      worktreePath,
      isPrimaryWorktree: true,
      registry
    })

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

    const first = runResolve({
      worktreePath,
      isPrimaryWorktree: false,
      registry
    })
    clock = new Date('2026-03-05T18:45:00.000Z')
    const second = runResolve({
      worktreePath,
      isPrimaryWorktree: false,
      registry
    })

    expect(second.descriptor).toEqual(first.descriptor)
    expect(readState().feature_a.lastUsedAt).toBe('2026-03-05T18:45:00.000Z')
  })

  it('lets --env override the worktree directory basename', () => {
    const worktreePath = worktree('scratch-42')
    const registry = createRegistry({ stateFilePath })

    const { descriptor } = runResolve({
      envOverride: 'pinned-env',
      worktreePath,
      isPrimaryWorktree: false,
      registry
    })

    expect(descriptor.name).toBe('pinned_env')
    expect(descriptor.dbName).toBe('events_pinned_env')
    expect(Object.keys(readState())).toEqual(['pinned_env'])
  })

  describe('legacy identifiers for the default environment', () => {
    it('gives the primary checkout with no --env exactly today’s database, prefix and bucket', () => {
      const registry = createRegistry({ stateFilePath })

      const { descriptor, env } = runResolve({
        worktreePath: worktree('opencrvs-core'),
        isPrimaryWorktree: true,
        registry
      })

      expect(descriptor.dbName).toBe('events')
      expect(descriptor.esPrefix).toBe('events')
      expect(descriptor.bucket).toBe('ocrvs')
      expect(env.TARGET_DB).toBe('events')
      expect(env.ES_INDEX_PREFIX).toBe('events')
      expect(env.ES_REINDEXING_STATUS_INDEX).toBe('reindexing_status')
      expect(env.MINIO_BUCKET).toBe('ocrvs')
      expect(env.EVENTS_POSTGRES_URL).toBe(
        'postgres://events_app:app_password@localhost:5432/events'
      )
    })

    it('gives the primary checkout derived identifiers as soon as --env is passed', () => {
      const registry = createRegistry({ stateFilePath })

      const { descriptor } = runResolve({
        envOverride: 'side-quest',
        worktreePath: worktree('opencrvs-core'),
        isPrimaryWorktree: true,
        registry
      })

      expect(descriptor.slot).toBe(0)
      expect(descriptor.dbName).toBe('events_side_quest')
      expect(descriptor.esPrefix).toBe('events_side_quest')
      expect(descriptor.bucket).toBe('side-quest--ocrvs')
    })

    it('treats a blank --env as no override at all', () => {
      const registry = createRegistry({ stateFilePath })

      const { descriptor } = runResolve({
        envOverride: '   ',
        worktreePath: worktree('opencrvs-core'),
        isPrimaryWorktree: true,
        registry
      })

      expect(descriptor.name).toBe('opencrvs_core')
      expect(descriptor.dbName).toBe('events')
    })

    it('never gives a linked worktree the legacy identifiers', () => {
      const registry = createRegistry({ stateFilePath })

      const { descriptor } = runResolve({
        worktreePath: worktree('feature-a'),
        isPrimaryWorktree: false,
        registry
      })

      expect(descriptor.dbName).toBe('events_feature_a')
      expect(descriptor.esReindexingStatusIndex).toBe(
        'events_feature_a_reindexing_status'
      )
      expect(descriptor.bucket).toBe('feature-a--ocrvs')
    })
  })

  it('emits the environment contract as sourceable export lines', () => {
    const worktreePath = worktree('opencrvs-core')
    const registry = createRegistry({ stateFilePath })

    const { exports } = runResolve({
      worktreePath,
      isPrimaryWorktree: true,
      registry
    })

    expect(exports).toContain("export OPENCRVS_ENV_SLOT='0'")
    expect(exports).toContain("export EVENTS_PORT='5555'")
    expect(exports).toContain("export MINIO_BUCKET='ocrvs'")
  })

  describe('lazy garbage collection', () => {
    function withStaleEntry() {
      const gonePath = path.join(tempDir, 'worktrees', 'deleted-branch')
      fs.mkdirSync(path.dirname(stateFilePath), { recursive: true })
      fs.writeFileSync(
        stateFilePath,
        JSON.stringify({
          opencrvs_core: {
            slot: 0,
            worktreePath: worktree('opencrvs-core'),
            lastUsedAt: '2026-01-01T00:00:00.000Z'
          },
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

      const { descriptor } = runResolve({
        worktreePath: worktree('feature-new'),
        isPrimaryWorktree: false,
        registry
      })

      expect(descriptor.slot).toBe(1)
    })

    it('never drops the stale entry — its data stays keyed by name', () => {
      const gonePath = withStaleEntry()
      const registry = createRegistry({ stateFilePath })

      runResolve({
        worktreePath: worktree('feature-new'),
        isPrimaryWorktree: false,
        registry
      })

      expect(readState().deleted_branch).toEqual({
        slot: 1,
        worktreePath: gonePath,
        lastUsedAt: '2026-01-02T00:00:00.000Z'
      })
    })

    it('warns about the stale environment and points at env:destroy', () => {
      withStaleEntry()
      const registry = createRegistry({ stateFilePath })

      const { warnings } = runResolve({
        worktreePath: worktree('feature-new'),
        isPrimaryWorktree: false,
        registry
      })

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
          feature_a: {
            slot: 2,
            worktreePath: path.join(tempDir, 'worktrees', 'old-location'),
            lastUsedAt: '2026-01-02T00:00:00.000Z'
          }
        })
      )
      const registry = createRegistry({ stateFilePath })

      const { descriptor, warnings } = runResolve({
        worktreePath,
        isPrimaryWorktree: false,
        registry
      })

      // Re-registering an old name resurfaces its slot (and so its data).
      expect(descriptor.slot).toBe(2)
      expect(warnings).toEqual([])
      expect(readState().feature_a.worktreePath).toBe(worktreePath)
    })
  })
})
