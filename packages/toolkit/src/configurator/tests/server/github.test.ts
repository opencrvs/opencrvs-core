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
import { createFakeGitHub, type FakeGitHubState } from '../../server/fakeGitHub'
import { GitHubClient } from '../../server/github'

const SECRET = 'ghp_super_secret_token_value'
const scope = (variables: Record<string, string> = {}, secretNames: string[] = []) => ({ variables, secretNames })

function state(overrides: Partial<FakeGitHubState> = {}): FakeGitHubState {
  return {
    tokens: {
      [SECRET]: { login: 'octocat', scopes: ['repo', 'workflow'] },
      classic_no_workflow: { login: 'octocat', scopes: ['repo'] },
      classic_no_repo: { login: 'octocat', scopes: ['public_repo'] },
      fine_grained: { login: 'octocat', scopes: null }
    },
    repos: {
      'acme/infra': {
        permissions: { admin: true, push: true, pull: true },
        repository: scope({ REGISTRY_HOST: 'ghcr.io' }, ['REGISTRY_TOKEN']),
        environments: {
          qa: scope({ DOMAIN: 'qa.example.org' }, ['SMTP_HOST', 'ENCRYPTION_KEY']),
          staging: scope()
        }
      },
      'acme/readonly': {
        permissions: { admin: false, push: false, pull: true },
        repository: scope(),
        environments: {}
      }
    },
    ...overrides
  }
}

function client(token = SECRET, repo = 'acme/infra', fake = createFakeGitHub(state())) {
  const [owner, name] = repo.split('/') as [string, string]
  return { fake, github: new GitHubClient({ token, owner, repo: name, baseUrl: 'https://api.github.test', fetch: fake.fetch }) }
}

describe('connect', () => {
  it('accepts a classic token with repo and workflow scopes on a repository it administers', async () => {
    expect(await client().github.connect()).toEqual({ ok: true, login: 'octocat', missingPermissions: [] })
  })

  it('says what a classic token lacks', async () => {
    const noWorkflow = await client('classic_no_workflow').github.connect()
    expect(noWorkflow).toMatchObject({ ok: true })
    expect((noWorkflow as { missingPermissions: string[] }).missingPermissions).toEqual([expect.stringContaining('"workflow"')])

    const noRepo = await client('classic_no_repo').github.connect()
    expect((noRepo as { missingPermissions: string[] }).missingPermissions[0]).toContain('"repo"')
  })

  it('cannot see the scopes of a fine-grained token, so it only checks repository access', async () => {
    expect(await client('fine_grained').github.connect()).toEqual({ ok: true, login: 'octocat', missingPermissions: [] })
  })

  it('warns when the token has no admin access to the repository', async () => {
    const result = await client(SECRET, 'acme/readonly').github.connect()
    expect(result).toMatchObject({ ok: true, missingPermissions: [expect.stringContaining('admin access')] })
  })

  it('rejects a bad token, an unknown repository, and an unreachable GitHub', async () => {
    expect(await client('nope').github.connect()).toEqual({ ok: false, error: 'GitHub rejected the token (bad credentials).' })
    expect(await client(SECRET, 'acme/missing').github.connect()).toMatchObject({ ok: false, error: expect.stringContaining('acme/missing') })

    const offline = new GitHubClient({ token: SECRET, owner: 'a', repo: 'b', fetch: (async () => Promise.reject(new Error(`connect ECONNREFUSED ${SECRET}`))) as typeof fetch })
    expect(await offline.connect()).toEqual({ ok: false, error: 'Could not reach GitHub.' })
  })

  it('never puts the token in an error message', async () => {
    for (const result of [await client('nope').github.connect(), await client(SECRET, 'acme/missing').github.connect()]) {
      expect(JSON.stringify(result)).not.toContain(SECRET)
    }
  })
})

describe('reading', () => {
  it('lists environments', async () => {
    expect(await client().github.listEnvironments()).toEqual(['qa', 'staging'])
  })

  it('reads variables with their values and secrets by name only', async () => {
    const { github } = client()
    expect(await github.readRepository()).toEqual({ variables: { REGISTRY_HOST: 'ghcr.io' }, secretNames: ['REGISTRY_TOKEN'] })
    expect(await github.readEnvironment('qa')).toEqual({
      variables: { DOMAIN: 'qa.example.org' },
      secretNames: ['SMTP_HOST', 'ENCRYPTION_KEY']
    })
  })

  it('treats an environment that does not exist as empty', async () => {
    expect(await client().github.readEnvironment('nope')).toEqual({ variables: {}, secretNames: [] })
  })

  it('reads every page, not just the first', async () => {
    const many = Object.fromEntries(Array.from({ length: 250 }, (_, index) => [`env-${index}`, scope()]))
    const big = state()
    big.repos['acme/infra']!.environments = many
    big.repos['acme/infra']!.repository = scope(
      Object.fromEntries(Array.from({ length: 130 }, (_, index) => [`VAR_${index}`, String(index)])),
      Array.from({ length: 101 }, (_, index) => `SECRET_${index}`)
    )
    const { github, fake } = client(SECRET, 'acme/infra', createFakeGitHub(big))
    expect(await github.listEnvironments()).toHaveLength(250)
    const repository = await github.readRepository()
    expect(Object.keys(repository.variables)).toHaveLength(130)
    expect(repository.secretNames).toHaveLength(101)
    expect(fake.log.filter((entry) => entry.path.endsWith('/environments'))).toHaveLength(3) // 100 + 100 + 50
  })

  it('encodes environment names in the path', async () => {
    const spaced = state()
    spaced.repos['acme/infra']!.environments['my env'] = scope({ A: '1' })
    const { github, fake } = client(SECRET, 'acme/infra', createFakeGitHub(spaced))
    expect((await github.readEnvironment('my env')).variables).toEqual({ A: '1' })
    expect(fake.log.some((entry) => entry.path.includes('/environments/my%20env/variables'))).toBe(true)
  })

  it('reports a rate limit, a forbidden answer and a server error in plain words', async () => {
    const answer = (status: number, headers: Record<string, string> = {}) =>
      new GitHubClient({
        token: SECRET,
        owner: 'a',
        repo: 'b',
        fetch: (async () => new Response('{"message":"details with ' + SECRET + '"}', { status, headers })) as typeof fetch
      }).listEnvironments()
    await expect(answer(403, { 'x-ratelimit-remaining': '0' })).rejects.toThrow('rate limit')
    await expect(answer(403)).rejects.toThrow('not allowed')
    await expect(answer(500)).rejects.toThrow('HTTP 500')
    await expect(answer(500)).rejects.not.toThrow(SECRET)
  })
})

describe('what is sent to GitHub', () => {
  it('sends the token as a bearer header and never in a URL', async () => {
    const { github, fake } = client()
    await github.readRepository()
    await github.listEnvironments()
    expect(fake.log.length).toBeGreaterThan(0)
    for (const entry of fake.log) {
      expect(entry.authorization).toBe(`Bearer ${SECRET}`)
      expect(entry.path).not.toContain(SECRET)
    }
  })

  it('does not follow a next-page link to another host', async () => {
    const calls: string[] = []
    const evil = (async (input: string | URL | Request) => {
      calls.push(String(input))
      return new Response(JSON.stringify({ environments: [{ name: 'qa' }] }), {
        status: 200,
        headers: { link: '<https://evil.example/steal?page=2>; rel="next"' }
      })
    }) as typeof fetch
    const github = new GitHubClient({ token: SECRET, owner: 'a', repo: 'b', baseUrl: 'https://api.github.test', fetch: evil })
    expect(await github.listEnvironments()).toEqual(['qa'])
    expect(calls).toHaveLength(1)
    expect(calls.every((call) => call.startsWith('https://api.github.test'))).toBe(true)
  })
})
