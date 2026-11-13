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
// All GitHub access goes through this interface. The sample only reads state;
// writes (create environment, put secret, put variable) arrive with the real adapter.

// What GitHub reports for a repository or an environment. Variables come with their
// values; for secrets GitHub only ever returns the names, never the values.
export interface ScopeState {
  variables: Record<string, string>
  secretNames: string[]
}

// One GitHub variable or secret to write.
export interface WriteTarget {
  scope: 'environment' | 'repository'
  // Required when the scope is 'environment'.
  environment?: string
  name: string
  value: string
}

// Whether the dev server still holds a GitHub connection (GET /api/github/status). It keeps the token
// in memory only, so a restart of the dev server forgets it.
export interface GitHubStatus {
  connected: boolean
  owner?: string
  repo?: string
}

export interface GitHubPort {
  status(): Promise<GitHubStatus>
  listEnvironments(): Promise<string[]>
  // Repository-level variables and secret names.
  readRepository(): Promise<ScopeState>
  // Variables and secret names of one environment.
  readEnvironment(name: string): Promise<ScopeState>

  // Writing. Each call changes one thing, so a screen can show progress and retry a single item.
  // Creating an environment that exists is not an error.
  createEnvironment(name: string): Promise<void>
  // `exists` is what the plan found out; the implementation copes if it was wrong.
  putVariable(target: WriteTarget, exists?: boolean): Promise<void>
  // The value is encrypted before it leaves the dev server.
  putSecret(target: WriteTarget): Promise<void>
}
