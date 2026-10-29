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
import { CliDeps, main } from './cli'
import { EnvironmentDiscovery } from './data-plan'
import { EnvironmentDataServices } from './environment-data'
import { CommandSpec } from './exec'
import { createRegistry } from './registry'

let tempDir: string
let stateFilePath: string
let primary: string
let linked: string

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocrvs-dev-cli-'))
  stateFilePath = path.join(tempDir, 'envs.json')
  primary = path.join(tempDir, 'opencrvs-core')
  linked = path.join(tempDir, 'feature-a')
  fs.mkdirSync(primary)
  fs.mkdirSync(linked)
})

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true })
})

function register(entries: Record<string, { slot: number; path: string }>) {
  fs.writeFileSync(
    stateFilePath,
    JSON.stringify(
      Object.fromEntries(
        Object.entries(entries).map(([name, { slot, path: worktreePath }]) => [
          name,
          { slot, worktreePath, lastUsedAt: '2026-01-01T00:00:00.000Z' }
        ])
      )
    )
  )
}

/**
 * Everything real except the containers: a registry on a temp file, a
 * worktree probe that knows which temp directory is the primary checkout, and
 * a data adapter that records what it was asked to do.
 */
function harness(
  options: {
    cwd?: string
    ambient?: NodeJS.ProcessEnv
    indices?: string[]
    discovery?: EnvironmentDiscovery
  } = {}
) {
  const out: string[] = []
  const err: string[] = []
  const operations: string[] = []
  const commands: CommandSpec[] = []
  const registry = createRegistry({ stateFilePath })

  const dataServices: EnvironmentDataServices = {
    dropDatabase: (db) => void operations.push(`dropDatabase ${db}`),
    listIndices: () => options.indices ?? [],
    deleteIndex: (index) => void operations.push(`deleteIndex ${index}`),
    removeBucket: (bucket) => {
      operations.push(`removeBucket ${bucket}`)
      return 'removed'
    },
    flushRedisDb: (db) => void operations.push(`flushRedisDb ${db}`),
    releaseRegistryEntry: (name) => {
      operations.push(`releaseRegistryEntry ${name}`)
      registry.release(name)
    },
    dropSchemas: (db, schemas) => {
      operations.push(`dropSchemas ${db} ${schemas.join(',')}`)
      return 'dropped'
    },
    emptyBucket: (bucket) => {
      operations.push(`emptyBucket ${bucket}`)
      return 'removed'
    },
    removeFile: () => false
  }

  const deps: CliDeps = {
    registry,
    inspectWorktree: (worktreePath) => {
      const resolved = worktreePath ?? options.cwd ?? linked
      return { path: resolved, isPrimary: resolved === primary }
    },
    ambient: options.ambient ?? {},
    discover: () => options.discovery ?? { names: [] },
    dataServices,
    run: (spec) => {
      commands.push(spec)
      return { status: 0, stdout: '', stderr: '' }
    },
    out: (line) => out.push(line),
    err: (line) => err.push(line)
  }

  return {
    run: (...argv: string[]) => main(argv, deps),
    out,
    err,
    operations,
    commands,
    state: () => JSON.parse(fs.readFileSync(stateFilePath, 'utf8'))
  }
}

describe('resolve', () => {
  it('registers the checkout and prints only export lines on stdout', () => {
    register({ gone: { slot: 1, path: path.join(tempDir, 'gone') } })
    const cli = harness({ cwd: linked })

    expect(cli.run('resolve')).toBe(0)

    expect(cli.out.join('\n')).toContain("export TARGET_DB='events_feature_a'")
    expect(cli.out.every((line) => line.startsWith('export '))).toBe(true)
    // The stale-entry warning goes to stderr, so `eval` stays safe.
    expect(cli.err.join('\n')).toContain('env:destroy gone')
    expect(cli.state().feature_a.slot).toBe(1)
  })
})

describe('lookup', () => {
  it('prints the default environment’s contract from the primary checkout', () => {
    const cli = harness({ cwd: primary })

    expect(cli.run('lookup')).toBe(0)
    expect(cli.out.join('\n')).toContain("export TARGET_DB='events'")
    expect(fs.existsSync(stateFilePath)).toBe(false)
  })

  it('fails with nothing on stdout for an environment that does not exist', () => {
    const cli = harness({ cwd: primary })

    expect(cli.run('lookup', '--env', 'typo')).toBe(1)
    expect(cli.out).toEqual([])
    expect(cli.err.join('\n')).toMatch(/"typo" is not registered/)
  })
})

describe('destroy', () => {
  beforeEach(() => {
    register({
      opencrvs_core: { slot: 0, path: primary },
      feature_a: { slot: 1, path: linked }
    })
  })

  it('destroys a named environment and frees its slot', () => {
    const cli = harness({ indices: ['events_feature_a_v2_birth'] })

    expect(cli.run('destroy', 'feature-a')).toBe(0)
    expect(cli.operations).toEqual([
      'dropDatabase events_feature_a',
      'deleteIndex events_feature_a_v2_birth',
      'removeBucket feature-a--ocrvs',
      'flushRedisDb 1',
      'releaseRegistryEntry feature_a'
    ])
    expect(Object.keys(cli.state())).toEqual(['opencrvs_core'])
  })

  it('refuses the default environment however its name is typed, from any checkout', () => {
    for (const spelling of ['opencrvs-core', 'OpenCRVS-Core']) {
      const cli = harness({ cwd: linked })

      expect(cli.run('destroy', spelling)).toBe(1)
      expect(cli.operations).toEqual([])
      expect(cli.err.join('\n')).toMatch(/--force/)
    }
    expect(Object.keys(harness().state())).toContain('opencrvs_core')
  })

  it('asks which environment when none is named', () => {
    const cli = harness()

    expect(cli.run('destroy')).toBe(1)
    expect(cli.err.join('\n')).toMatch(/Which environment\?/)
  })
})

describe('clear', () => {
  beforeEach(() => {
    register({
      opencrvs_core: { slot: 0, path: primary },
      feature_a: { slot: 1, path: linked }
    })
  })

  it('acts on a contract an enclosing script exported, not on the checkout', () => {
    const cli = harness({
      cwd: primary,
      ambient: {
        OPENCRVS_ENV_NAME: 'feature_a',
        OPENCRVS_ENV_SLOT: '1',
        TARGET_DB: 'events_feature_a'
      },
      indices: ['events_v2_birth', 'events_feature_a_v2_birth']
    })

    expect(cli.run('clear')).toBe(0)
    expect(cli.operations).toEqual([
      'deleteIndex events_feature_a_v2_birth',
      'emptyBucket feature-a--ocrvs',
      'dropSchemas events_feature_a app,analytics'
    ])
  })

  it('clears the default environment without touching a named one', () => {
    const cli = harness({
      cwd: primary,
      indices: [
        'events_v2_birth',
        'reindexing_status',
        'events_feature_a_v2_birth'
      ]
    })

    expect(cli.run('clear')).toBe(0)
    expect(cli.operations).toEqual([
      'deleteIndex events_v2_birth',
      'deleteIndex reindexing_status',
      'emptyBucket ocrvs',
      'dropSchemas events app,analytics'
    ])
  })

  it('never registers an environment it was asked to clear', () => {
    const cli = harness({ cwd: path.join(tempDir, 'unregistered') })

    expect(cli.run('clear')).toBe(1)
    expect(cli.operations).toEqual([])
    expect(Object.keys(cli.state())).toEqual(['opencrvs_core', 'feature_a'])
  })
})

describe('list', () => {
  it('prints every registered environment', () => {
    register({ feature_a: { slot: 1, path: linked } })
    const cli = harness()

    expect(cli.run('list')).toBe(0)
    expect(cli.out.join('\n')).toContain('feature_a')
  })
})

describe('deps:down', () => {
  it('stops the dependency singleton from the repository root, keeping volumes unless asked', () => {
    const cli = harness({ cwd: linked })

    expect(cli.run('deps:down')).toBe(0)
    expect(cli.run('deps:down', '-v')).toBe(0)

    expect(cli.commands.map((spec) => spec.cwd)).toEqual([linked, linked])
    expect(cli.commands[0].args).not.toContain('-v')
    expect(cli.commands[1].args.at(-1)).toBe('-v')
  })
})

describe('main', () => {
  it('prints usage and fails without a verb', () => {
    const cli = harness()

    expect(cli.run()).toBe(1)
    expect(cli.out.join('\n')).toMatch(/usage: dev-cli <verb>/)
  })

  it('rejects an unknown verb', () => {
    const cli = harness()

    expect(cli.run('nope')).toBe(1)
    expect(cli.err.join('\n')).toMatch(/Unknown verb "nope"/)
  })
})
