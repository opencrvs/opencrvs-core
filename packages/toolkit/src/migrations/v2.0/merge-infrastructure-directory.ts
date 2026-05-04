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
 * Codemod: Merge upstream changes into the local `infrastructure/` directory
 * from opencrvs/opencrvs-countryconfig.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/merge-infrastructure-directory.ts
 *
 * What it does:
 *   1. Registers a temporary git remote that points at the canonical
 *      opencrvs-countryconfig repository and fetches both:
 *        - the upstream "theirs" branch (v2.0) → `UPSTREAM_BRANCH`
 *        - the synthetic merge-base branch (latest 1.9 release line)
 *          → `BASE_BRANCH`
 *   2. For every file under `infrastructure/` on upstream "theirs", performs
 *      a file-scoped 3-way merge:
 *        - new file on upstream → checked out and staged
 *        - existing file       → 3-way merged in place via `git merge-file`,
 *                                using the BASE_BRANCH version of the file
 *                                as the ancestor (or an empty file if the
 *                                base doesn't have it)
 *      Files local to the country config that don't exist on upstream are
 *      left untouched.
 *   3. Cleanly merged files are staged. Files with conflicts are left in the
 *      working tree with standard <<<<<<< / ======= / >>>>>>> markers and
 *      MUST be resolved manually by the developer.
 *   4. Removes the temporary remote in all cases (success, failure, or
 *      unexpected error) via a `finally` block.
 *
 * Why a content-based synthetic merge-base instead of `git merge-base`:
 *   - Country config repos rarely share git history with
 *     opencrvs-countryconfig (squashed forks, template-cloned repos, etc.),
 *     so `git merge-base HEAD upstream/develop` typically returns nothing.
 *   - With no merge-base, a 3-way merge degenerates to a 2-way diff against
 *     an empty file — every line that differs becomes a conflict.
 *   - `release-v1.9` is the latest 1.9.x release line on upstream and is a
 *     near-perfect representation of "what `infrastructure/` looked like
 *     before v2.0", regardless of whether the fork's git history reaches it.
 *   - For files the country config never modified relative to that baseline,
 *     `git merge-file` resolves cleanly to upstream's v2.0 version. Conflicts
 *     are produced only where local edits genuinely overlap with v1.9 → v2.0
 *     upstream edits — which is what the developer needs to review anyway.
 *
 * Why per-file merge instead of a real `git merge`:
 *   - Limits the blast radius to `infrastructure/` only — no other paths
 *     are touched.
 *   - Doesn't put the repository into an in-progress merge state
 *     (no MERGE_HEAD), so subsequent codemods/commands behave normally.
 *   - Works regardless of whether the local repo shares history with
 *     opencrvs-countryconfig.
 *
 * Caveats:
 *   - Local edits to merged files may be overwritten where they overlap
 *     with upstream changes. Run on a clean working tree.
 *   - Requires git to be installed and network access to github.com.
 *   - Requires the country config working directory to be a git repo.
 *   - Binary files in `infrastructure/` are not merged textually; if both
 *     sides changed a binary file, the result will be invalid and a warning
 *     is printed.
 *   - Forks that are on a much older 1.9.x and never merged later 1.9 patches
 *     may see a few extra conflicts on files where 1.9.x → release-v1.9
 *     patches and v1.9 → v2.0 changes textually overlap.
 */

import { execFileSync } from 'child_process'
import { existsSync, mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  assertIsGitRepo,
  runGit,
  tryGit,
  UPSTREAM_BRANCH,
  UPSTREAM_URL
} from './checkout-upstream-files'

// Distinct from the remote used by `checkout-upstream-files` so that a stale
// remote left behind by an aborted run of one codemod doesn't trip up the
// other.
const TEMP_REMOTE = 'opencrvs-upgrade-v19-v20-codemod-merge-infra'

const INFRASTRUCTURE_DIR = 'infrastructure'

// Synthetic merge-base: the tip of upstream's latest 1.9.x release line.
// We use this branch's content as the "common ancestor" for every file,
// since most country forks don't share git history with upstream.
const BASE_BRANCH = 'release-v1.9'

/**
 * Reads `git show <ref>:<path>` as a Uint8Array (binary-safe).
 * Returns `null` if the path doesn't exist at that ref.
 */
function gitShowBytes(ref: string, path: string): Uint8Array | null {
  try {
    const buf = execFileSync('git', ['show', `${ref}:${path}`], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    })
    // Return a plain Uint8Array view to satisfy strict typings of `fs`
    // (which want `ArrayBufferView`, not Node's `Buffer` subtype).
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  } catch {
    return null
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(
    `Merging '${INFRASTRUCTURE_DIR}/' from ${UPSTREAM_URL}@${UPSTREAM_BRANCH} (base: ${BASE_BRANCH})...\n`
  )

  assertIsGitRepo()

  // Best-effort cleanup of a stale temp remote from a previous aborted run.
  tryGit(['remote', 'remove', TEMP_REMOTE])

  try {
    console.log(`  Adding temporary remote '${TEMP_REMOTE}' → ${UPSTREAM_URL}`)
    runGit(['remote', 'add', TEMP_REMOTE, UPSTREAM_URL], { silent: true })

    // Fetch both branches at depth=1 — we only need their tip contents,
    // not their history (the merge is content-based, not history-based).
    console.log(
      `  Fetching ${TEMP_REMOTE}/{${UPSTREAM_BRANCH},${BASE_BRANCH}} (depth 1)...`
    )
    runGit(['fetch', '--depth=1', TEMP_REMOTE, UPSTREAM_BRANCH, BASE_BRANCH])

    const ref = `${TEMP_REMOTE}/${UPSTREAM_BRANCH}`
    const baseRef = `${TEMP_REMOTE}/${BASE_BRANCH}`

    // -z gives NUL-separated paths so filenames with spaces or newlines
    // survive the round-trip.
    const upstreamFiles = runGit(
      [
        'ls-tree',
        '-r',
        '--name-only',
        '-z',
        ref,
        '--',
        `${INFRASTRUCTURE_DIR}/`
      ],
      { silent: true }
    )
      .split('\0')
      .filter(Boolean)

    if (upstreamFiles.length === 0) {
      console.log(
        `  No files found under '${INFRASTRUCTURE_DIR}/' on ${ref}. Nothing to merge.`
      )
      return
    }

    const tmpDir = mkdtempSync(join(tmpdir(), 'opencrvs-merge-infra-'))
    const baseTmp = join(tmpDir, 'base')
    const theirsTmp = join(tmpDir, 'theirs')

    let added = 0
    let merged = 0
    const conflictedFiles: string[] = []

    for (const file of upstreamFiles) {
      const fullPath = join(process.cwd(), file)

      if (!existsSync(fullPath)) {
        // New upstream file — `git checkout` handles binary correctly and
        // stages the result, matching the UX of `checkout-upstream-files`.
        if (tryGit(['checkout', ref, '--', file])) {
          console.log(`  + ${file} (new from upstream)`)
          added++
        } else {
          console.warn(`  [warn] failed to add new file ${file}`)
        }
        continue
      }

      const theirContents = gitShowBytes(ref, file)
      if (theirContents === null) {
        // Shouldn't happen — `ls-tree` just told us the file is there.
        console.warn(`  [warn] could not read ${file} from ${ref} — skipping.`)
        continue
      }
      writeFileSync(theirsTmp, theirContents)

      // Pull the base version from upstream's latest 1.9 release line. If
      // the file didn't exist there yet (added in v2.0), fall back to an
      // empty base — `git merge-file` will then treat any local content as
      // a local addition.
      const baseContents = gitShowBytes(baseRef, file)
      writeFileSync(baseTmp, baseContents ?? new Uint8Array(0))

      // `git merge-file` does an in-place 3-way merge. Exit codes:
      //   0       → clean merge
      //   1..N    → that many conflicts; markers written into the file
      //   <0/127  → error (e.g. binary file rejected)
      try {
        execFileSync('git', ['merge-file', fullPath, baseTmp, theirsTmp], {
          cwd: process.cwd(),
          stdio: ['ignore', 'pipe', 'pipe']
        })
        runGit(['add', '--', file], { silent: true })
        merged++
      } catch (err) {
        const status = (err as { status?: number | null }).status
        if (typeof status === 'number' && status > 0) {
          conflictedFiles.push(file)
          console.warn(
            `  ! ${file} (${status} conflict${status > 1 ? 's' : ''})`
          )
        } else {
          conflictedFiles.push(file)
          console.warn(
            `  [warn] merge failed for ${file} (likely binary or unreadable) — left untouched.`
          )
        }
      }
    }

    console.log(
      `\n  Done. ${added} added, ${merged} merged cleanly, ${conflictedFiles.length} with conflicts.`
    )

    if (conflictedFiles.length > 0) {
      console.warn(
        `\n  NOTE: ${conflictedFiles.length} file(s) under '${INFRASTRUCTURE_DIR}/' have merge conflicts that you must resolve manually.\n` +
          `        Look for the standard conflict markers (<<<<<<<, =======, >>>>>>>) in:\n` +
          conflictedFiles.map((f) => `          - ${f}`).join('\n') +
          `\n        After resolving, stage the fixes with: git add ${INFRASTRUCTURE_DIR}/`
      )
    }
  } finally {
    if (tryGit(['remote', 'remove', TEMP_REMOTE])) {
      console.log(`  Removed temporary remote '${TEMP_REMOTE}'.`)
    }
  }
}

export { main }
