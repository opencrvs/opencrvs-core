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
import type { ConnectionPort, ConnectionResult, ConnectionSettings } from './connection'
import type { GitHubPort, GitHubStatus, ScopeState, WriteTarget } from './port'

// The page never calls GitHub itself. It asks the local dev server (server/plugin.ts), which
// keeps the token in memory and talks to GitHub. The token is sent once, when connecting.
async function call<T>(path: string, init?: { method: 'POST'; body?: unknown }): Promise<T> {
  const response = await fetch(path, {
    method: init?.method ?? 'GET',
    headers: { Accept: 'application/json', ...(init ? { 'Content-Type': 'application/json' } : {}) },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body)
  })
  const body = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok) throw new Error(body.error ?? `The local server answered ${response.status}.`)
  return body as T
}

export class HttpGitHub implements GitHubPort {
  status() {
    return call<GitHubStatus>('/api/github/status')
  }

  async listEnvironments() {
    return (await call<{ names: string[] }>('/api/github/environments')).names
  }

  readRepository() {
    return call<ScopeState>('/api/github/repository')
  }

  readEnvironment(name: string) {
    return call<ScopeState>(`/api/github/environments/${encodeURIComponent(name)}`)
  }

  async createEnvironment(name: string) {
    await call('/api/github/environment', { method: 'POST', body: { name } })
  }

  async putVariable(target: WriteTarget, exists?: boolean) {
    await call('/api/github/variable', { method: 'POST', body: { ...target, exists } })
  }

  async putSecret(target: WriteTarget) {
    await call('/api/github/secret', { method: 'POST', body: target })
  }

  // Makes the dev server forget the token.
  async disconnect() {
    await call('/api/github/disconnect', { method: 'POST' }).catch(() => undefined)
  }
}

export class HttpConnection implements ConnectionPort {
  async connect(settings: ConnectionSettings): Promise<ConnectionResult> {
    try {
      return await call<ConnectionResult>('/api/github/connect', { method: 'POST', body: settings })
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'The local dev server is not reachable.' }
    }
  }
}
