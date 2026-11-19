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
import { fileURLToPath } from 'node:url'
import { renderEnvironmentFiles } from '../../server/files'
import { bindings } from '../bindings/load'
import type { EnvironmentList, LocalServerPort, RenderedFile, Repository, SshKeyPair } from './port'

const templates = fileURLToPath(new URL('../../templates/', import.meta.url))

// In-memory stand-in for the dev server, used by tests (it renders with the real templates).
export class MockLocalServer implements LocalServerPort {
  repository: Repository | null
  environments: Record<string, Record<string, string>>
  layout: EnvironmentList['layout']
  // How many key pairs were asked for; each one is different, so a test can tell a replaced pair from a kept one.
  keyPairs = 0

  constructor(
    environments: Record<string, Record<string, string>> = {},
    repository: Repository | null = { owner: 'acme', repo: 'infrastructure' },
    layout: EnvironmentList['layout'] = 'folders'
  ) {
    this.environments = environments
    this.repository = repository
    this.layout = layout
  }

  async getRepository() {
    return this.repository
  }

  async listEnvironments() {
    const names = Object.keys(this.environments).sort()
    return { names, layout: names.length ? this.layout : ('none' as const) }
  }

  async readEnvironmentFiles(name: string) {
    return this.environments[name] ?? {}
  }

  async generateSshKeyPair(): Promise<SshKeyPair> {
    const n = ++this.keyPairs
    return {
      privateKey: `-----BEGIN OPENSSH PRIVATE KEY-----\nmock-private-key-${n}\n-----END OPENSSH PRIVATE KEY-----\n`,
      publicKey: `ssh-ed25519 mock-public-key-${n}`
    }
  }

  private render(name: string, values: Record<string, unknown>) {
    return renderEnvironmentFiles({
      environment: name,
      values,
      bindings,
      readTemplate: (path) => readFileSync(templates + path, 'utf8')
    })
  }

  // Where a rendered file goes in this mock's layout (same rule as the dev server's fileTargets).
  private target(name: string, path: string): string | null {
    if (this.layout !== 'files') return `${name}/${path}`
    return path === bindings.flat ? `${name}.yaml` : null
  }

  async renderFiles(name: string, values: Record<string, unknown>): Promise<RenderedFile[]> {
    const existing = this.environments[name] ?? {}
    return Object.entries(this.render(name, values)).map(([path, text]) => {
      const target = this.target(name, path)
      return { path, text, existing: target === null ? null : (existing[path] ?? null), target }
    })
  }

  async writeFiles(name: string, values: Record<string, unknown>) {
    const written: string[] = []
    for (const [path, text] of Object.entries(this.render(name, values))) {
      const target = this.target(name, path)
      if (target === null) continue
      this.environments[name] = { ...(this.environments[name] ?? {}), [path]: text }
      written.push(target)
    }
    return written
  }
}
