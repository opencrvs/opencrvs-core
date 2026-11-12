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
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createFakeGitHub } from '../../server/fakeGitHub'
import { GitHubSession, handleApiRequest, type ApiRequest } from '../../server/plugin'

const SECRET = 'ghp_super_secret_token_value'

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'env-init-'))
})
afterEach(() => rm(dir, { recursive: true, force: true }))

function setup() {
  const fake = createFakeGitHub({
    tokens: { [SECRET]: { login: 'octocat', scopes: ['repo', 'workflow'] } },
    repos: {
      'acme/infra': {
        permissions: { admin: true, push: true, pull: true },
        repository: { variables: { REGISTRY_HOST: 'ghcr.io' }, secretNames: ['REGISTRY_TOKEN'] },
        environments: { qa: { variables: { DOMAIN: 'qa.example.org' }, secretNames: ['SMTP_HOST'] } }
      }
    }
  })
  const options = { environmentsDir: dir, projectDir: dir, github: new GitHubSession({ baseUrl: 'https://api.github.test', fetch: fake.fetch }) }
  const call = (path: string, request: ApiRequest = {}) => handleApiRequest(path, options, request)
  const connect = (token = SECRET, repo = 'infra') =>
    call('/api/github/connect', { method: 'POST', body: { token, owner: 'acme', repo } })
  return { fake, options, call, connect }
}

describe('connecting', () => {
  it('connects, remembers it, and answers without the token', async () => {
    const { call, connect } = setup()
    expect(await call('/api/github/status')).toEqual({ status: 200, body: { connected: false } })

    const result = await connect()
    expect(result).toEqual({ status: 200, body: { ok: true, login: 'octocat', missingPermissions: [] } })
    expect(JSON.stringify(result)).not.toContain(SECRET)

    const status = await call('/api/github/status')
    expect(status?.body).toEqual({ connected: true, owner: 'acme', repo: 'infra' })
    expect(JSON.stringify(status)).not.toContain(SECRET)
  })

  it('stays disconnected after a rejected token, and drops an earlier connection', async () => {
    const { call, connect } = setup()
    expect((await connect('wrong'))?.body).toEqual({ ok: false, error: 'GitHub rejected the token (bad credentials).' })
    expect((await call('/api/github/status'))?.body).toEqual({ connected: false })

    await connect()
    await connect('wrong')
    expect((await call('/api/github/status'))?.body).toEqual({ connected: false })
  })

  it('refuses incomplete or odd input before contacting GitHub', async () => {
    const { call, fake } = setup()
    const post = (body: unknown) => call('/api/github/connect', { method: 'POST', body })
    expect((await post({ owner: 'acme', repo: 'infra' }))?.status).toBe(400)
    expect((await post({ token: '  ', owner: 'acme', repo: 'infra' }))?.status).toBe(400)
    expect((await post({ token: SECRET, owner: 'acme/../x', repo: 'infra' }))?.status).toBe(400)
    expect((await post({ token: SECRET, owner: 'acme', repo: '' }))?.status).toBe(400)
    expect((await post(undefined))?.status).toBe(400)
    expect(fake.log).toEqual([])
  })

  it('disconnects', async () => {
    const { call, connect } = setup()
    await connect()
    await call('/api/github/disconnect', { method: 'POST' })
    expect((await call('/api/github/status'))?.body).toEqual({ connected: false })
    expect((await call('/api/github/environments'))?.status).toBe(409)
  })
})

describe('reading through the session', () => {
  it('returns environments, repository and environment state', async () => {
    const { call, connect } = setup()
    await connect()
    expect((await call('/api/github/environments'))?.body).toEqual({ names: ['qa'] })
    expect((await call('/api/github/repository'))?.body).toEqual({ variables: { REGISTRY_HOST: 'ghcr.io' }, secretNames: ['REGISTRY_TOKEN'] })
    expect((await call('/api/github/environments/qa'))?.body).toEqual({ variables: { DOMAIN: 'qa.example.org' }, secretNames: ['SMTP_HOST'] })
  })

  it('says so when it is not connected', async () => {
    const { call } = setup()
    for (const path of ['/api/github/environments', '/api/github/repository', '/api/github/environments/qa']) {
      expect((await call(path))?.status).toBe(409)
    }
  })

  describe('when GitHub fails after connecting', () => {
    async function connectedThenBroken(mode: 'down' | 'revoked') {
      const { fake, options } = setup()
      let broken = false
      const flaky = (async (...args: Parameters<typeof fetch>) => {
        if (!broken) return fake.fetch(...args)
        if (mode === 'down') throw new Error(`socket hang up while sending ${SECRET}`)
        return new Response('{}', { status: 401 })
      }) as typeof fetch
      const github = new GitHubSession({ baseUrl: 'https://api.github.test', fetch: flaky })
      await github.connect(SECRET, 'acme', 'infra')
      broken = true
      return handleApiRequest('/api/github/environments', { ...options, github })
    }

    it('answers 502 when GitHub cannot be reached, without the token', async () => {
      const result = await connectedThenBroken('down')
      expect(result).toEqual({ status: 502, body: { error: 'Could not reach GitHub.' } })
      expect(JSON.stringify(result)).not.toContain(SECRET)
    })

    it('answers 401 when the token has been revoked', async () => {
      const result = await connectedThenBroken('revoked')
      expect(result?.status).toBe(401)
      expect(JSON.stringify(result)).not.toContain(SECRET)
    })
  })
})

describe('requests from other sites', () => {
  it.each(['evil.example', 'evil.example:5173', 'localhost.evil.example', '10.0.0.5:4173'])('refuses Host %s', async (host) => {
    const { call } = setup()
    expect((await call('/api/github/status', { host }))?.status).toBe(403)
    expect((await call('/api/environments', { host }))?.status).toBe(403)
  })

  it.each(['localhost:5173', 'localhost', '127.0.0.1:4173', '[::1]:4173'])('accepts Host %s', async (host) => {
    const { call } = setup()
    expect((await call('/api/github/status', { host }))?.status).toBe(200)
  })

  it('refuses another origin, for reads and for connecting', async () => {
    const { call, fake } = setup()
    const origin = 'https://evil.example'
    expect((await call('/api/github/status', { host: 'localhost:5173', origin }))?.status).toBe(403)
    const attempt = await call('/api/github/connect', {
      method: 'POST',
      host: 'localhost:5173',
      origin,
      body: { token: SECRET, owner: 'acme', repo: 'infra' }
    })
    expect(attempt?.status).toBe(403)
    expect(fake.log).toEqual([]) // GitHub was never contacted
  })

  it('accepts its own origin', async () => {
    const { call } = setup()
    const own = { host: 'localhost:5173', origin: 'http://localhost:5173' }
    expect((await call('/api/github/status', own))?.status).toBe(200)
    expect((await call('/api/github/connect', { ...own, method: 'POST', body: { token: SECRET, owner: 'acme', repo: 'infra' } }))?.status).toBe(200)
  })
})
