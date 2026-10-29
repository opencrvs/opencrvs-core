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
import {
  deriveEnvironmentName,
  hasExplicitName,
  LEGACY_DB_NAME,
  resolveEnvironment,
  sanitizeEnvironmentName
} from './resolver'
import { EnvironmentDescriptor, RegistryEntry, RegistrySnapshot } from './types'
import { Worktree } from './worktree'

/** Thrown when an environment's slot cannot be known without allocating one. */
export class EnvironmentNotRegisteredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentNotRegisteredError'
  }
}

/** An environment found by name, wherever the command was run from. */
export interface LocatedEnvironment {
  /** Sanitized name; keys all per-environment data. */
  name: string
  /** Absent for a name the registry has never seen. */
  entry?: RegistryEntry
  isDefaultEnvironment: boolean
}

export interface EnvironmentLocatorOptions {
  registry: Registry
  /** `inspectWorktree`; with no argument, the checkout the command runs in. */
  inspectWorktree: (worktreePath?: string) => Worktree
  /**
   * The process environment, for a contract already exported into it by
   * `development-environment/environment.sh`. See `lookup`.
   */
  ambient?: NodeJS.ProcessEnv
}

/**
 * The one place that answers "which environment is this, and is it the
 * default one?".
 *
 * The default environment — the primary checkout run without `--env` — keeps
 * today's `events` / `ocrvs` identifiers and slot 0, so getting this wrong
 * points a seed, a clear or a destroy at another environment's data. Every
 * verb asks here rather than deciding for itself.
 */
export interface EnvironmentLocator {
  /**
   * For `pnpm dev` only: this checkout's environment, allocating a slot if it
   * has none and recording the use. Entries whose worktree directory has
   * disappeared stop holding their slot but keep their entry, and so their
   * data; `warnings` names them.
   */
  resolve(envOverride?: string): {
    descriptor: EnvironmentDescriptor
    warnings: string[]
  }
  /**
   * An environment that already exists, **without creating one**: no slot is
   * allocated and the registry is not written. Throws
   * `EnvironmentNotRegisteredError` for anything that would need a slot
   * picked.
   *
   * Without `--env`, a contract already exported into `ambient` wins over the
   * checkout's directory, because `--env` is not recoverable after the fact: a
   * script started with `--env foo` exports foo's contract to its children,
   * and they must act on foo too.
   */
  lookup(envOverride?: string): EnvironmentDescriptor
  /**
   * An environment by name, from anywhere — for `env:destroy`, which is run
   * from one checkout against another's environment. Never throws for an
   * unregistered name: its data can still be cleaned up.
   */
  locate(name: string): LocatedEnvironment
}

export function createEnvironmentLocator(
  options: EnvironmentLocatorOptions
): EnvironmentLocator {
  const { registry, inspectWorktree } = options
  const ambient = options.ambient ?? {}

  /*
   * `resolve` and `lookup` must land on the same slot for the same
   * environment, and `resolveEnvironment` moves a name off a slot another
   * *live* environment holds. So both ask the filesystem the same question
   * about staleness here, rather than one of them assuming nothing is stale.
   */
  function readWithStaleNames() {
    const snapshot = registry.read()
    return { snapshot, staleNames: registry.findStaleNames(snapshot) }
  }

  /**
   * The checkout's own environment: `--env` wins, else the directory names
   * it. Only the primary checkout without `--env` is the default environment;
   * naming one with `--env` asks for a separate one, even from there.
   */
  function fromCheckout(envOverride?: string) {
    const worktree = inspectWorktree()

    return {
      name: deriveEnvironmentName({
        envOverride,
        worktreePath: worktree.path
      }),
      worktreePath: worktree.path,
      isDefaultEnvironment: worktree.isPrimary && !hasExplicitName(envOverride)
    }
  }

  /**
   * A contract exported by an enclosing script, recognised by the same three
   * variables `opencrvs_env_load` in development-environment/environment.sh
   * checks, so the shell and this agree on when to inherit. Default-ness is
   * read off its database: only the default environment uses the unprefixed
   * one.
   */
  function fromAmbient(snapshot: RegistrySnapshot) {
    const {
      OPENCRVS_ENV_NAME: rawName,
      OPENCRVS_ENV_SLOT: slot,
      TARGET_DB: dbName
    } = ambient

    if (!rawName || !slot || !dbName) {
      return undefined
    }

    const name = sanitizeEnvironmentName(rawName)

    return {
      name,
      worktreePath: snapshot[name]?.worktreePath ?? inspectWorktree().path,
      isDefaultEnvironment: dbName === LEGACY_DB_NAME
    }
  }

  return {
    resolve(envOverride) {
      const { snapshot, staleNames } = readWithStaleNames()
      const descriptor = resolveEnvironment({
        ...fromCheckout(envOverride),
        registry: snapshot,
        staleNames
      })

      registry.recordUse(descriptor.name, {
        slot: descriptor.slot,
        worktreePath: descriptor.worktreePath
      })

      return {
        descriptor,
        warnings: staleEntryWarnings(snapshot, staleNames, descriptor.name)
      }
    },

    lookup(envOverride) {
      const { snapshot, staleNames } = readWithStaleNames()
      const target =
        (hasExplicitName(envOverride) ? undefined : fromAmbient(snapshot)) ??
        fromCheckout(envOverride)

      /*
       * Only two slots are knowable without allocating: a registered name's
       * recorded one, and the default environment's slot 0.
       */
      if (snapshot[target.name] === undefined && !target.isDefaultEnvironment) {
        throw new EnvironmentNotRegisteredError(
          notRegisteredMessage(target.name)
        )
      }

      return resolveEnvironment({ ...target, registry: snapshot, staleNames })
    },

    locate(raw) {
      const name = sanitizeEnvironmentName(raw)
      const entry = registry.read()[name]

      return {
        name,
        entry,
        isDefaultEnvironment:
          entry !== undefined && isDefaultEntry(name, entry, inspectWorktree)
      }
    }
  }
}

/**
 * Whether a registered environment is the default one. Its name alone cannot
 * say: `--env opencrvs-core` from anywhere is a separate environment. So the
 * *registered* worktree — not the one the command runs in — must be the
 * primary checkout, and its directory must derive the name. A deleted worktree
 * is never primary (see `inspectWorktree`), so an orphaned entry stays
 * destroyable.
 */
function isDefaultEntry(
  name: string,
  entry: RegistryEntry,
  inspectWorktree: (worktreePath?: string) => Worktree
): boolean {
  if (!inspectWorktree(entry.worktreePath).isPrimary) {
    return false
  }

  try {
    return deriveEnvironmentName({ worktreePath: entry.worktreePath }) === name
  } catch {
    return false
  }
}

function notRegisteredMessage(name: string): string {
  return (
    `Environment "${name}" is not registered, and it is not the default ` +
    'environment, so its slot — and therefore its ports and Redis DB — ' +
    'cannot be known without allocating one. Nothing has been created.\n' +
    'Start it once with `pnpm dev` (which allocates its slot), or name a ' +
    'registered environment with `--env <name>`. `pnpm env:list` shows which ' +
    'environments exist.'
  )
}

/**
 * One warning per abandoned environment, naming what was kept and how to get
 * rid of it. The environment currently being resolved is skipped: re-pointing
 * a known name at a new directory is a resurrection, not an abandonment.
 */
function staleEntryWarnings(
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
