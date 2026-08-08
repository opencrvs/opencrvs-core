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
import { createRegistry, defaultStateFilePath } from './registry'

let tempDir: string

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocrvs-dev-cli-'))
})

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true })
})

function stateFile() {
  // Deliberately nested: the adapter must create missing parent directories.
  return path.join(tempDir, 'state', 'opencrvs', 'envs.json')
}

function readFile(file: string) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

describe('defaultStateFilePath', () => {
  it('defaults to ~/.local/state/opencrvs/envs.json', () => {
    expect(defaultStateFilePath({}, '/home/dev')).toBe(
      '/home/dev/.local/state/opencrvs/envs.json'
    )
  })

  it('honours XDG_STATE_HOME', () => {
    expect(
      defaultStateFilePath({ XDG_STATE_HOME: '/var/state' }, '/home/dev')
    ).toBe('/var/state/opencrvs/envs.json')
  })
})

describe('registry adapter', () => {
  it('reads an empty snapshot when the state file does not exist yet', () => {
    const registry = createRegistry({ stateFilePath: stateFile() })

    expect(registry.read()).toEqual({})
    expect(fs.existsSync(stateFile())).toBe(false)
  })

  it('persists { slot, worktreePath, lastUsedAt } per name', () => {
    const file = stateFile()
    const registry = createRegistry({
      stateFilePath: file,
      now: () => new Date('2026-02-01T10:00:00.000Z')
    })

    registry.recordUse('feature_a', {
      slot: 1,
      worktreePath: '/home/dev/wt/feature-a'
    })

    expect(readFile(file)).toEqual({
      feature_a: {
        slot: 1,
        worktreePath: '/home/dev/wt/feature-a',
        lastUsedAt: '2026-02-01T10:00:00.000Z'
      }
    })
  })

  it('touches lastUsedAt on every use without disturbing the slot', () => {
    const file = stateFile()
    let clock = new Date('2026-02-01T10:00:00.000Z')

    const registry = createRegistry({ stateFilePath: file, now: () => clock })

    registry.recordUse('feature_a', {
      slot: 1,
      worktreePath: '/home/dev/wt/feature-a'
    })
    clock = new Date('2026-02-02T11:30:00.000Z')
    registry.recordUse('feature_a', {
      slot: 1,
      worktreePath: '/home/dev/wt/feature-a'
    })

    expect(readFile(file).feature_a).toEqual({
      slot: 1,
      worktreePath: '/home/dev/wt/feature-a',
      lastUsedAt: '2026-02-02T11:30:00.000Z'
    })
  })

  it('leaves other environments untouched when recording a use', () => {
    const file = stateFile()
    const registry = createRegistry({ stateFilePath: file })

    registry.write({
      other: {
        slot: 2,
        worktreePath: '/home/dev/wt/other',
        lastUsedAt: '2020-01-01T00:00:00.000Z'
      }
    })
    registry.recordUse('feature_a', {
      slot: 1,
      worktreePath: '/home/dev/wt/feature-a'
    })

    expect(readFile(file).other).toEqual({
      slot: 2,
      worktreePath: '/home/dev/wt/other',
      lastUsedAt: '2020-01-01T00:00:00.000Z'
    })
  })

  it('frees one environment’s slot on release, keeping every other entry', () => {
    const file = stateFile()
    const registry = createRegistry({ stateFilePath: file })

    registry.write({
      feature_a: {
        slot: 1,
        worktreePath: '/home/dev/wt/feature-a',
        lastUsedAt: '2026-01-01T00:00:00.000Z'
      },
      feature_b: {
        slot: 2,
        worktreePath: '/home/dev/wt/feature-b',
        lastUsedAt: '2026-01-01T00:00:00.000Z'
      }
    })

    expect(registry.release('feature_a')).toEqual({
      feature_b: {
        slot: 2,
        worktreePath: '/home/dev/wt/feature-b',
        lastUsedAt: '2026-01-01T00:00:00.000Z'
      }
    })
    expect(readFile(file).feature_a).toBe(undefined)
    expect(readFile(file).feature_b.slot).toBe(2)
  })

  it('treats releasing an unknown environment as a no-op, so destroy is idempotent', () => {
    const file = stateFile()
    const registry = createRegistry({ stateFilePath: file })

    registry.write({
      feature_b: {
        slot: 2,
        worktreePath: '/home/dev/wt/feature-b',
        lastUsedAt: '2026-01-01T00:00:00.000Z'
      }
    })

    expect(() => registry.release('never_existed')).not.toThrow()
    expect(readFile(file).feature_b.slot).toBe(2)
  })

  it('reports entries whose worktree directory no longer exists as stale', () => {
    const alive = path.join(tempDir, 'alive')
    fs.mkdirSync(alive)

    const registry = createRegistry({ stateFilePath: stateFile() })
    const snapshot = {
      alive: { slot: 0, worktreePath: alive, lastUsedAt: '2026-01-01' },
      gone: {
        slot: 1,
        worktreePath: path.join(tempDir, 'gone'),
        lastUsedAt: '2026-01-01'
      }
    }

    expect(registry.findStaleNames(snapshot)).toEqual(['gone'])
  })

  it('fails loudly rather than silently resetting a corrupt state file', () => {
    const file = stateFile()
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, '{ not json')

    const registry = createRegistry({ stateFilePath: file })

    expect(() => registry.read()).toThrow(
      new RegExp(file.replace(/\//g, '\\/'))
    )
  })
})
