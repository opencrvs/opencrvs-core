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
import { CommandRunner, CommandSpec, runCommand } from './exec'

/**
 * The dependency singleton is machine-wide, run as one docker compose
 * project so that every worktree addresses the same containers no matter which
 * directory started them. The project name and the file list must match
 * `compose:deps` in the root `package.json` exactly — a different `-p` or a
 * different `-f` set is a *different* project to docker compose, and would
 * leave the running one untouched while claiming success.
 */
export const DEPS_PROJECT = 'opencrvs-deps'

export const DEPS_COMPOSE_FILES = [
  'docker-compose.deps.yml',
  'docker-compose.dev-deps.yml'
] as const

export interface DepsDownOptions {
  /** Also delete the project's named volumes: a full machine reset. */
  volumes?: boolean
  /** Repository root; the compose files are resolved relative to it. */
  cwd?: string
}

/**
 * The exact `docker compose` invocation `deps:down` runs. Built as data so a
 * test can assert on the argv without a docker daemon: the difference between
 * `down` and `down -v` is the difference between pausing work and destroying
 * every environment's data on the machine, so it is worth pinning.
 */
export function depsDownCommand(options: DepsDownOptions = {}): CommandSpec {
  const files = DEPS_COMPOSE_FILES.flatMap((file) => ['-f', file])

  return {
    command: 'docker',
    args: [
      'compose',
      '-p',
      DEPS_PROJECT,
      ...files,
      'down',
      ...(options.volumes === true ? ['-v'] : [])
    ],
    cwd: options.cwd,
    inherit: true
  }
}

export interface RunDepsDownInput extends DepsDownOptions {
  /** Injected in tests; defaults to really running the command. */
  run?: CommandRunner
  out?: (message: string) => void
}

/**
 * Stop the shared dependency singleton.
 *
 * Volume wiping is loud rather than silent, because `-v` deletes the Postgres,
 * Elasticsearch and MinIO volumes shared by *every* environment on the machine
 * — not just the current worktree's — and the flag is one character long.
 */
export function runDepsDown(input: RunDepsDownInput = {}): number {
  const run = input.run ?? runCommand
  const out = input.out ?? (() => undefined)
  const spec = depsDownCommand(input)

  out(
    input.volumes === true
      ? `Stopping the "${DEPS_PROJECT}" compose project and deleting its ` +
          'named volumes. Every local environment on this machine loses ' +
          'its database, Elasticsearch indices and uploaded documents.'
      : `Stopping the "${DEPS_PROJECT}" compose project. Volumes are kept, ` +
          'so every environment’s data survives.'
  )

  run(spec)

  return 0
}
