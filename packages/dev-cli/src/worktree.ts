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
   * True for the primary checkout, false for a `git worktree add` checkout and
   * for a directory that no longer exists. The primary checkout is the one
   * that gets slot 0.
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
 * same directory. An existing directory that is not a git repository is
 * treated as primary, so a source tarball behaves exactly like a normal
 * checkout.
 *
 * A directory that is *absent* is not that case, and is deliberately kept out
 * of it. `git` fails there for a different reason but in the same way — no
 * output — and callers do pass paths that may be gone: `env:destroy` inspects
 * the worktree a registry entry records, which is exactly the path that
 * disappears when a worktree is deleted. Answering "primary" for it would make
 * every orphaned entry look like the default environment and become
 * undestroyable. A directory that does not exist cannot be the primary
 * checkout, so `false` is both the safe answer and the true one.
 */
export function inspectWorktree(cwd: string = process.cwd()): Worktree {
  const resolved = path.resolve(cwd)

  if (!fs.existsSync(resolved)) {
    return { path: resolved, isPrimary: false }
  }

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
    return { path: resolved, isPrimary: true }
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
