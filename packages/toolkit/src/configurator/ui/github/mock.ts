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
import type { GitHubPort, GitHubStatus, ScopeState, WriteTarget } from './port'

export type Scenario = 'existing' | 'fresh' | 'registry-present' | 'name-taken'

export const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: 'existing', label: 'Environments qa, staging and production exist' },
  { id: 'fresh', label: 'Fresh repository' },
  { id: 'registry-present', label: 'Registry secrets already exist' },
  { id: 'name-taken', label: 'Environment names staging and production taken' }
]

const REGISTRY_SECRETS = [
  'REGISTRY_ORGANISATION',
  'REGISTRY_REPOSITORY',
  'REGISTRY_USERNAME',
  'REGISTRY_TOKEN'
]

const EMAIL_SECRETS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USERNAME',
  'SMTP_PASSWORD',
  'SMTP_SECURE',
  'SENDER_EMAIL_ADDRESS',
  'ALERT_EMAIL'
]

const GENERATED_SECRETS = [
  'ENCRYPTION_KEY',
  'POSTGRES_PASSWORD',
  'KIBANA_PASSWORD',
  'S3_ADMIN_SECRET_KEY',
  'OPENCRVS_METABASE_ADMIN_PASSWORD'
]

// What the CLI stores when it sets backup up (see src/plan/backupSecrets.ts); the form has no question for these.
const BACKUP_SECRETS = ['BACKUP_HOST_PRIVATE_KEY', 'BACKUP_HOST_PUBLIC_KEY', 'BACKUP_ENCRYPTION_PASSPHRASE']

// A function, not a shared object: the mock's state is cloned and written to, and scopes must not share data.
const nothing = (): ScopeState => ({ variables: {}, secretNames: [] })

interface MockState {
  repository: ScopeState
  environments: Record<string, ScopeState>
}

const STATE: Record<Scenario, MockState> = {
  existing: {
    repository: nothing(),
    environments: {
      // KUBE_API_HOST differs from environments/qa/inventory.yml on purpose, to show a conflict.
      qa: {
        variables: {
          DOMAIN: 'qa.opencrvs.example',
          ACTIVATE_USERS: 'true',
          KUBE_API_HOST: '10.1.0.77',
          KUBE_WORKER_NODES: ''
        },
        secretNames: [...EMAIL_SECRETS, ...GENERATED_SECRETS]
      },
      staging: {
        variables: {
          DOMAIN: 'staging.opencrvs.example',
          ACTIVATE_USERS: 'false',
          KUBE_API_HOST: '10.9.0.5',
          KUBE_WORKER_NODES: '10.9.0.11,10.9.0.12'
        },
        secretNames: [...GENERATED_SECRETS]
      },
      production: {
        variables: {
          DOMAIN: 'opencrvs.example',
          ACTIVATE_USERS: 'false',
          KUBE_API_HOST: '10.3.0.5',
          KUBE_WORKER_NODES: '10.3.0.11,10.3.0.12',
          BACKUP_HOST: '203.0.113.9',
          BACKUP_ENVIRONMENT_MODE: 'differential'
        },
        secretNames: [...EMAIL_SECRETS, ...GENERATED_SECRETS, 'BACKUP_SERVER_USER', ...BACKUP_SECRETS]
      }
    }
  },
  fresh: { repository: nothing(), environments: {} },
  'registry-present': {
    repository: { variables: { REGISTRY_HOST: 'ghcr.io' }, secretNames: [...REGISTRY_SECRETS] },
    environments: { qa: nothing() }
  },
  'name-taken': { repository: nothing(), environments: { staging: nothing(), production: nothing() } }
}

// delayMs makes the calls visibly asynchronous in the UI; tests pass 0.
// Writes change this instance's state, so what is read afterwards reflects them.
export class MockGitHub implements GitHubPort {
  // Secret values that were written, by "<scope>:<name>", so a test can see what arrived.
  readonly writtenSecrets: Record<string, string> = {}
  // Set to false to behave like a dev server that has forgotten the token.
  connected = true
  private readonly state: Record<Scenario, MockState> = structuredClone(STATE)

  constructor(
    public scenario: Scenario = 'fresh',
    private readonly delayMs = 400
  ) {}

  private async read<T>(pick: (state: MockState) => T): Promise<T> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs))
    return pick(this.state[this.scenario])
  }

  private static copy(state: ScopeState | undefined): ScopeState {
    return { variables: { ...(state?.variables ?? {}) }, secretNames: [...(state?.secretNames ?? [])] }
  }

  status(): Promise<GitHubStatus> {
    return this.read(() => (this.connected ? { connected: true, owner: 'acme', repo: 'infrastructure' } : { connected: false }))
  }

  listEnvironments() {
    return this.read((state) => Object.keys(state.environments))
  }

  readRepository() {
    return this.read((state) => MockGitHub.copy(state.repository))
  }

  readEnvironment(name: string) {
    return this.read((state) => MockGitHub.copy(state.environments[name]))
  }

  private scopeOf(state: MockState, target: WriteTarget) {
    const scope = target.scope === 'repository' ? state.repository : state.environments[target.environment ?? '']
    if (!scope) throw new Error(`Not found: environment ${target.environment}.`)
    return scope
  }

  createEnvironment(name: string) {
    return this.read((state) => {
      state.environments[name] ??= { variables: {}, secretNames: [] }
    })
  }

  putVariable(target: WriteTarget, _exists?: boolean) {
    return this.read((state) => {
      this.scopeOf(state, target).variables[target.name] = target.value
    })
  }

  putSecret(target: WriteTarget) {
    return this.read((state) => {
      const scope = this.scopeOf(state, target)
      if (!scope.secretNames.includes(target.name)) scope.secretNames.push(target.name)
      this.writtenSecrets[`${target.scope === 'repository' ? 'repository' : `environment/${target.environment}`}:${target.name}`] = target.value
    })
  }
}
