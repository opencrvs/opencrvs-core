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

/**
 * Codemod: Remove the local `infrastructure/` directory.
 *
 * Used by the v1.9 → v2.0 upgrade when the country config does NOT deploy
 * via Docker Swarm. In that case the `infrastructure/` directory shipped
 * with opencrvs-countryconfig is no longer needed and can be removed.
 *
 * Some non-Swarm deployments still need a small subset of
 * `infrastructure/` (e.g. `postgres/` and `metabase/`). Pass `keep` to
 * preserve those top-level subdirectories — everything else under
 * `infrastructure/` is deleted, and the kept subdirectories can then be
 * refreshed from upstream by `merge-infrastructure-directory.ts` with the
 * matching `subdirs` option.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/delete-infrastructure-directory.ts
 *
 * What it does:
 *   1. Stages deletion of all tracked files under `infrastructure/` via
 *      `git rm -rf --ignore-unmatch -- <path>`. This both removes the
 *      files from the working tree and records the deletion in the
 *      index, so it shows up in the upgrade commit alongside the other
 *      codemod changes. When `keep` is provided, deletion is scoped to
 *      the top-level entries that are NOT in `keep`.
 *   2. Cleans up any untracked files / empty directory that `git rm` left
 *      behind, so the deleted paths are fully gone from the working tree.
 *
 * Caveats:
 *   - Destructive: any local edits to deleted paths are lost. Run on a
 *     clean working tree (or after committing your local changes).
 *   - If `infrastructure/` doesn't exist, this codemod is a no-op.
 *   - Requires git to be installed and the country config working directory
 *     to be a git repo.
 */

import { existsSync, readdirSync, rmSync } from 'fs'
import { join } from 'path'
import { assertIsGitRepo, runGit } from './checkout-upstream-files'

const INFRASTRUCTURE_DIR = 'infrastructure'

interface DeleteInfrastructureOptions {
  /**
   * Top-level entries directly under `infrastructure/` to preserve. Names
   * match against the basename of each entry (file or directory). When
   * empty (the default), the whole `infrastructure/` directory is deleted.
   */
  keep?: string[]
}

async function main({
  keep = []
}: DeleteInfrastructureOptions = {}): Promise<void> {
  const fullPath = join(process.cwd(), INFRASTRUCTURE_DIR)

  if (!existsSync(fullPath)) {
    console.log(
      `'${INFRASTRUCTURE_DIR}/' not found in ${process.cwd()} — nothing to delete.`
    )
    return
  }

  assertIsGitRepo()

  // ─── Whole-directory delete (legacy behavior) ────────────────────────
  if (keep.length === 0) {
    console.log(`Deleting '${INFRASTRUCTURE_DIR}/'...\n`)

    // `git rm -rf --ignore-unmatch` removes tracked files (working tree +
    // index) and is a no-op for paths with no tracked entries, so it's
    // safe to run even when `infrastructure/` exists only as untracked
    // files.
    runGit(['rm', '-rf', '--ignore-unmatch', '--', `${INFRASTRUCTURE_DIR}/`], {
      silent: true
    })
    console.log(
      `  Staged deletion of tracked files under '${INFRASTRUCTURE_DIR}/'.`
    )

    // `git rm` leaves untracked files (and any now-empty directory) on
    // disk; remove whatever's left so the path is fully gone.
    if (existsSync(fullPath)) {
      rmSync(fullPath, { recursive: true, force: true })
      console.log(
        `  Removed remaining untracked files under '${INFRASTRUCTURE_DIR}/'.`
      )
    }

    console.log(
      `\n  Done. Review the staged deletion with: git diff --cached -- '${INFRASTRUCTURE_DIR}/'`
    )
    return
  }

  // ─── Selective delete: keep listed top-level entries ─────────────────
  const keepSet = new Set(keep)
  console.log(
    `Deleting contents of '${INFRASTRUCTURE_DIR}/' except: ${[...keepSet]
      .map((name) => `'${name}'`)
      .join(', ')}\n`
  )

  const topLevelEntries = readdirSync(fullPath, { withFileTypes: true })
  let deleted = 0

  for (const entry of topLevelEntries) {
    if (keepSet.has(entry.name)) {
      console.log(`  Keeping '${INFRASTRUCTURE_DIR}/${entry.name}'.`)
      continue
    }

    // Append a trailing slash for directories so git treats it as a tree
    // pathspec (matches the recursive behavior of `git rm -rf`).
    const relPath = `${INFRASTRUCTURE_DIR}/${entry.name}${
      entry.isDirectory() ? '/' : ''
    }`
    runGit(['rm', '-rf', '--ignore-unmatch', '--', relPath], { silent: true })

    const fullEntryPath = join(fullPath, entry.name)
    if (existsSync(fullEntryPath)) {
      rmSync(fullEntryPath, { recursive: true, force: true })
    }

    console.log(`  Deleted '${relPath}'.`)
    deleted++
  }

  // Note any requested keeps that weren't actually present, so the dev
  // notices typos / missing directories.
  const presentNames = new Set(topLevelEntries.map((e) => e.name))
  const missingKeeps = [...keepSet].filter((name) => !presentNames.has(name))
  if (missingKeeps.length > 0) {
    console.warn(
      `  [warn] Requested to keep ${missingKeeps
        .map((n) => `'${n}'`)
        .join(', ')} but they don't exist under '${INFRASTRUCTURE_DIR}/'.`
    )
  }

  console.log(
    `\n  Done. Deleted ${deleted} top-level entr${
      deleted === 1 ? 'y' : 'ies'
    }. Review the staged deletions with: git diff --cached -- '${INFRASTRUCTURE_DIR}/'`
  )
}

export { main }
