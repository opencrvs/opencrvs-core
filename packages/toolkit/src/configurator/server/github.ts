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
// GitHub REST client used by the dev server. The page never talks to GitHub: it asks the dev
// server, which holds the token in memory and makes these calls. It reads environments, variables
// and secret names, and writes environments, variables and (encrypted) secrets.

interface ScopeState {
  variables: Record<string, string>
  secretNames: string[]
}

export type ConnectResult =
  | { ok: true; login: string; missingPermissions: string[] }
  | { ok: false; error: string }

export interface WriteTarget {
  scope: 'environment' | 'repository'
  // Required when the scope is 'environment'.
  environment?: string
  name: string
  value: string
}

export class GitHubError extends Error {
  status: number | undefined
  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

interface GitHubOptions {
  token: string
  owner: string
  repo: string
  // Overridable so tests and the fake GitHub can stand in for https://api.github.com
  baseUrl?: string
  fetch?: typeof fetch
}

import { sealSecret } from './seal.ts'

const API_VERSION = '2022-11-28'
const PER_PAGE = 100

export class GitHubClient {
  readonly owner: string
  readonly repo: string
  private readonly token: string
  private readonly baseUrl: URL
  private readonly fetchImpl: typeof fetch

  constructor(options: GitHubOptions) {
    this.owner = options.owner
    this.repo = options.repo
    this.token = options.token
    this.baseUrl = new URL(options.baseUrl ?? 'https://api.github.com')
    this.fetchImpl = options.fetch ?? fetch
  }

  private repoPath(suffix = '') {
    return `/repos/${encodeURIComponent(this.owner)}/${encodeURIComponent(this.repo)}${suffix}`
  }

  // Messages never contain the token, a value that was sent, or anything GitHub sent back.
  private async request(method: string, url: URL, body?: unknown): Promise<Response> {
    let response: Response
    try {
      response = await this.fetchImpl(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': API_VERSION,
          'User-Agent': 'env-init-ui',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' })
        },
        body: body === undefined ? undefined : JSON.stringify(body)
      })
    } catch {
      throw new GitHubError('Could not reach GitHub.')
    }
    if (response.ok) return response
    if (response.status === 401) throw new GitHubError('GitHub rejected the token (bad credentials).', 401)
    if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
      throw new GitHubError('GitHub rate limit reached. Try again later.', 403)
    }
    if (response.status === 403) {
      throw new GitHubError(
        method === 'GET'
          ? 'The token is not allowed to read this (HTTP 403).'
          : 'The token is not allowed to change this (HTTP 403). Writing needs access to the repository, and creating environments needs admin access.',
        403
      )
    }
    if (response.status === 404) {
      throw new GitHubError(`Not found: ${this.owner}/${this.repo}, or the token cannot see it.`, 404)
    }
    if (response.status === 409) throw new GitHubError('GitHub reports a conflict (HTTP 409).', 409)
    if (response.status === 422) throw new GitHubError('GitHub refused the request (HTTP 422).', 422)
    throw new GitHubError(`GitHub answered with HTTP ${response.status}.`, response.status)
  }

  private get(url: URL): Promise<Response> {
    return this.request('GET', url)
  }

  private url(path: string) {
    return new URL(path, this.baseUrl)
  }

  // Follows rel="next" links, but only ones on the same host: the token must never be sent elsewhere.
  private async paginate<T>(path: string, pick: (body: any) => T[]): Promise<T[]> {
    const items: T[] = []
    let next: URL | undefined = this.url(path)
    next.searchParams.set('per_page', String(PER_PAGE))
    for (let page = 0; next && page < 100; page++) {
      const response: Response = await this.get(next)
      items.push(...pick(await response.json()))
      const link: string = response.headers.get('link') ?? ''
      const target: string | undefined = link.match(/<([^>]+)>;\s*rel="next"/)?.[1]
      const candidate: URL | undefined = target ? new URL(target, this.baseUrl) : undefined
      next = candidate && candidate.origin === this.baseUrl.origin ? candidate : undefined
    }
    return items
  }

  // Checks the token and what it can do. Classic tokens report their scopes in a header;
  // fine-grained tokens do not, so for those only the repository permissions can be checked.
  async connect(): Promise<ConnectResult> {
    try {
      const user = await this.get(this.url('/user'))
      const scopesHeader = user.headers.get('x-oauth-scopes')
      const login = String(((await user.json()) as { login?: string }).login ?? this.owner)

      const repository = await this.get(this.url(this.repoPath()))
      const permissions = ((await repository.json()) as { permissions?: Record<string, boolean> }).permissions ?? {}

      const missing: string[] = []
      if (scopesHeader !== null) {
        const scopes = scopesHeader.split(',').map((scope) => scope.trim())
        if (!scopes.includes('repo')) missing.push('manage environments, secrets and variables or trigger workflows (classic token scope "repo")')
        if (!scopes.includes('workflow')) missing.push('update workflow files (classic token scope "workflow")')
      }
      if (!permissions.admin) missing.push('create environments (needs admin access to the repository)')
      return { ok: true, login, missingPermissions: missing }
    } catch (error) {
      return { ok: false, error: error instanceof GitHubError ? error.message : 'Could not reach GitHub.' }
    }
  }

  async listEnvironments(): Promise<string[]> {
    const environments = await this.paginate<{ name: string }>(this.repoPath('/environments'), (body) => body.environments ?? [])
    return environments.map((environment) => environment.name)
  }

  private async readScope(base: string): Promise<ScopeState> {
    const [variables, secrets] = await Promise.all([
      this.paginate<{ name: string; value: string }>(`${base}/variables`, (body) => body.variables ?? []),
      this.paginate<{ name: string }>(`${base}/secrets`, (body) => body.secrets ?? [])
    ])
    return {
      variables: Object.fromEntries(variables.map((variable) => [variable.name, variable.value])),
      // GitHub returns names (and dates) for secrets, never values.
      secretNames: secrets.map((secret) => secret.name)
    }
  }

  readRepository(): Promise<ScopeState> {
    return this.readScope(this.repoPath('/actions'))
  }

  async readEnvironment(name: string): Promise<ScopeState> {
    try {
      return await this.readScope(this.repoPath(`/environments/${encodeURIComponent(name)}`))
    } catch (error) {
      // An environment that does not exist simply has nothing in it.
      if (error instanceof GitHubError && error.status === 404) return { variables: {}, secretNames: [] }
      throw error
    }
  }

  // --- writing ---------------------------------------------------------------------------

  private scopeBase(target: WriteTarget) {
    return target.scope === 'environment'
      ? this.repoPath(`/environments/${encodeURIComponent(target.environment ?? '')}`)
      : this.repoPath('/actions')
  }

  // Creates the environment, or leaves it as it is if it exists.
  async createEnvironment(name: string): Promise<void> {
    await this.request('PUT', this.url(this.repoPath(`/environments/${encodeURIComponent(name)}`)), {})
  }

  // A 404 on an environment's variables or secrets means the environment is missing,
  // not that the repository is: say so.
  private async inEnvironment(target: WriteTarget, action: () => Promise<void>): Promise<void> {
    try {
      await action()
    } catch (error) {
      if (error instanceof GitHubError && error.status === 404 && target.scope === 'environment') {
        throw new GitHubError(`The environment “${target.environment}” does not exist yet.`, 404)
      }
      throw error
    }
  }

  putVariable(target: WriteTarget, exists?: boolean): Promise<void> {
    return this.inEnvironment(target, () => this.putVariableUnchecked(target, exists))
  }

  putSecret(target: WriteTarget): Promise<void> {
    return this.inEnvironment(target, () => this.putSecretUnchecked(target))
  }

  // `exists` is what the plan found out; if it was wrong, the other call is tried.
  private async putVariableUnchecked(target: WriteTarget, exists?: boolean): Promise<void> {
    const base = `${this.scopeBase(target)}/variables`
    const create = () => this.request('POST', this.url(base), { name: target.name, value: target.value })
    const update = () =>
      this.request('PATCH', this.url(`${base}/${encodeURIComponent(target.name)}`), { name: target.name, value: target.value })
    try {
      await (exists ? update() : create())
    } catch (error) {
      if (!(error instanceof GitHubError)) throw error
      if (!exists && error.status === 409) await update()
      else if (exists && error.status === 404) await create()
      else throw error
    }
  }

  private async putSecretUnchecked(target: WriteTarget): Promise<void> {
    const base = `${this.scopeBase(target)}/secrets`
    const key = (await (await this.get(this.url(`${base}/public-key`))).json()) as { key_id: string; key: string }
    const encrypted = await sealSecret(key.key, target.value)
    await this.request('PUT', this.url(`${base}/${encodeURIComponent(target.name)}`), {
      encrypted_value: encrypted,
      key_id: key.key_id
    })
  }
}
