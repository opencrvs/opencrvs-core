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
import type { EnvironmentList, LocalServerPort, RenderedFile, Repository, SshKeyPair } from './port'

async function get<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`)
  return response.json() as Promise<T>
}

async function send<T>(method: 'POST' | 'PUT', path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const answer = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok) throw new Error(answer.error ?? `${path} failed with ${response.status}`)
  return answer as T
}

export class HttpLocalServer implements LocalServerPort {
  async getRepository() {
    return (await get<{ repository: Repository | null }>('/api/context')).repository
  }

  listEnvironments() {
    return get<EnvironmentList>('/api/environments')
  }

  async renderFiles(name: string, values: Record<string, unknown>) {
    return (await send<{ files: RenderedFile[] }>('POST', `/api/environments/${encodeURIComponent(name)}/render`, { values })).files
  }

  async writeFiles(name: string, values: Record<string, unknown>) {
    return (await send<{ written: string[] }>('PUT', `/api/environments/${encodeURIComponent(name)}/files`, { values })).written
  }

  generateSshKeyPair() {
    return send<SshKeyPair>('POST', '/api/ssh-keypair', {})
  }

  async readEnvironmentFiles(name: string) {
    return (await get<{ files: Record<string, string> }>(`/api/environments/${encodeURIComponent(name)}`)).files
  }
}
