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
// A small stand-in for the parts of the GitHub REST API that GitHubClient uses, so the real
// client code can be tested, and run in the browser, without a token or a network.
// Same JSON shapes and status codes, `per_page` / `page` paging with a Link header, and it keeps
// what was written. Secrets are decrypted with a real key pair, like GitHub's own, so a test can
// check that the value that arrives is the value that was sent.
import sodium from 'libsodium-wrappers'

await sodium.ready

interface FakeScope {
  variables: Record<string, string>
  secretNames: string[]
}

interface FakeRepo {
  permissions: { admin: boolean; push: boolean; pull: boolean }
  repository: FakeScope
  environments: Record<string, FakeScope>
  // Filled in by the fake: decrypted secrets that were written, by "<scope>:<name>",
  // where scope is "repository" or "environment/<environment>".
  writtenSecrets?: Record<string, string>
}

interface FakeToken {
  login: string
  // Classic tokens list their scopes; null means a fine-grained token (no scopes header).
  scopes: string[] | null
}

export interface FakeGitHubState {
  tokens: Record<string, FakeToken>
  repos: Record<string, FakeRepo>
}

interface FakeResponse {
  status: number
  headers: Record<string, string>
  body: unknown
}

interface FakeRequest {
  method?: string
  path: string
  query: URLSearchParams
  authorization: string | undefined
  body?: any
}

interface FakeGitHub {
  state: FakeGitHubState
  // Every request handled, for assertions.
  log: { method: string; path: string; authorization: string | undefined; body: unknown }[]
  handle(request: FakeRequest, baseUrl: string): FakeResponse
  fetch: typeof fetch
}

const empty = (status: number, body: unknown = {}): FakeResponse => ({ status, headers: {}, body })

export function createFakeGitHub(state: FakeGitHubState, baseUrl = 'https://api.github.test'): FakeGitHub {
  const log: FakeGitHub['log'] = []
  const keys = new Map<string, { id: string; publicKey: Uint8Array; privateKey: Uint8Array }>()

  const keyFor = (scopeKey: string) => {
    let pair = keys.get(scopeKey)
    if (!pair) {
      const generated = sodium.crypto_box_keypair()
      pair = { id: `key-${keys.size + 1}`, publicKey: generated.publicKey, privateKey: generated.privateKey }
      keys.set(scopeKey, pair)
    }
    return pair
  }

  const page = (items: unknown[], key: string, query: URLSearchParams, path: string, base: string): FakeResponse => {
    const size = Number(query.get('per_page') ?? 30)
    const number = Number(query.get('page') ?? 1)
    const slice = items.slice((number - 1) * size, number * size)
    const headers: Record<string, string> = {}
    if (number * size < items.length) {
      headers.link = `<${base}${path}?per_page=${size}&page=${number + 1}>; rel="next"`
    }
    return { status: 200, headers, body: { total_count: items.length, [key]: slice } }
  }

  const handle = (request: FakeRequest, base: string): FakeResponse => {
    const method = request.method ?? 'GET'
    log.push({ method, path: request.path, authorization: request.authorization, body: request.body })
    const token = request.authorization?.replace(/^Bearer /, '')
    const known = token ? state.tokens[token] : undefined
    if (!known) return empty(401, { message: 'Bad credentials' })

    if (request.path === '/user') {
      return {
        status: 200,
        headers: known.scopes === null ? {} : { 'x-oauth-scopes': known.scopes.join(', ') },
        body: { login: known.login }
      }
    }

    const match = request.path.match(/^\/repos\/([^/]+)\/([^/]+)(\/.*)?$/)
    const repoKey = match ? `${decodeURIComponent(match[1]!)}/${decodeURIComponent(match[2]!)}` : undefined
    const repo = repoKey ? state.repos[repoKey] : undefined
    if (!match || !repo || !repoKey) return empty(404, { message: 'Not Found' })
    const rest = match[3] ?? ''
    const writing = method !== 'GET'

    if (rest === '' && method === 'GET') return empty(200, { permissions: repo.permissions })
    if (rest === '/environments' && method === 'GET') {
      return page(Object.keys(repo.environments).map((name) => ({ name })), 'environments', request.query, request.path, base)
    }

    // PUT /environments/{name}: create or update an environment (needs admin).
    const environment = rest.match(/^\/environments\/([^/]+)$/)
    if (environment && method === 'PUT') {
      if (!repo.permissions.admin) return empty(403, { message: 'Must have admin rights to Repository.' })
      const name = decodeURIComponent(environment[1]!)
      const existed = name in repo.environments
      repo.environments[name] ??= { variables: {}, secretNames: [] }
      return empty(existed ? 200 : 201, { name })
    }

    // variables and secrets of the repository (/actions/...) or of an environment (/environments/{e}/...)
    const scoped = rest.match(/^(?:\/actions|\/environments\/([^/]+))\/(variables|secrets)(?:\/([^/]+))?$/)
    if (!scoped) return empty(404, { message: 'Not Found' })
    const env = scoped[1] ? decodeURIComponent(scoped[1]) : undefined
    const section = scoped[2]!
    const name = scoped[3] ? decodeURIComponent(scoped[3]) : undefined
    const scope = env === undefined ? repo.repository : repo.environments[env]
    if (!scope) return empty(404, { message: 'Not Found' })
    if (writing && !repo.permissions.push) return empty(403, { message: 'Resource not accessible' })
    const scopeKey = env === undefined ? 'repository' : `environment/${env}`

    if (section === 'variables') {
      if (method === 'GET' && !name) {
        return page(Object.entries(scope.variables).map(([n, value]) => ({ name: n, value })), 'variables', request.query, request.path, base)
      }
      if (method === 'POST' && !name) {
        const { name: variable, value } = request.body ?? {}
        if (typeof variable !== 'string' || typeof value !== 'string' || value === '') return empty(422, { message: 'Validation Failed' })
        if (variable in scope.variables) return empty(409, { message: 'Already exists - variable name' })
        scope.variables[variable] = value
        return empty(201)
      }
      if (method === 'PATCH' && name) {
        if (!(name in scope.variables)) return empty(404, { message: 'Not Found' })
        const value = request.body?.value
        if (typeof value !== 'string' || value === '') return empty(422, { message: 'Validation Failed' })
        scope.variables[name] = value
        return empty(204)
      }
      return empty(404, { message: 'Not Found' })
    }

    // secrets
    if (method === 'GET' && !name) {
      return page(
        // Like GitHub, a secret is listed by name and dates only; there is no value to return.
        scope.secretNames.map((n) => ({ name: n, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' })),
        'secrets',
        request.query,
        request.path,
        base
      )
    }
    if (method === 'GET' && name === 'public-key') {
      const pair = keyFor(`${repoKey}|${scopeKey}`)
      return empty(200, { key_id: pair.id, key: sodium.to_base64(pair.publicKey, sodium.base64_variants.ORIGINAL) })
    }
    if (method === 'PUT' && name) {
      const pair = keyFor(`${repoKey}|${scopeKey}`)
      const { encrypted_value: encrypted, key_id: keyId } = request.body ?? {}
      if (keyId !== pair.id || typeof encrypted !== 'string') return empty(422, { message: 'Validation Failed: key_id' })
      let plain: string
      try {
        plain = sodium.to_string(
          sodium.crypto_box_seal_open(sodium.from_base64(encrypted, sodium.base64_variants.ORIGINAL), pair.publicKey, pair.privateKey)
        )
      } catch {
        return empty(422, { message: 'Validation Failed: could not decrypt' })
      }
      const created = !scope.secretNames.includes(name)
      if (created) scope.secretNames.push(name)
      ;(repo.writtenSecrets ??= {})[`${scopeKey}:${name}`] = plain
      return empty(created ? 201 : 204)
    }
    return empty(404, { message: 'Not Found' })
  }

  const fakeFetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    const headers = new Headers(init?.headers)
    const body = typeof init?.body === 'string' && init.body ? JSON.parse(init.body) : undefined
    const result = handle(
      {
        method: init?.method ?? 'GET',
        path: url.pathname,
        query: url.searchParams,
        authorization: headers.get('authorization') ?? undefined,
        body
      },
      baseUrl
    )
    // 204 and similar answers carry no body.
    const hasBody = result.status !== 204
    return new Response(hasBody ? JSON.stringify(result.body) : null, {
      status: result.status,
      headers: { 'content-type': 'application/json', ...result.headers }
    })
  }) as typeof fetch

  return { state, log, handle, fetch: fakeFetch }
}
