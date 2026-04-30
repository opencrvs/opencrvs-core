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
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/delete-infrastructure-directory.ts
 *
 * What it does:
 *   1. Stages deletion of all tracked files under `infrastructure/` via
 *      `git rm -rf --ignore-unmatch -- infrastructure/`. This both removes
 *      the files from the working tree and records the deletion in the
 *      index, so it shows up in the upgrade commit alongside the other
 *      codemod changes.
 *   2. Cleans up any untracked files / empty directory that `git rm` left
 *      behind, so the path is fully gone from the working tree.
 *
 * Caveats:
 *   - Destructive: any local edits to `infrastructure/` are lost. Run on a
 *     clean working tree (or after committing your local changes).
 *   - If `infrastructure/` doesn't exist, this codemod is a no-op.
 *   - Requires git to be installed and the country config working directory
 *     to be a git repo.
 */

import { existsSync, rmSync } from 'fs'
import { join } from 'path'
import { assertIsGitRepo, runGit } from './checkout-upstream-files'

const INFRASTRUCTURE_DIR = 'infrastructure'

async function main(): Promise<void> {
  const fullPath = join(process.cwd(), INFRASTRUCTURE_DIR)

  if (!existsSync(fullPath)) {
    console.log(
      `'${INFRASTRUCTURE_DIR}/' not found in ${process.cwd()} — nothing to delete.`
    )
    return
  }

  console.log(`Deleting '${INFRASTRUCTURE_DIR}/'...\n`)

  assertIsGitRepo()

  // `git rm -rf --ignore-unmatch` removes tracked files (working tree + index)
  // and is a no-op for paths with no tracked entries, so it's safe to run
  // even when `infrastructure/` exists only as untracked files.
  runGit(['rm', '-rf', '--ignore-unmatch', '--', `${INFRASTRUCTURE_DIR}/`], {
    silent: true
  })
  console.log(`  Staged deletion of tracked files under '${INFRASTRUCTURE_DIR}/'.`)

  // `git rm` leaves untracked files (and any now-empty directory) on disk;
  // remove whatever's left so the path is fully gone.
  if (existsSync(fullPath)) {
    rmSync(fullPath, { recursive: true, force: true })
    console.log(`  Removed remaining untracked files under '${INFRASTRUCTURE_DIR}/'.`)
  }

  console.log(
    `\n  Done. Review the staged deletion with: git diff --cached -- '${INFRASTRUCTURE_DIR}/'`
  )
}

export { main }
