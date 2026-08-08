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

/** Thrown when an environment's slot cannot be known without allocating one. */
export class EnvironmentNotRegisteredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentNotRegisteredError'
  }
}

export interface LookupEnvironmentInput {
  /** `--env <name>`; takes precedence over the worktree directory basename. */
  envOverride?: string
  worktreePath: string
  isPrimaryWorktree: boolean
  /** The registry as read from disk. Never mutated. */
  registry: RegistrySnapshot
}

/**
 * Answer "which environment am I in?" **without creating one.**
 *
 * This is `resolve`'s read-only twin. `resolve` allocates a slot and records
 * the use, which is right for `pnpm dev` — it is the command that brings an
 * environment into existence — and wrong for everything else. A script that
 * clears, seeds or reindexes an environment must not be the thing that quietly
 * claims the last free slot, and must not invent an environment for a typo'd
 * `--env`.
 *
 * Every identifier still comes from `resolveEnvironment`, so a lookup can never
 * disagree with what `pnpm dev` created. Only two slots are knowable without
 * allocating, and both are read, never chosen:
 *
 * - a registered name keeps the slot the registry recorded;
 * - the primary checkout is slot 0 by definition (`PRIMARY_SLOT`).
 *
 * Anything else — an unregistered environment in a linked worktree — would
 * require picking a free slot, i.e. creating an environment, so it is refused.
 */
export function lookupEnvironment(
  input: LookupEnvironmentInput
): EnvironmentDescriptor {
  const name = deriveEnvironmentName({
    envOverride: input.envOverride,
    worktreePath: input.worktreePath
  })

  if (input.registry[name] === undefined && !input.isPrimaryWorktree) {
    throw new EnvironmentNotRegisteredError(notRegisteredMessage(name, input))
  }

  return resolveEnvironment({
    name,
    worktreePath: input.worktreePath,
    isPrimaryWorktree: input.isPrimaryWorktree,
    /*
     * Identical to `runResolve`'s rule, deliberately: the primary checkout with
     * no `--env` is the default environment and owns the unprefixed `events` /
     * `ocrvs` data; naming an environment with `--env` asks for a separate one.
     * Any divergence here would point a clear or a seed at the wrong data.
     */
    isDefaultEnvironment:
      input.isPrimaryWorktree && !hasExplicitName(input.envOverride),
    registry: input.registry,
    /*
     * Irrelevant: neither branch that reaches here allocates a slot, and
     * staleness only ever influences allocation.
     */
    staleNames: []
  })
}

function notRegisteredMessage(
  name: string,
  input: LookupEnvironmentInput
): string {
  return (
    `Environment "${name}" is not registered, and ${input.worktreePath} is a ` +
    'linked worktree, so its slot — and therefore its ports and Redis DB — ' +
    'cannot be known without allocating one. Nothing has been created.\n' +
    'Start it once with `pnpm dev` (which allocates its slot), or name a ' +
    'registered environment with `--env <name>`. `pnpm env:list` shows which ' +
    'environments exist.'
  )
}

export interface RunLookupInput {
  envOverride?: string
  worktreePath: string
  isPrimaryWorktree: boolean
  registry: Registry
}

export interface RunLookupResult {
  descriptor: EnvironmentDescriptor
  /** The full environment-variable contract. */
  env: Record<string, string>
  /** The contract rendered as sourceable `export VAR=value` lines. */
  exports: string
}

/**
 * The whole contract of an existing environment, for a script to source.
 *
 * `registry.read` is the only registry call — no `recordUse`, no `release`, no
 * write of any kind — so running it leaves the state file byte-identical.
 */
export function runLookup(input: RunLookupInput): RunLookupResult {
  const descriptor = lookupEnvironment({
    envOverride: input.envOverride,
    worktreePath: input.worktreePath,
    isPrimaryWorktree: input.isPrimaryWorktree,
    registry: input.registry.read()
  })

  const env = toEnvironmentVariables(descriptor)

  return { descriptor, env, exports: formatExportLines(env) }
}
