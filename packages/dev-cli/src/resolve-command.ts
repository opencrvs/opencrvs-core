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
import { formatExportLines, toEnvironmentVariables } from './env-contract'
import { Registry } from './registry'
import {
  deriveEnvironmentName,
  hasExplicitName,
  resolveEnvironment
} from './resolver'
import { EnvironmentDescriptor, RegistrySnapshot } from './types'

export interface RunResolveInput {
  /** `--env <name>`; takes precedence over the worktree directory basename. */
  envOverride?: string
  worktreePath: string
  isPrimaryWorktree: boolean
  registry: Registry
}

export interface RunResolveResult {
  descriptor: EnvironmentDescriptor
  /** The full environment-variable contract. */
  env: Record<string, string>
  /** The contract rendered as sourceable `export VAR=value` lines. */
  exports: string
  /** Lazy-GC notices, for stderr. Never fatal. */
  warnings: string[]
}

/**
 * Resolve this worktree's environment and register the use.
 *
 * Lazy GC happens here: entries whose worktree directory has disappeared stop
 * holding their slot, but their registry entry — and therefore their database,
 * indices and bucket — is left completely alone. Deleting data is only ever
 * `env:destroy`'s job.
 */
export function runResolve(input: RunResolveInput): RunResolveResult {
  const { registry } = input
  const snapshot = registry.read()
  const staleNames = registry.findStaleNames(snapshot)

  const name = deriveEnvironmentName({
    envOverride: input.envOverride,
    worktreePath: input.worktreePath
  })

  const descriptor = resolveEnvironment({
    name,
    worktreePath: input.worktreePath,
    isPrimaryWorktree: input.isPrimaryWorktree,
    /*
     * `pnpm dev` in the primary checkout, with no `--env`, is the environment
     * that already exists on the developer's machine, so it keeps today's
     * `events` / `events` / `ocrvs` identifiers. Naming an environment with
     * `--env` is a request for a separate one, even from the primary checkout.
     */
    isDefaultEnvironment:
      input.isPrimaryWorktree && !hasExplicitName(input.envOverride),
    registry: snapshot,
    staleNames
  })

  registry.recordUse(descriptor.name, {
    slot: descriptor.slot,
    worktreePath: descriptor.worktreePath
  })

  const env = toEnvironmentVariables(descriptor)

  return {
    descriptor,
    env,
    exports: formatExportLines(env),
    warnings: staleEntryWarnings(snapshot, staleNames, descriptor.name)
  }
}

/**
 * One warning per abandoned environment, naming what was kept and how to get
 * rid of it. The environment currently being resolved is skipped: re-pointing
 * a known name at a new directory is a resurrection, not an abandonment.
 */
export function staleEntryWarnings(
  snapshot: RegistrySnapshot,
  staleNames: string[],
  resolvedName: string
): string[] {
  return staleNames
    .filter((name) => name !== resolvedName)
    .map((name) => {
      const entry = snapshot[name]
      return (
        `warning: environment "${name}" is registered to ${entry.worktreePath}, ` +
        `which no longer exists. Slot ${entry.slot} has been freed for reuse, ` +
        'but its data (database, Elasticsearch indices, bucket, Redis keys) ' +
        `was left untouched. Run \`pnpm env:destroy ${name}\` to delete it.`
      )
    })
}
