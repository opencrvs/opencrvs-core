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
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createFakeGitHub } from '../../server/fakeGitHub'
import { GitHubSession, handleApiRequest, type ApiRequest } from '../../server/plugin'
import { bindings } from '../../ui/bindings/load'
import { answersFor } from '../plan/answers'

const TOKEN = 'ghp_super_secret_token_value'
const SECRET = 'an extremely private value'
const TEMPLATES = join(__dirname, '../../templates')

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'env-init-'))
})
afterEach(() => rm(dir, { recursive: true, force: true }))

function setup(permissions = { admin: true, push: true, pull: true }) {
  const fake = createFakeGitHub({
    tokens: { [TOKEN]: { login: 'octocat', scopes: ['repo', 'workflow'] } },
    repos: {
      'acme/infra': {
        permissions,
        repository: { variables: {}, secretNames: [] },
        environments: { qa: { variables: { DOMAIN: 'old.example.org' }, secretNames: [] } }
      }
    }
  })
  const options = {
    environmentsDir: dir,
    projectDir: dir,
    github: new GitHubSession({ baseUrl: 'https://api.github.test', fetch: fake.fetch }),
    files: { bindings, templatesDir: TEMPLATES }
  }
  const call = (path: string, request: ApiRequest = {}) => handleApiRequest(path, options, request)
  const post = (path: string, body: unknown, extra: ApiRequest = {}) => call(path, { method: 'POST', body, ...extra })
  const connect = () => post('/api/github/connect', { token: TOKEN, owner: 'acme', repo: 'infra' })
  return { fake, options, call, post, connect, repo: fake.state.repos['acme/infra']! }
}

describe('GitHub write routes', () => {
  it('need a connection', async () => {
    const { post } = setup()
    for (const path of ['/api/github/environment', '/api/github/variable', '/api/github/secret']) {
      expect((await post(path, { name: 'qa' }))?.status).toBe(409)
    }
  })

  it('create an environment, set variables and secrets, and say only that it worked', async () => {
    const { post, connect, repo } = setup()
    await connect()
    const answers = [
      await post('/api/github/environment', { name: 'staging' }),
      await post('/api/github/variable', { scope: 'environment', environment: 'staging', name: 'DOMAIN', value: 'staging.example.org' }),
      await post('/api/github/variable', { scope: 'environment', environment: 'qa', name: 'DOMAIN', value: 'qa.example.org', exists: true }),
      await post('/api/github/secret', { scope: 'environment', environment: 'staging', name: 'SMTP_PASSWORD', value: SECRET }),
      await post('/api/github/secret', { scope: 'repository', name: 'REGISTRY_TOKEN', value: SECRET })
    ]
    for (const answer of answers) expect(answer).toEqual({ status: 200, body: { ok: true } })
    expect(repo.environments.staging!.variables.DOMAIN).toBe('staging.example.org')
    expect(repo.environments.qa!.variables.DOMAIN).toBe('qa.example.org')
    expect(repo.writtenSecrets).toEqual({ 'environment/staging:SMTP_PASSWORD': SECRET, 'repository:REGISTRY_TOKEN': SECRET })
    expect(JSON.stringify(answers)).not.toContain(SECRET)
  })

  it.each([
    ['unknown scope', { scope: 'org', name: 'A', value: 'b' }],
    ['environment scope without an environment', { scope: 'environment', name: 'A', value: 'b' }],
    ['environment name with a slash', { scope: 'environment', environment: 'a/b', name: 'A', value: 'b' }],
    ['name that starts with a digit', { scope: 'repository', name: '1A', value: 'b' }],
    ['name with a hyphen', { scope: 'repository', name: 'A-B', value: 'b' }],
    ['empty value', { scope: 'repository', name: 'A', value: '' }],
    ['value that is not text', { scope: 'repository', name: 'A', value: 42 }],
    ['value over 48 KB', { scope: 'repository', name: 'A', value: 'x'.repeat(49_153) }]
  ])('refuse %s before contacting GitHub', async (_label, body) => {
    const { post, connect, fake } = setup()
    await connect()
    const before = fake.log.length
    for (const path of ['/api/github/variable', '/api/github/secret']) expect((await post(path, body))?.status).toBe(400)
    expect(fake.log.length).toBe(before)
  })

  it('refuse an invalid environment name when creating one', async () => {
    const { post, connect } = setup()
    await connect()
    expect((await post('/api/github/environment', { name: '../x' }))?.status).toBe(400)
    expect((await post('/api/github/environment', {}))?.status).toBe(400)
  })

  it('report GitHub refusals without the value or the token', async () => {
    const { post, connect } = setup({ admin: false, push: false, pull: true })
    await connect()
    const results = [
      await post('/api/github/secret', { scope: 'repository', name: 'A', value: SECRET }),
      await post('/api/github/variable', { scope: 'repository', name: 'A', value: SECRET }),
      await post('/api/github/environment', { name: 'x' })
    ]
    for (const result of results) {
      expect(result?.status).toBe(502)
      expect(JSON.stringify(result)).not.toContain(SECRET)
      expect(JSON.stringify(result)).not.toContain(TOKEN)
    }
  })

  it('are refused from another site, before GitHub is contacted', async () => {
    const { post, connect, fake } = setup()
    await connect()
    const before = fake.log.length
    const result = await post('/api/github/secret', { scope: 'repository', name: 'A', value: SECRET }, { host: 'localhost:5173', origin: 'https://evil.example' })
    expect(result?.status).toBe(403)
    expect(fake.log.length).toBe(before)
  })
})

describe('file routes', () => {
  const values = { values: answersFor('prod') }

  it('render shows the files and what is there now', async () => {
    const { post } = setup()
    const result = await post('/api/environments/prod/render', values)
    const files = (result?.body as { files: { path: string; text: string; existing: string | null; target: string | null }[] }).files
    expect(files.map((file) => file.path)).toEqual(['inventory.yml', 'dependencies/values.yaml', 'traefik/values.yaml', 'opencrvs-services/values.yaml'])
    expect(files.map((file) => file.target)).toEqual(['prod/inventory.yml', 'prod/dependencies/values.yaml', 'prod/traefik/values.yaml', 'prod/opencrvs-services/values.yaml'])
    expect((result?.body as { layout: string }).layout).toBe('none') // nothing in the folder yet
    expect(files[0]!.text).toContain('ansible_host: 10.3.0.11')
    expect(files.every((file) => file.existing === null)).toBe(true)

    await mkdir(join(dir, 'prod'), { recursive: true })
    await writeFile(join(dir, 'prod', 'inventory.yml'), 'old: true\n')
    const again = (await post('/api/environments/prod/render', values))?.body as { files: { existing: string | null }[] }
    expect(again.files[0]!.existing).toBe('old: true\n')
    expect(await readFile(join(dir, 'prod', 'inventory.yml'), 'utf8')).toBe('old: true\n') // render writes nothing
  })

  it('write puts the same files on disk', async () => {
    const { post, call } = setup()
    const rendered = ((await post('/api/environments/prod/render', values))?.body as { files: { path: string; text: string; target: string }[] }).files
    const written = await call('/api/environments/prod/files', { method: 'PUT', body: values })
    expect(written).toEqual({ status: 200, body: { written: [
          'prod/inventory.yml',
          'prod/dependencies/values.yaml',
          'prod/traefik/values.yaml',
          'prod/opencrvs-services/values.yaml'
        ] } })
    for (const file of rendered) expect(await readFile(join(dir, file.target), 'utf8')).toBe(file.text)
  })

  it('refuse a bad name and a missing body', async () => {
    const { post } = setup()
    expect((await post('/api/environments/..%2Fx/render', values))?.status).toBe(400)
    expect((await post('/api/environments/prod/render', {}))?.status).toBe(400)
    expect((await post('/api/environments/prod/render', { values: [] }))?.status).toBe(400)
  })

  describe('in a folder of single files (the flat layout)', () => {
    type Rendered = { layout: string; files: { path: string; text: string; existing: string | null; target: string | null }[] }

    it('render says where each file goes: the flat file has a place, the other has none', async () => {
      const { post } = setup()
      await writeFile(join(dir, 'staging.yaml'), 'old: true\n')
      const body = (await post('/api/environments/staging/render', values))?.body as Rendered
      expect(body.layout).toBe('files')
      expect(body.files.map((file) => [file.path, file.target, file.existing])).toEqual([
        ['inventory.yml', 'staging.yaml', 'old: true\n'],
        ['dependencies/values.yaml', null, null],
        ['traefik/values.yaml', null, null],
        ['opencrvs-services/values.yaml', null, null]
      ])
    })

    it('write puts the inventory into <name>.yaml and creates nothing else', async () => {
      const { post, call } = setup()
      await writeFile(join(dir, 'staging.yaml'), 'old: true\n')
      const rendered = (await post('/api/environments/prod/render', values))?.body as Rendered
      const written = await call('/api/environments/prod/files', { method: 'PUT', body: values })
      expect(written).toEqual({ status: 200, body: { written: ['prod.yaml'] } })
      expect(await readFile(join(dir, 'prod.yaml'), 'utf8')).toBe(rendered.files[0]!.text)
      expect((await readdir(dir)).sort()).toEqual(['prod.yaml', 'staging.yaml'])
    })
  })

  it('answer 501 when rendering is not configured, and ignore the wrong method', async () => {
    const { options } = setup()
    const without = { ...options, files: undefined }
    expect((await handleApiRequest('/api/environments/prod/render', without, { method: 'POST', body: values }))?.status).toBe(501)
    expect(await handleApiRequest('/api/environments/prod/render', options, { method: 'GET' })).toBeNull()
    expect(await handleApiRequest('/api/environments/prod/files', options, { method: 'POST', body: values })).toBeNull()
  })
})
