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
// What the page can ask the local dev server (see server/plugin.ts): the
// repository named by `git remote origin`, and the environments kept in the
// `environments/` folder.
export interface Repository {
  owner: string
  repo: string
}

export interface EnvironmentList {
  names: string[]
  layout: 'folders' | 'files' | 'none'
}

// An environment file as the dev server would write it, and as it is now (null: it does not exist).
export interface RenderedFile {
  path: string
  text: string
  existing: string | null
  // Where it would be written, relative to environments/ (for example "qa/inventory.yml" or "qa.yaml"),
  // or null when the layout has no place for it: the flat layout holds one file per environment.
  target: string | null
}

// An SSH key pair as OpenSSH writes it: the public key is one line for authorized_keys.
export interface SshKeyPair {
  publicKey: string
  privateKey: string
}

export interface LocalServerPort {
  getRepository(): Promise<Repository | null>
  listEnvironments(): Promise<EnvironmentList>
  // Known files of one environment keyed by path, e.g. 'inventory.yml'. Empty if it has none.
  readEnvironmentFiles(name: string): Promise<Record<string, string>>
  // Renders the files from the answers on screen (no secrets), without writing anything.
  renderFiles(name: string, values: Record<string, unknown>): Promise<RenderedFile[]>
  // Renders them again on the server and writes them. Returns the paths written.
  writeFiles(name: string, values: Record<string, unknown>): Promise<string[]>
  // A new Ed25519 key pair for the backup server. The dev server keeps nothing of it.
  generateSshKeyPair(): Promise<SshKeyPair>
}
