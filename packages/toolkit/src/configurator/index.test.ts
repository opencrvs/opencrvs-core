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

import { existsSync } from 'node:fs'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  runConfiguratorInit,
  runConfiguratorUpdateWorkflows,
  runConfiguratorUpgrade,
  startConfigurator,
  type Context
} from './index'
import {
  createRepository,
  environmentInput,
  read,
  removeRepositories,
  workflow
} from './testing'

const servers: Server[] = []

afterEach(async () => {
  removeRepositories()
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.close(() => resolve())
          server.closeAllConnections()
        })
    )
  )
})

function contextFor(root: string) {
  const lines: string[] = []
  const context: Context = { root, log: (message) => lines.push(message) }
  return { context, output: () => lines.join('\n') }
}

const infrastructureRepository = (files: Record<string, string> = {}) =>
  createRepository({
    'infrastructure/.gitkeep': '',
    'environments/.gitkeep': '',
    '.github/workflows/provision.yml': workflow(environmentInput(['old'])),
    ...files
  })

describe('every command', () => {
  it.each([
    ['init', (context: Context) => runConfiguratorInit([], context)],
    ['upgrade', (context: Context) => runConfiguratorUpgrade(context)],
    [
      'update-workflows',
      (context: Context) => runConfiguratorUpdateWorkflows([], context)
    ]
  ])('%s refuses to run outside an infrastructure repository', async (_, run) => {
    const { context } = contextFor(createRepository())

    await expect(run(context)).rejects.toThrow(
      /not a valid OpenCRVS infrastructure repository.*\.github\/workflows, environments, infrastructure/
    )
  })

  it.each([
    ['upgrade', (context: Context) => runConfiguratorUpgrade(context)],
    [
      'update-workflows',
      (context: Context) => runConfiguratorUpdateWorkflows([], context)
    ]
  ])('%s refuses a repository that has no environments folder', async (_, run) => {
    const root = createRepository({
      'infrastructure/.gitkeep': '',
      '.github/workflows/provision.yml': workflow(environmentInput(['old']))
    })

    await expect(run(contextFor(root).context)).rejects.toThrow(
      'Missing required directory: environments'
    )
    expect(read(root, '.github/workflows/provision.yml')).toContain('- old')
  })
})

describe('runConfiguratorUpdateWorkflows', () => {
  const files = { 'environments/qa/inventory.yml': '' }

  it('updates the workflows', async () => {
    const root = infrastructureRepository(files)
    const { context, output } = contextFor(root)

    await runConfiguratorUpdateWorkflows([], context)

    expect(output()).toContain('✓ updated .github/workflows/provision.yml (qa)')
    expect(read(root, '.github/workflows/provision.yml')).toContain('- qa\n')
  })

  it('writes nothing with --dry-run', async () => {
    const root = infrastructureRepository(files)
    const before = read(root, '.github/workflows/provision.yml')
    const { context, output } = contextFor(root)

    await runConfiguratorUpdateWorkflows(['--dry-run'], context)

    expect(output()).toContain(
      'would update .github/workflows/provision.yml (qa)'
    )
    expect(read(root, '.github/workflows/provision.yml')).toBe(before)
  })

  it('rejects an unknown option', async () => {
    const { context } = contextFor(infrastructureRepository(files))

    await expect(
      runConfiguratorUpdateWorkflows(['--force'], context)
    ).rejects.toThrow('--force')
  })

  it('fails with the name of the workflow it cannot update, and writes nothing', async () => {
    const root = infrastructureRepository({
      ...files,
      '.github/workflows/reset-2fa.yml': 'name: no inputs\n'
    })

    await expect(
      runConfiguratorUpdateWorkflows([], contextFor(root).context)
    ).rejects.toThrow('reset-2fa.yml')
    expect(read(root, '.github/workflows/provision.yml')).toContain('- old')
  })
})

describe('runConfiguratorUpgrade', () => {
  const old = { 'infrastructure/server-setup/inventory/qa.yml': 'qa inventory' }

  it('moves the inventories and updates the workflows', async () => {
    const root = infrastructureRepository(old)
    const { context, output } = contextFor(root)

    await runConfiguratorUpgrade(context)

    expect(output()).toContain('environments/qa/inventory.yml')
    expect(output()).toContain('Environment layout upgraded')
    expect(read(root, 'environments/qa/inventory.yml')).toBe('qa inventory')
    expect(
      existsSync(join(root, 'infrastructure/server-setup/inventory'))
    ).toBe(false)
    expect(read(root, '.github/workflows/provision.yml')).toContain('- qa\n')
  })

  it('says so when there is nothing to upgrade', async () => {
    const root = infrastructureRepository(old)
    await runConfiguratorUpgrade(contextFor(root).context)
    const { context, output } = contextFor(root)

    await runConfiguratorUpgrade(context)

    expect(output()).toContain('No old inventory files found')
    expect(output()).toContain('already uses the current structure')
  })
})

describe('runConfiguratorInit', () => {
  it('rejects a port that is not a number', async () => {
    const { context } = contextFor(infrastructureRepository())

    await expect(runConfiguratorInit(['--port', 'nope'], context)).rejects.toThrow(
      'Invalid port: nope'
    )
  })

  it('refuses while the inventories are in the old location, and says what to run', async () => {
    const root = infrastructureRepository({
      'infrastructure/server-setup/inventory/qa.yml': ''
    })

    await expect(
      runConfiguratorInit([], contextFor(root).context)
    ).rejects.toThrow('opencrvs configurator upgrade')
  })

  it('says when the page has not been built', async () => {
    // Running from source: the build puts the page next to dist/cli.js.
    await expect(
      runConfiguratorInit([], contextFor(infrastructureRepository()).context)
    ).rejects.toThrow('not built')
  })
})

describe('startConfigurator', () => {
  const start = async (files: Record<string, string> = {}) => {
    const root = infrastructureRepository({
      '.git/config': '[remote "origin"]\n\turl = https://github.com/acme/infra.git\n',
      'environments/qa/inventory.yml': '',
      ...files
    })
    const assetsDir = createRepository({
      'ui/index.html': '<title>Configurator</title>',
      'forms/bindings.yml': 'files: {}\n'
    })
    const server = await startConfigurator(contextFor(root).context, {
      port: 0,
      assetsDir
    })
    servers.push(server)
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    return { base }
  }

  it('serves the page, and the single page answers any other path', async () => {
    const { base } = await start()

    expect(await (await fetch(`${base}/`)).text()).toContain('Configurator')
    expect(await (await fetch(`${base}/some/path`)).text()).toContain(
      'Configurator'
    )
  })

  it('works on the repository it was started in', async () => {
    const { base } = await start()

    expect(await (await fetch(`${base}/api/context`)).json()).toEqual({
      repository: { owner: 'acme', repo: 'infra' }
    })
    expect(await (await fetch(`${base}/api/environments`)).json()).toEqual({
      names: ['qa'],
      layout: 'folders'
    })
  })
})
