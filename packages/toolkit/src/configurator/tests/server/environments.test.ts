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
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  listEnvironmentNames,
  parseGitRemote,
  readEnvironmentFiles
} from '../../server/environments'
import { GitHubSession, handleApiRequest } from '../../server/plugin'

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'env-init-'))
})
afterEach(() => rm(dir, { recursive: true, force: true }))

const folder = (...path: string[]) => mkdir(join(dir, ...path), { recursive: true })
const file = async (path: string, text = 'x: 1\n') => {
  await mkdir(join(dir, ...path.split('/').slice(0, -1)), { recursive: true })
  await writeFile(join(dir, path), text)
}

describe('listEnvironmentNames', () => {
  it('uses subfolders when there are any', async () => {
    await folder('qa')
    await folder('prod')
    await folder('.git')
    await file('notes.yaml')
    expect(await listEnvironmentNames(dir)).toEqual({ names: ['prod', 'qa'], layout: 'folders' })
  })

  it('counts empty subfolders as environments', async () => {
    await folder('dev')
    expect(await listEnvironmentNames(dir)).toEqual({ names: ['dev'], layout: 'folders' })
  })

  it('falls back to *.yaml and *.yml file names when there are no subfolders', async () => {
    await file('staging.yaml')
    await file('production.yml')
    await file('README.md')
    expect(await listEnvironmentNames(dir)).toEqual({ names: ['production', 'staging'], layout: 'files' })
  })

  it('returns nothing for an empty or missing folder', async () => {
    expect(await listEnvironmentNames(dir)).toEqual({ names: [], layout: 'none' })
    expect(await listEnvironmentNames(join(dir, 'missing'))).toEqual({ names: [], layout: 'none' })
  })
})

describe('readEnvironmentFiles', () => {
  it('reads the known files of a folder environment and nothing else', async () => {
    await file('qa/inventory.yml', 'a: 1\n')
    await file('qa/dependencies/values.yaml', 'b: 2\n')
    await file('qa/dependencies/values.override.yaml', 'secret: do-not-read\n')
    await file('qa/other.yml', 'c: 3\n')
    expect(await readEnvironmentFiles(dir, 'qa')).toEqual({
      'inventory.yml': 'a: 1\n',
      'dependencies/values.yaml': 'b: 2\n'
    })
  })

  it('returns an empty set for an environment folder without files', async () => {
    await folder('dev')
    expect(await readEnvironmentFiles(dir, 'dev')).toEqual({})
  })

  it('treats a <name>.yaml file as that environment\'s inventory', async () => {
    await file('staging.yaml', 'a: 1\n')
    expect(await readEnvironmentFiles(dir, 'staging')).toEqual({ 'inventory.yml': 'a: 1\n' })
  })

  it.each(['../etc', '..', 'qa/../../x', '/etc/passwd', 'missing', ''])('refuses %j', async (name) => {
    await folder('qa')
    await file('outside.yml')
    expect(await readEnvironmentFiles(dir, name)).toBeUndefined()
  })
})

describe('parseGitRemote', () => {
  it.each([
    ['git@github.com:adskyiproger/poc-installer.git', { owner: 'adskyiproger', repo: 'poc-installer' }],
    ['https://github.com/opencrvs/infrastructure.git', { owner: 'opencrvs', repo: 'infrastructure' }],
    ['https://github.com/opencrvs/infrastructure', { owner: 'opencrvs', repo: 'infrastructure' }],
    ['https://github.com/opencrvs/infra.structure/', { owner: 'opencrvs', repo: 'infra.structure' }]
  ])('parses %s', (url, expected) => {
    expect(parseGitRemote(url)).toEqual(expected)
  })

  it('returns null for other hosts and garbage', () => {
    expect(parseGitRemote('https://gitlab.com/a/b.git')).toBeNull()
    expect(parseGitRemote('not a url')).toBeNull()
  })
})

describe('API', () => {
  const options = (remote?: string) => ({
    environmentsDir: dir,
    projectDir: dir,
    gitRemote: async () => remote,
    github: new GitHubSession()
  })

  it('returns the repository from the git remote, or null', async () => {
    expect(await handleApiRequest('/api/context', options('git@github.com:acme/infra.git'))).toEqual({
      status: 200,
      body: { repository: { owner: 'acme', repo: 'infra' } }
    })
    expect(await handleApiRequest('/api/context', options())).toEqual({ status: 200, body: { repository: null } })
  })

  it('lists environments and returns their files', async () => {
    await file('qa/inventory.yml', 'a: 1\n')
    expect(await handleApiRequest('/api/environments', options())).toEqual({
      status: 200,
      body: { names: ['qa'], layout: 'folders' }
    })
    expect(await handleApiRequest('/api/environments/qa', options())).toEqual({
      status: 200,
      body: { files: { 'inventory.yml': 'a: 1\n' } }
    })
  })

  it('answers 404 for an unknown environment and ignores other paths', async () => {
    expect((await handleApiRequest('/api/environments/nope', options()))?.status).toBe(404)
    expect((await handleApiRequest('/api/environments/..%2Fetc', options()))?.status).toBe(404)
    expect(await handleApiRequest('/api/other', options())).toBeNull()
  })
})
