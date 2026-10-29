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
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { RegistryEntry, RegistrySnapshot } from './types'

/**
 * Where the machine-level registry lives: `~/.local/state/opencrvs/envs.json`,
 * or `$XDG_STATE_HOME/opencrvs/envs.json` when that is set.
 */
export function defaultStateFilePath(
  environment: NodeJS.ProcessEnv = process.env,
  homeDirectory: string = os.homedir()
): string {
  const stateHome =
    environment.XDG_STATE_HOME && environment.XDG_STATE_HOME !== ''
      ? environment.XDG_STATE_HOME
      : path.join(homeDirectory, '.local', 'state')

  return path.join(stateHome, 'opencrvs', 'envs.json')
}

export interface RegistryOptions {
  /** Injected in tests so they never touch the developer's real state file. */
  stateFilePath?: string
  /** Injected in tests; defaults to a real filesystem check. */
  pathExists?: (candidate: string) => boolean
  /** Injected in tests to make `lastUsedAt` deterministic. */
  now?: () => Date
}

/**
 * The only thing in this package that touches the filesystem. Keeps the
 * resolver pure: read a snapshot here, hand it to `resolveEnvironment`, write
 * the result back here.
 */
export interface Registry {
  readonly stateFilePath: string
  read(): RegistrySnapshot
  write(snapshot: RegistrySnapshot): void
  /** Names whose recorded worktree directory has disappeared. */
  findStaleNames(snapshot: RegistrySnapshot): string[]
  /** Record (or refresh) one environment, touching `lastUsedAt`. */
  recordUse(
    name: string,
    use: { slot: number; worktreePath: string }
  ): RegistrySnapshot
  /**
   * Forget one environment, freeing its slot. Only `env:destroy` calls this,
   * and only after the environment's data is actually gone: a slot freed while
   * its data survives is what would let the next environment inherit someone
   * else's leftovers.
   */
  release(name: string): RegistrySnapshot
}

export function createRegistry(options: RegistryOptions = {}): Registry {
  const stateFilePath = options.stateFilePath ?? defaultStateFilePath()
  const pathExists = options.pathExists ?? ((p: string) => fs.existsSync(p))
  const now = options.now ?? (() => new Date())

  function read(): RegistrySnapshot {
    let raw: string

    try {
      raw = fs.readFileSync(stateFilePath, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {}
      }
      throw error
    }

    try {
      const parsed: unknown = JSON.parse(raw)

      if (parsed === null || typeof parsed !== 'object') {
        throw new Error('expected a JSON object')
      }

      return parsed as RegistrySnapshot
    } catch (error) {
      throw new Error(
        `The OpenCRVS environment registry at ${stateFilePath} is not valid ` +
          `JSON (${(error as Error).message}). Fix or delete the file; ` +
          'deleting it frees every slot but leaves environment data intact.'
      )
    }
  }

  function write(snapshot: RegistrySnapshot): void {
    fs.mkdirSync(path.dirname(stateFilePath), { recursive: true })
    fs.writeFileSync(stateFilePath, `${JSON.stringify(snapshot, null, 2)}\n`)
  }

  function findStaleNames(snapshot: RegistrySnapshot): string[] {
    return Object.entries(snapshot)
      .filter(([, entry]) => !pathExists(entry.worktreePath))
      .map(([name]) => name)
  }

  function recordUse(
    name: string,
    use: { slot: number; worktreePath: string }
  ): RegistrySnapshot {
    const entry: RegistryEntry = {
      slot: use.slot,
      worktreePath: use.worktreePath,
      lastUsedAt: now().toISOString()
    }
    const snapshot: RegistrySnapshot = { ...read(), [name]: entry }

    write(snapshot)

    return snapshot
  }

  function release(name: string): RegistrySnapshot {
    const snapshot = read()

    // Deleting an absent key is a no-op rather than an error: `env:destroy` is
    // idempotent, and cleaning up an unregistered name is a supported case.
    delete snapshot[name]

    write(snapshot)

    return snapshot
  }

  return { stateFilePath, read, write, findStaleNames, recordUse, release }
}
