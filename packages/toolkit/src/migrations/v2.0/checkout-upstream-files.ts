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
 * Codemod: Replace selected files with their upstream v2.0 versions from
 * opencrvs/opencrvs-countryconfig.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/checkout-upstream-files.ts
 *
 * What it does:
 *   1. Registers a temporary git remote that points at the canonical
 *      opencrvs-countryconfig repository.
 *   2. Fetches the chosen upstream branch at --depth=1 to keep it fast.
 *   3. Path-scoped checkouts each listed file from that branch. The upstream
 *      version is written to the working tree AND staged in the index, so
 *      the dev can review the diff afterwards with:
 *        git diff --cached -- <file>
 *   4. Removes the temporary remote in all cases (success, failure, or
 *      unexpected error) via a `finally` block.
 *
 * Why a git-based approach (as opposed to a raw HTTPS download):
 *   - Git handles text, binary, and line endings correctly.
 *   - The checked-out files end up staged, giving an obvious review UX.
 *   - `git checkout <ref> -- <paths>` is a blob-level copy, so it works
 *     whether or not the target repo shares history with
 *     opencrvs-countryconfig (e.g. country implementations started from
 *     scratch rather than forked).
 *
 * Caveats:
 *   - Overwrites any local modifications to the listed files. Run the
 *     upgrade on a clean working tree, or accept that the upstream version
 *     replaces yours.
 *   - Requires git to be installed and network access to github.com.
 *   - Requires the country config working directory to be a git repo.
 */

import { execFileSync } from 'child_process'
export const UPSTREAM_URL =
  'https://github.com/opencrvs/opencrvs-countryconfig.git'

// @TODO: This needs to be changed to 'release-v2.0.0' once the branch is created
export const UPSTREAM_BRANCH = 'develop'

// Remote name used only for the duration of this codemod. Prefixed to avoid
// clashing with remotes the user may have (origin, upstream, etc.).
const TEMP_REMOTE = 'opencrvs-upgrade-v19-v20-codemod'

const FILES_TO_CHECKOUT = [
  'src/analytics/analytics.ts',
  'Dockerfile',
  'Dockerfile.assets'
]

// ─── Git helpers ─────────────────────────────────────────────────────────────

/**
 * Runs a git command in the country config working directory.
 *
 * By default stderr is inherited so the user sees progress output from
 * long-running commands (e.g. `git fetch`). Pass `silent: true` to suppress
 * both stdout and stderr when you only care about the exit code.
 */
export function runGit(
  args: string[],
  { silent = false }: { silent?: boolean } = {}
): string {
  return execFileSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: silent ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'pipe', 'inherit']
  })
}

/**
 * Runs a git command and returns true on success, false on failure.
 * Stderr/stdout are suppressed — use only when the exit code is the only
 * signal you care about.
 */
export function tryGit(args: string[]): boolean {
  try {
    runGit(args, { silent: true })
    return true
  } catch {
    return false
  }
}

export function assertIsGitRepo(): void {
  if (!tryGit(['rev-parse', '--is-inside-work-tree'])) {
    throw new Error(
      `${process.cwd()} is not a git repository. Initialise git (or run the upgrade inside a git checkout) before re-running.`
    )
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(
    `Checking out ${FILES_TO_CHECKOUT.length} file(s) from ${UPSTREAM_URL}@${UPSTREAM_BRANCH}...\n`
  )

  assertIsGitRepo()

  // Best-effort cleanup of a stale temp remote from a previous aborted run.
  tryGit(['remote', 'remove', TEMP_REMOTE])

  try {
    console.log(`  Adding temporary remote '${TEMP_REMOTE}' → ${UPSTREAM_URL}`)
    runGit(['remote', 'add', TEMP_REMOTE, UPSTREAM_URL], { silent: true })

    console.log(`  Fetching ${TEMP_REMOTE}/${UPSTREAM_BRANCH} (depth 1)...`)
    runGit(['fetch', '--depth=1', TEMP_REMOTE, UPSTREAM_BRANCH])

    const ref = `${TEMP_REMOTE}/${UPSTREAM_BRANCH}`
    const missing: string[] = []
    let checkedOut = 0

    for (const file of FILES_TO_CHECKOUT) {
      // `--` separates paths from refs and avoids ambiguity when a path
      // happens to match a branch/tag name.
      if (tryGit(['checkout', ref, '--', file])) {
        console.log(`  Checked out ${file} from ${ref}`)
        checkedOut++
      } else {
        console.warn(
          `  [warn] ${file} not found on ${ref} — skipping. Verify the path exists on that branch.`
        )
        missing.push(file)
      }
    }

    console.log(
      `\n  Checked out ${checkedOut}/${FILES_TO_CHECKOUT.length} file(s) from ${ref}.`
    )

    if (missing.length > 0) {
      console.warn(`  Missing on upstream branch: ${missing.join(', ')}`)
    }

    if (checkedOut > 0) {
      console.log(
        `  Review the staged changes with: git diff --cached -- ${FILES_TO_CHECKOUT.map(
          (f) => `'${f}'`
        ).join(' ')}\n`
      )
    }
  } finally {
    if (tryGit(['remote', 'remove', TEMP_REMOTE])) {
      console.log(`  Removed temporary remote '${TEMP_REMOTE}'.`)
    }
  }
}

export { main }
