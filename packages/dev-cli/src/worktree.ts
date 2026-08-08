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
import { execFileSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

export interface Worktree {
  /** Absolute path of the checkout root (or cwd outside a repository). */
  path: string
  /**
   * True for the primary checkout, false for a `git worktree add` checkout.
   * The primary checkout is the one that gets slot 0.
   */
  isPrimary: boolean
}

function git(args: string[], cwd: string): string | undefined {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    return undefined
  }
}

/**
 * Inspect the checkout at `cwd`.
 *
 * Linked worktrees are detected the way git itself distinguishes them: a
 * linked worktree's `--git-dir` is `<common>/worktrees/<id>` while its
 * `--git-common-dir` is `<common>`; in the primary checkout the two are the
 * same directory. Anything that is not a git repository is treated as primary,
 * so a source tarball behaves exactly like a normal checkout.
 */
export function inspectWorktree(cwd: string = process.cwd()): Worktree {
  const topLevel = git(['rev-parse', '--show-toplevel'], cwd)
  const gitDir = git(['rev-parse', '--absolute-git-dir'], cwd)
  const commonDir = git(
    ['rev-parse', '--path-format=absolute', '--git-common-dir'],
    cwd
  )

  if (
    topLevel === undefined ||
    gitDir === undefined ||
    commonDir === undefined
  ) {
    return { path: path.resolve(cwd), isPrimary: true }
  }

  return {
    path: path.resolve(topLevel),
    isPrimary: realPath(gitDir) === realPath(commonDir)
  }
}

function realPath(candidate: string): string {
  try {
    return fs.realpathSync(candidate)
  } catch {
    return path.resolve(candidate)
  }
}
