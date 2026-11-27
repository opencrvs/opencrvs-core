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
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  findToolkitVersion,
  main,
  updatePackageJson,
  updateScripts
} from './update-package-json'

/** Scripts from opencrvs-farajaland release/v2.0.0 that touch infrastructure/. */
const V2_0_SCRIPTS = {
  'setup-analytics':
    'docker exec -i postgres bash -s < ./infrastructure/postgres/setup-analytics.sh',
  'db:clear:all':
    'bash infrastructure/clear-all-data-dev.sh && yarn setup-analytics',
  metabase: 'bash infrastructure/metabase/run-dev.sh',
  deploy: 'bash infrastructure/deployment/deploy.sh',
  'restore-snapshot': 'bash infrastructure/backups/restore-snapshot.sh',
  snapshot: 'bash infrastructure/backups/backup.sh',
  'port-forward': 'bash infrastructure/port-forward.sh',
  'environment:init':
    'ts-node infrastructure/environments/setup-environment.ts',
  'environment:upgrade': 'yarn environment:init',
  test: 'vitest'
}

/** What the v2.1 template ships under assets/. */
const ASSETS = new Set([
  'assets/postgres/setup-analytics.sh',
  'assets/clear-all-data-dev.sh',
  'assets/metabase/run-dev.sh',
  'assets/deployment/deploy.sh'
])

describe('updateScripts', () => {
  it('points infrastructure/ paths at assets/ and drops scripts whose file is gone', () => {
    const { scripts, rewritten, removed } = updateScripts(
      V2_0_SCRIPTS,
      (file) => ASSETS.has(file)
    )

    expect(scripts).toEqual({
      'setup-analytics':
        'docker exec -i postgres bash -s < ./assets/postgres/setup-analytics.sh',
      'db:clear:all':
        'bash assets/clear-all-data-dev.sh && yarn setup-analytics',
      metabase: 'bash assets/metabase/run-dev.sh',
      deploy: 'bash assets/deployment/deploy.sh',
      test: 'vitest'
    })
    expect(Object.keys(rewritten)).toEqual([
      'setup-analytics',
      'db:clear:all',
      'metabase',
      'deploy'
    ])
    expect(removed).toEqual({
      'restore-snapshot': 'infrastructure/backups/restore-snapshot.sh',
      snapshot: 'infrastructure/backups/backup.sh',
      'port-forward': 'infrastructure/port-forward.sh',
      'environment:init': 'infrastructure/environments/setup-environment.ts',
      'environment:upgrade': 'the "environment:init" script'
    })
  })

  it('does not treat a package manager flag as a script call', () => {
    const scripts = {
      install: 'pnpm --filter x install',
      a: 'bash assets/a.sh'
    }

    expect(updateScripts(scripts, () => false).scripts).toEqual({
      install: 'pnpm --filter x install'
    })
  })

  it('keeps infrastructure/ paths whose file is still there (Docker Swarm)', () => {
    const { scripts, removed } = updateScripts(
      { snapshot: 'bash infrastructure/backups/backup.sh' },
      (file) => file === 'infrastructure/backups/backup.sh'
    )

    expect(scripts).toEqual({
      snapshot: 'bash infrastructure/backups/backup.sh'
    })
    expect(removed).toEqual({})
  })

  it('drops assets/ scripts whose file does not exist', () => {
    const { removed } = updateScripts(
      { 'port-forward': 'bash assets/port-forward.sh' },
      () => false
    )

    expect(removed).toEqual({ 'port-forward': 'assets/port-forward.sh' })
  })

  it('leaves globs and bare directories alone', () => {
    const scripts = {
      format: 'prettier --write src/ infrastructure/',
      lint: 'shellcheck infrastructure/**/*.sh'
    }

    expect(updateScripts(scripts, () => false)).toEqual({
      scripts,
      rewritten: {},
      removed: {}
    })
  })

  it('does not touch paths that only end in infrastructure/', () => {
    const scripts = { build: 'bash my-infrastructure/run.sh' }

    expect(updateScripts(scripts, () => false).scripts).toEqual(scripts)
  })
})

describe('updatePackageJson', () => {
  it('sets version and the toolkit dependency to the running toolkit', () => {
    const { pkg, changes } = updatePackageJson(
      {
        name: '@opencrvs/countryconfig',
        version: '1.9.12',
        dependencies: { '@opencrvs/toolkit': '2.0.0-rc.f20384d', hapi: '1' }
      },
      '2.1.3',
      () => false
    )

    expect(pkg.version).toBe('2.1.3')
    expect(pkg.dependencies).toEqual({
      '@opencrvs/toolkit': '2.1.3',
      hapi: '1'
    })
    expect(changes.version).toEqual({ from: '1.9.12', to: '2.1.3' })
    expect(changes.toolkit).toEqual({ from: '2.0.0-rc.f20384d', to: '2.1.3' })
  })

  it('updates the toolkit where it is declared', () => {
    const { pkg } = updatePackageJson(
      { devDependencies: { '@opencrvs/toolkit': '2.0.0' } },
      '2.1.3',
      () => false
    )

    expect(pkg.devDependencies).toEqual({ '@opencrvs/toolkit': '2.1.3' })
    expect(pkg.dependencies).toBeUndefined()
  })

  it('reports nothing when already up to date', () => {
    const { changes } = updatePackageJson(
      { version: '2.1.3', dependencies: { '@opencrvs/toolkit': '2.1.3' } },
      '2.1.3',
      () => false
    )

    expect(changes).toEqual({ rewritten: {}, removed: {} })
  })
})

describe('findToolkitVersion', () => {
  it('reads the version of the toolkit package', () => {
    const own = JSON.parse(
      readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf8')
    )

    expect(findToolkitVersion()).toBe(own.version)
  })
})

describe('main', () => {
  let cwd: string

  beforeEach(() => {
    cwd = mkdtempSync(path.join(tmpdir(), 'update-package-json-'))
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('rewrites package.json in place, keeping its indentation, and is idempotent', async () => {
    mkdirSync(path.join(cwd, 'assets/metabase'), { recursive: true })
    writeFileSync(path.join(cwd, 'assets/metabase/run-dev.sh'), '')
    writeFileSync(
      path.join(cwd, 'package.json'),
      JSON.stringify(
        {
          version: '1.9.12',
          scripts: {
            metabase: 'bash infrastructure/metabase/run-dev.sh',
            snapshot: 'bash infrastructure/backups/backup.sh'
          },
          dependencies: { '@opencrvs/toolkit': '2.0.0' }
        },
        null,
        4
      ) + '\n'
    )

    await main(cwd, '2.1.3')
    const first = readFileSync(path.join(cwd, 'package.json'), 'utf8')

    expect(first).toBe(
      JSON.stringify(
        {
          version: '2.1.3',
          scripts: { metabase: 'bash assets/metabase/run-dev.sh' },
          dependencies: { '@opencrvs/toolkit': '2.1.3' }
        },
        null,
        4
      ) + '\n'
    )

    await main(cwd, '2.1.3')
    expect(readFileSync(path.join(cwd, 'package.json'), 'utf8')).toBe(first)
  })
})
