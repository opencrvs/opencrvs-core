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
import { readFileSync } from 'node:fs'
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderFixture } from '../../scripts/fixtures'
import { createFakeGitHub } from '../../server/fakeGitHub'
import { GitHubSession, handleApiRequest } from '../../server/plugin'
import { bindings, scanned } from '../../ui/bindings/load'
import { loadSnapshot } from '../../ui/bindings/snapshot'
import { HttpConnection, HttpGitHub } from '../../ui/github/http'
import { HttpLocalServer } from '../../ui/local/http'
import { MockLocalServer } from '../../ui/local/mock'
import { buildSteps, runSteps } from '../../ui/plan/apply'
import { fileStatus, prepareReview } from '../../ui/plan/review'
import { answersFor } from '../plan/answers'

const SECRET = 'ghp_super_secret_token_value'
const readTemplate = (path: string) => readFileSync(join(__dirname, '../../templates', path), 'utf8')

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'env-init-'))
})
afterEach(async () => {
  vi.unstubAllGlobals()
  await rm(dir, { recursive: true, force: true })
})

// The browser's fetch, answered by the dev server's API, which talks to the fake GitHub.
function wire() {
  const fakeGitHub = createFakeGitHub({
    tokens: { [SECRET]: { login: 'octocat', scopes: ['repo', 'workflow'] } },
    repos: {
      'acme/infra': {
        permissions: { admin: true, push: true, pull: true },
        repository: { variables: {}, secretNames: ['REGISTRY_ORGANISATION', 'REGISTRY_REPOSITORY', 'REGISTRY_USERNAME', 'DOCKER_TOKEN'] },
        environments: {
          qa: {
            variables: { DOMAIN: 'qa.example.org', KUBE_API_HOST: '10.1.0.77', KUBE_WORKER_NODES: '' },
            secretNames: ['SMTP_HOST', 'ENCRYPTION_KEY']
          }
        }
      }
    }
  })
  const options = {
    environmentsDir: dir,
    projectDir: dir,
    github: new GitHubSession({ baseUrl: 'https://api.github.test', fetch: fakeGitHub.fetch }),
    files: { bindings, templatesDir: join(__dirname, '../../templates') }
  }
  const requests: { url: string; method: string; body: string | undefined; headers: Record<string, string> }[] = []
  vi.stubGlobal('fetch', async (input: string, init?: RequestInit) => {
    const headers = (init?.headers ?? {}) as Record<string, string>
    requests.push({ url: input, method: init?.method ?? 'GET', body: init?.body as string | undefined, headers })
    const result = await handleApiRequest(input, options, {
      method: init?.method ?? 'GET',
      body: init?.body ? JSON.parse(init.body as string) : undefined,
      host: 'localhost:5173',
      origin: 'http://localhost:5173'
    })
    return new Response(JSON.stringify(result?.body ?? {}), { status: result?.status ?? 404 })
  })
  return { requests, fakeGitHub }
}

describe('page -> dev server -> GitHub', () => {
  it('connects, reads and merges an environment from the real client code', async () => {
    const { requests } = wire()
    const connection = await new HttpConnection().connect({ token: SECRET, owner: 'acme', repo: 'infra' })
    expect(connection).toEqual({ ok: true, login: 'octocat', missingPermissions: [] })

    const github = new HttpGitHub()
    expect(await github.listEnvironments()).toEqual(['qa'])
    expect((await github.readRepository()).secretNames).toContain('DOCKER_TOKEN')

    const local = new MockLocalServer({ qa: renderFixture('qa', readTemplate) }, null)
    const snapshot = await loadSnapshot('qa', { github, local }, bindings, scanned)
    expect(snapshot.exists).toEqual({ github: true, files: true })
    expect(snapshot.values.DOMAIN).toBe('qa.example.org')
    expect(snapshot.values.KUBE_API_HOST).toBe('10.1.0.77') // GitHub beats inventory.yml
    expect(snapshot.definedSecrets).toEqual(expect.arrayContaining(['SMTP_HOST', 'ENCRYPTION_KEY']))
    expect(snapshot.values).not.toHaveProperty('SMTP_HOST')

    // the token travelled once, in the connect request's body, and nowhere else
    const withToken = requests.filter((request) => JSON.stringify(request).includes(SECRET))
    expect(withToken.map((request) => request.url)).toEqual(['/api/github/connect'])
    expect(withToken[0]!.body).toContain(SECRET)
  })

  it('shows a rejected token as a failed connection, not an exception', async () => {
    wire()
    expect(await new HttpConnection().connect({ token: 'nope', owner: 'acme', repo: 'infra' })).toEqual({
      ok: false,
      error: 'GitHub rejected the token (bad credentials).'
    })
    await expect(new HttpGitHub().listEnvironments()).rejects.toThrow('Not connected to GitHub.')
  })

  it('forgets the token on disconnect', async () => {
    wire()
    await new HttpConnection().connect({ token: SECRET, owner: 'acme', repo: 'infra' })
    const github = new HttpGitHub()
    expect(await github.listEnvironments()).toEqual(['qa'])
    await github.disconnect()
    await expect(github.listEnvironments()).rejects.toThrow('Not connected')
  })

  it('reports an unreachable dev server as a failed connection', async () => {
    vi.stubGlobal('fetch', async () => Promise.reject(new Error('Failed to fetch')))
    const result = await new HttpConnection().connect({ token: SECRET, owner: 'acme', repo: 'infra' })
    expect(result).toEqual({ ok: false, error: 'Failed to fetch' })
    expect(JSON.stringify(result)).not.toContain(SECRET)
  })
})

describe('a folder of single files (the flat layout), through the page client', () => {
  it('lists, renders, writes and reads back an environment as one file', async () => {
    await writeFile(join(dir, 'staging.yaml'), 'old: true\n')
    wire()
    const local = new HttpLocalServer()
    expect(await local.listEnvironments()).toEqual({ names: ['staging'], layout: 'files' })

    const values = answersFor('prod')
    const rendered = await local.renderFiles('prod', values)
    expect(rendered.map((file) => [file.path, file.target, fileStatus(file)])).toEqual([
      ['inventory.yml', 'prod.yaml', 'new'],
      ['dependencies/values.yaml', null, 'not written'],
      ['traefik/values.yaml', null, 'not written'],
      ['opencrvs-services/values.yaml', null, 'not written']
    ])

    expect(await local.writeFiles('prod', values)).toEqual(['prod.yaml'])
    expect((await readdir(dir)).sort()).toEqual(['prod.yaml', 'staging.yaml'])
    expect(await local.readEnvironmentFiles('prod')).toEqual({ 'inventory.yml': rendered[0]!.text })
    expect((await local.renderFiles('prod', values)).map(fileStatus)).toEqual(['unchanged', 'not written', 'not written', 'not written'])
  })

  it('reviews and applies it: one step, labelled with the file that is written', async () => {
    await writeFile(join(dir, 'staging.yaml'), 'old: true\n')
    wire()
    const local = new HttpLocalServer()
    const values = answersFor('prod')
    const review = await prepareReview({ environment: 'prod', values, publicValues: values, sources: { local }, bindings, scanned })
    const steps = buildSteps({ plan: review.plan, files: review.files, publicValues: values, local })
    expect(steps.map((step) => step.label)).toEqual(['Write environments/prod.yaml'])

    const states: string[] = []
    await runSteps(steps, (id, state) => states.push(`${id}:${state.status}`))
    expect(states).toEqual(['files:running', 'files:done'])
    expect((await readdir(dir)).sort()).toEqual(['prod.yaml', 'staging.yaml'])

    // applying again has nothing left to write
    const again = await prepareReview({ environment: 'prod', values, publicValues: values, sources: { local }, bindings, scanned })
    expect(buildSteps({ plan: again.plan, files: again.files, publicValues: values, local })).toEqual([])
  })
})

