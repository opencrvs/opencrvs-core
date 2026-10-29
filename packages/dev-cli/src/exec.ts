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
import { spawnSync } from 'node:child_process'

/**
 * One external process to run. Described as data rather than executed inline so
 * that the lifecycle verbs — which drop databases and stop containers — can be
 * unit-tested by asserting on the commands they *would* run, without a docker
 * daemon anywhere near the test suite.
 */
export interface CommandSpec {
  command: string
  args: string[]
  /** Working directory. Matters for `docker compose -f <relative path>`. */
  cwd?: string
  /** Extra environment entries, merged over the current process environment. */
  env?: Record<string, string>
  /** Fed to the child's stdin. */
  input?: string
  /**
   * Pass the child's stdout/stderr straight through to this process's, instead
   * of capturing them. Used for long, chatty commands (`docker compose down`)
   * where the developer wants to watch progress.
   */
  inherit?: boolean
  /**
   * Return a non-zero status instead of throwing. Used where "already gone" is
   * a success for our purposes — removing a bucket that does not exist, say.
   */
  allowFailure?: boolean
}

export interface CommandOutcome {
  status: number
  stdout: string
  stderr: string
}

/** The seam every I/O adapter in this package is built on. */
export type CommandRunner = (spec: CommandSpec) => CommandOutcome

/**
 * Run a command with `spawnSync`, never through a shell.
 *
 * Avoiding the shell is deliberate: environment names reach these commands as
 * database names, index names and bucket names, and argv arrays cannot be
 * word-split or glob-expanded the way a shell string can.
 */
export const runCommand: CommandRunner = (spec) => {
  const result = spawnSync(spec.command, spec.args, {
    cwd: spec.cwd,
    env: spec.env ? { ...process.env, ...spec.env } : process.env,
    input: spec.input,
    encoding: 'utf8',
    stdio: spec.inherit ? 'inherit' : ['pipe', 'pipe', 'pipe']
  })

  if (result.error) {
    throw new Error(
      `Could not run \`${describe(spec)}\`: ${result.error.message}`
    )
  }

  const outcome: CommandOutcome = {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? ''
  }

  if (outcome.status !== 0 && spec.allowFailure !== true) {
    throw new Error(
      `\`${describe(spec)}\` failed with exit code ${outcome.status}.` +
        (outcome.stderr.trim() === '' ? '' : `\n${outcome.stderr.trim()}`)
    )
  }

  return outcome
}

/** The command as a developer would have to type it, for error messages. */
export function describe(spec: CommandSpec): string {
  return [spec.command, ...spec.args].join(' ')
}
