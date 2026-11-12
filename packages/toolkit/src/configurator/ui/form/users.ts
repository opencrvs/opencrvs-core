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
// Same shape as `all.vars.users` in the Ansible inventory written by
// `environment:init` (opencrvs-core/packages/toolkit/src/environment/manage-users.ts).
export interface User {
  name: string
  ssh_keys: string[]
  state: 'present' | 'absent'
  role: 'admin' | 'operator'
}

// One row of the USERS table. The form edits all keys in one text area, one per line.
interface UserRow {
  name?: string
  role?: User['role']
  state?: User['state']
  ssh_keys?: string
}

// Same rule as the CLI: blank lines and lines starting with # are ignored.
export function parseKeys(text: unknown): string[] {
  if (typeof text !== 'string') return []
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

// Stricter than the CLI, which accepts anything: every key line must look like an
// OpenSSH public key, which also rejects a pasted private key.
const PUBLIC_KEY =
  /^(ssh-(rsa|ed25519|dss)|ecdsa-sha2-nistp(256|384|521)|sk-(ssh-ed25519|ecdsa-sha2-nistp256)@openssh\.com)\s+[A-Za-z0-9+/]+={0,3}(\s+.*)?$/

export const areValidKeys = (text: unknown) => parseKeys(text).every((key) => PUBLIC_KEY.test(key))

export function rowsToUsers(rows: unknown): User[] {
  if (!Array.isArray(rows)) return []
  return (rows as UserRow[])
    .filter((row) => row?.name?.trim())
    .map((row) => ({
      name: row.name!.trim(),
      ssh_keys: parseKeys(row.ssh_keys),
      state: row.state ?? 'present',
      role: row.role ?? 'operator'
    }))
}

export const countUsersWithoutKeys = (rows: unknown) =>
  rowsToUsers(rows).filter((user) => user.ssh_keys.length === 0).length
