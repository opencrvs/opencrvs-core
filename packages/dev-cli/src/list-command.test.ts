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
  formatEnvironmentTable,
  runList,
  summarizeEnvironments
} from './list-command'
import { createRegistry } from './registry'
import { runResolve } from './resolve-command'
import { RegistrySnapshot } from './types'

let tempDir: string
let stateFilePath: string

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocrvs-dev-cli-list-'))
  stateFilePath = path.join(tempDir, 'state', 'opencrvs', 'envs.json')
})

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true })
})

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

describe('summarizeEnvironments', () => {
  it('derives each environment’s ports from its slot', () => {
    const [primary, linked] = summarizeEnvironments(
      snapshot({
        feature_a: { slot: 1, worktreePath: '/home/dev/wt/feature-a' },
        opencrvs_core: { slot: 0, worktreePath: '/home/dev/opencrvs-core' }
      })
    )

    expect(primary.name).toBe('opencrvs_core')
    expect(primary.slot).toBe(0)
    expect(primary.ports.client).toBe(3000)
    expect(primary.ports.gateway).toBe(7070)

    expect(linked.name).toBe('feature_a')
    expect(linked.slot).toBe(1)
    expect(linked.ports.client).toBe(13000)
    expect(linked.ports.gateway).toBe(17070)
  })

  it('orders by slot so the table reads like the port ranges do', () => {
    const rows = summarizeEnvironments(
      snapshot({
        c: { slot: 2, worktreePath: '/c' },
        a: { slot: 1, worktreePath: '/a' },
        b: { slot: 1, worktreePath: '/b' }
      })
    )

    expect(rows.map((row) => row.name)).toEqual(['a', 'b', 'c'])
  })

  it('marks an environment whose worktree has disappeared', () => {
    const [row] = summarizeEnvironments(
      snapshot({ gone: { slot: 1, worktreePath: '/home/dev/wt/gone' } }),
      ['gone']
    )

    expect(row.worktreeMissing).toBe(true)
  })
})

describe('formatEnvironmentTable', () => {
  it('shows every environment’s name, slot and derived ports', () => {
    const table = formatEnvironmentTable(
      summarizeEnvironments(
        snapshot({
          opencrvs_core: { slot: 0, worktreePath: '/home/dev/opencrvs-core' },
          feature_a: { slot: 1, worktreePath: '/home/dev/wt/feature-a' }
        })
      )
    )
    const [header, ...rows] = table.split('\n')

    expect(header).toMatch(/^NAME\s+SLOT\s+CLIENT/)
    expect(header).toContain('WORKTREE')
    expect(rows[0]).toMatch(/^opencrvs_core\s+0\s+3000\s+3020\s+7070/)
    expect(rows[1]).toMatch(/^feature_a\s+1\s+13000\s+13020\s+17070/)
    expect(rows[1]).toContain('/home/dev/wt/feature-a')
  })

  it('says so plainly when nothing is registered', () => {
    expect(formatEnvironmentTable([])).toMatch(/No environments are registered/)
  })
})

describe('runList', () => {
  it('leaves the registry file byte-identical', () => {
    const worktreePath = path.join(tempDir, 'worktrees', 'opencrvs-core')
    fs.mkdirSync(worktreePath, { recursive: true })

    // Registered the ordinary way, so the fixture is a file `resolve` wrote.
    runResolve({
      worktreePath,
      isPrimaryWorktree: true,
      registry: createRegistry({
        stateFilePath,
        now: () => new Date('2026-03-01T09:00:00.000Z')
      })
    })

    const before = fs.readFileSync(stateFilePath)

    const { environments } = runList({
      registry: createRegistry({
        stateFilePath,
        // Any write would stamp this time, making the mismatch obvious rather
        // than merely probable.
        now: () => new Date('2099-12-31T23:59:59.000Z')
      })
    })

    expect(environments).toHaveLength(1)
    expect(fs.readFileSync(stateFilePath).equals(before)).toBe(true)
    expect(JSON.parse(before.toString()).opencrvs_core.lastUsedAt).toBe(
      '2026-03-01T09:00:00.000Z'
    )
  })

  it('never creates a registry file for a machine that has none', () => {
    const { environments, table } = runList({
      registry: createRegistry({ stateFilePath })
    })

    expect(environments).toEqual([])
    expect(table).toMatch(/No environments are registered/)
    expect(fs.existsSync(stateFilePath)).toBe(false)
  })

  it('never allocates a slot, however full the registry is', () => {
    // `resolve` would throw `SlotAllocationError` here; listing must not care.
    fs.mkdirSync(path.dirname(stateFilePath), { recursive: true })
    fs.writeFileSync(
      stateFilePath,
      `${JSON.stringify(
        snapshot({
          a: { slot: 0, worktreePath: '/a' },
          b: { slot: 1, worktreePath: '/b' },
          c: { slot: 2, worktreePath: '/c' },
          d: { slot: 3, worktreePath: '/d' },
          e: { slot: 4, worktreePath: '/e' },
          f: { slot: 5, worktreePath: '/f' }
        }),
        null,
        2
      )}\n`
    )

    const before = fs.readFileSync(stateFilePath)
    const { environments } = runList({
      registry: createRegistry({ stateFilePath })
    })

    expect(environments.map((row) => row.slot)).toEqual([0, 1, 2, 3, 4, 5])
    expect(fs.readFileSync(stateFilePath).equals(before)).toBe(true)
  })
})
