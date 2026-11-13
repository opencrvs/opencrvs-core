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
import { rowsToUsers } from '../form/users.ts'

// Named conversions from a stored value to a form value. Bindings refer to these
// by name, so the YAML never contains code. A parser returns undefined when the
// stored value says nothing (empty, null, wrong type).
type Parser = (raw: unknown) => unknown

const text = (raw: unknown) => (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean' ? String(raw).trim() : '')

export const PARSERS: Record<string, Parser> = {
  string: (raw) => text(raw) || undefined,

  boolean: (raw) => {
    const value = text(raw).toLowerCase()
    return value === 'true' ? true : value === 'false' ? false : undefined
  },

  // GitHub variable "10.0.0.1, 10.0.0.2" -> table rows. An empty string means "no workers".
  'csv-to-ip-rows': (raw) => {
    if (typeof raw !== 'string') return undefined
    return raw
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean)
      .map((ip) => ({ ip }))
  },

  // Host addresses read from the inventory -> table rows.
  'ip-rows': (raw) => {
    if (!Array.isArray(raw)) return undefined
    const rows = raw.map((ip) => text(ip)).filter(Boolean).map((ip) => ({ ip }))
    return rows.length ? rows : undefined
  },

  // `all.vars.users` -> USERS table rows. Older inventories used `sudoer` instead of `role`.
  users: (raw) => {
    if (!Array.isArray(raw)) return undefined
    return raw.map((entry) => {
      const user = (entry ?? {}) as Record<string, unknown>
      const keys = Array.isArray(user.ssh_keys) ? user.ssh_keys.map((key) => text(key)).filter(Boolean) : []
      return {
        name: text(user.name),
        role: user.role === 'admin' || user.role === 'operator' ? user.role : user.sudoer ? 'admin' : 'operator',
        state: user.state === 'absent' ? 'absent' : 'present',
        ssh_keys: keys.join('\n')
      }
    })
  }
}

// The other direction: a form value as it is written. Used for file templates, where a list
// stays a list, and for GitHub, where `String(...)` of the result is stored.
export const FORMATTERS: Record<string, (value: unknown) => unknown> = {
  string: (value) => (typeof value === 'string' ? value.trim() : String(value)),
  boolean: (value) => value === true || value === 'true',
  // table rows -> "10.0.0.1,10.0.0.2" (a GitHub variable)
  'csv-to-ip-rows': (value) => ipsOf(value).join(','),
  // table rows -> ["10.0.0.1", "10.0.0.2"] (a template list)
  'ip-rows': (value) => ipsOf(value),
  // table rows -> the users the inventory template expects
  users: (value) => rowsToUsers(value)
}

function ipsOf(rows: unknown): string[] {
  if (!Array.isArray(rows)) return []
  return rows.map((row) => text((row as { ip?: unknown } | null)?.ip)).filter(Boolean)
}

export function formatWith(name: string | undefined, value: unknown): unknown {
  const formatter = FORMATTERS[name ?? 'string']
  if (!formatter) throw new Error(`Unknown parser "${name}"`)
  return formatter(value)
}

export function parseWith(name: string | undefined, raw: unknown): unknown {
  const parser = PARSERS[name ?? 'string']
  if (!parser) throw new Error(`Unknown parser "${name}"`)
  return parser(raw)
}
