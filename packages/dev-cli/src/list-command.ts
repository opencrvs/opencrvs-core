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
import { Registry } from './registry'
import { portsForSlot } from './resolver'
import {
  BASE_PORTS,
  RegistrySnapshot,
  ServiceName,
  ServicePorts
} from './types'

/** One row of the listing. */
export interface EnvironmentSummary {
  name: string
  slot: number
  worktreePath: string
  /** The recorded worktree directory no longer exists. */
  worktreeMissing: boolean
  ports: ServicePorts
}

/**
 * Turn a registry snapshot into rows. Pure, and — the point of this verb —
 * *derives* ports rather than reading them from anywhere: the registry stores a
 * slot, and `portsForSlot` is the same function `resolve` uses, so the listing
 * can never disagree with what an environment actually binds.
 */
export function summarizeEnvironments(
  snapshot: RegistrySnapshot,
  staleNames: string[] = []
): EnvironmentSummary[] {
  const stale = new Set(staleNames)

  return Object.entries(snapshot)
    .map(([name, entry]) => ({
      name,
      slot: entry.slot,
      worktreePath: entry.worktreePath,
      worktreeMissing: stale.has(name),
      ports: portsForSlot(entry.slot)
    }))
    .sort((a, b) => a.slot - b.slot || a.name.localeCompare(b.name))
}

const SERVICE_NAMES = Object.keys(BASE_PORTS) as ServiceName[]

/**
 * Render the rows as a fixed-width table.
 *
 * The port columns are generated from `BASE_PORTS` rather than listed here, so
 * adding a service to the contract adds a column without anyone remembering to
 * update this verb.
 */
export function formatEnvironmentTable(rows: EnvironmentSummary[]): string {
  if (rows.length === 0) {
    return (
      'No environments are registered.\n\n' +
      'An environment is registered the first time `pnpm dev` resolves it.'
    )
  }

  const header = ['NAME', 'SLOT', ...SERVICE_NAMES.map(upper), 'WORKTREE']
  const body = rows.map((row) => [
    row.name,
    String(row.slot),
    ...SERVICE_NAMES.map((service) => String(row.ports[service])),
    row.worktreeMissing ? `${row.worktreePath} (missing)` : row.worktreePath
  ])

  const widths = header.map((cell, column) =>
    Math.max(cell.length, ...body.map((line) => line[column].length))
  )

  return [header, ...body]
    .map((line) =>
      line
        // The last column is never padded, so lines carry no trailing spaces.
        .map((cell, column) =>
          column === line.length - 1 ? cell : cell.padEnd(widths[column])
        )
        .join('  ')
    )
    .join('\n')
}

function upper(service: ServiceName): string {
  return service.replace(/([a-z])([A-Z])/g, '$1-$2').toUpperCase()
}

export interface RunListInput {
  registry: Registry
}

export interface RunListResult {
  environments: EnvironmentSummary[]
  table: string
}

/**
 * List every registered environment.
 *
 * **Strictly read-only.** It calls `registry.read` and nothing else — no
 * `recordUse`, no `release`, no write of any kind — so the state file is
 * byte-identical afterwards, `lastUsedAt` is untouched, and no slot is
 * allocated. That is the whole difference between this verb and `resolve`,
 * which registers the environment it resolves as a side effect. Listing must be
 * safe to run from a cron job, a shell prompt or a `watch`, so it cannot be the
 * thing that quietly claims the last free slot.
 *
 * `findStaleNames` is the one filesystem call, and it only ever stats the
 * recorded worktree directories.
 */
export function runList(input: RunListInput): RunListResult {
  const snapshot = input.registry.read()
  const environments = summarizeEnvironments(
    snapshot,
    input.registry.findStaleNames(snapshot)
  )

  return { environments, table: formatEnvironmentTable(environments) }
}
