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
 * Codemod: move `infrastructure/` into the v2.1 `assets/` directory, merging
 * the country's changes with the template's.
 *
 * The assets image (Dockerfile.assets) is now built from `assets/` with a
 * single `COPY assets /assets`, and the charts copy `/assets/metabase`,
 * `/assets/postgres` and `/assets/elasticsearch` out of it.
 *
 * What it does, for every file under `infrastructure/{metabase,postgres,
 * deployment,elasticsearch}/` and the template's `assets/`, going to the same
 * path under `assets/`:
 *   - template only                  → copied from the template
 *   - unchanged since v2.0           → the template's version (or dropped,
 *                                      when the template no longer has it)
 *   - changed by the country only    → the country's version
 *   - changed on both sides          → 3-way merged (`git merge-file`), with
 *                                      conflict markers left for review
 *   - country only                   → moved across as is
 * The v2.0 version of each file, used as the merge base, is read from
 * opencrvs-farajaland's release/v2.0.0 on GitHub.
 *
 * `assets/elasticsearch/reindex.sh`, which the reindex job runs, is built from
 * `infrastructure/deployment/reindex.sh` so a customised reindex script
 * carries over.
 *
 * `postgres/on-deploy.sh` is never moved: the data-migration-analytics job
 * runs every `*.sh` in `/assets/postgres`, and the chart ships its own
 * on-deploy script. The v2.0 Dockerfile.assets deleted it from the image for
 * the same reason.
 *
 * Then `Dockerfile.assets` is replaced with the template's, the migrated files
 * are removed from `infrastructure/` (kept with `--docker-swarm`), and the
 * result is staged. Files with conflicts are left unstaged. Anything else in
 * `infrastructure/`, such as Docker Swarm configuration, is left in place.
 *
 * Caveats:
 *   - Existing files under `assets/` are never overwritten, so running it
 *     again, or after migrating by hand, leaves them alone. The
 *     `infrastructure/` original is then only removed when identical.
 *   - Binary files changed by the country keep the country's version.
 *   - Requires network access to raw.githubusercontent.com. Without it
 *     nothing is changed and the step is reported as skipped.
 */

import { execFileSync } from 'child_process'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  statSync,
  writeFileSync
} from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { assertIsGitRepo, tryGit } from '../v2.0/checkout-upstream-files'
import { findTemplateDir, listFiles } from './template-files'

const INFRASTRUCTURE_DIR = 'infrastructure'
const ASSETS_DIR = 'assets'

const BASE_URL =
  'https://raw.githubusercontent.com/opencrvs/opencrvs-farajaland/release/v2.0.0/infrastructure'

/** Assets built from a differently named v2.0 file, when not present themselves. */
const SOURCE_OF: Record<string, string> = {
  'elasticsearch/reindex.sh': 'deployment/reindex.sh'
}

/**
 * What the assets image needs. The rest of `infrastructure/` (Docker Swarm
 * compose files, server setup and so on) is left where it is.
 */
const MIGRATED_DIRS = ['metabase', 'postgres', 'deployment', 'elasticsearch']

/** Never moved into `assets/`. */
const NOT_MOVED = ['postgres/on-deploy.sh']

export const isMigrated = (file: string) =>
  MIGRATED_DIRS.some((dir) => file.startsWith(`${dir}/`))

type Outcome =
  | 'copied'
  | 'kept'
  | 'merged'
  | 'conflict'
  | 'dropped'
  | 'exists'
  | 'exists-differs'
  | 'not-moved'

export interface AssetsMigrationResult {
  /** Paths relative to `assets/`, by what happened to them. */
  outcomes: Record<string, Outcome>
  /** Paths relative to `infrastructure/` that can be removed. */
  migrated: string[]
}

export type ReadBase = (file: string) => Uint8Array | undefined

/*
 * Plain Uint8Array rather than Buffer: the repository's Node typings reject a
 * Buffer where fs expects an ArrayBufferView.
 */
const toBytes = (buffer: Buffer) =>
  new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)

const sameBytes = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((byte, index) => byte === b[index])

const isBinary = (contents: Uint8Array) => contents.includes(0)

function readIfExists(file: string) {
  return existsSync(file) ? toBytes(readFileSync(file)) : undefined
}

/** 3-way merge of text contents. `conflicts` is 0 for a clean merge. */
export function mergeFile(
  file: string,
  ours: Uint8Array,
  base: Uint8Array,
  theirs: Uint8Array
) {
  const dir = mkdtempSync(path.join(tmpdir(), 'opencrvs-merge-assets-'))

  try {
    const [oursPath, basePath, theirsPath] = ['ours', 'base', 'theirs'].map(
      (name) => path.join(dir, name)
    )
    writeFileSync(oursPath, ours)
    writeFileSync(basePath, base)
    writeFileSync(theirsPath, theirs)

    const args = [
      'merge-file',
      '-p',
      '-L',
      `infrastructure/${file}`,
      '-L',
      'v2.0',
      '-L',
      `v2.1 template`,
      oursPath,
      basePath,
      theirsPath
    ]

    try {
      return { contents: toBytes(execFileSync('git', args)), conflicts: 0 }
    } catch (error) {
      const { status, stdout } = error as { status: number; stdout: Buffer }

      // git merge-file exits with the number of conflicts, or 255 on error
      if (status > 0 && status < 255) {
        return { contents: toBytes(stdout), conflicts: status }
      }
      throw error
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** Every v2.0 file the migration needs as a merge base, fetched up front. */
export async function fetchBases(files: string[]) {
  const bases = new Map<string, Uint8Array>()

  for (const file of files) {
    const url = `${BASE_URL}/${file}`
    const response = await fetch(url)

    if (response.ok) {
      bases.set(file, new Uint8Array(await response.arrayBuffer()))
    } else if (response.status !== 404) {
      // 404 means the file is the country's own; anything else would merge
      // against a missing base, so give up before touching anything
      throw new Error(
        `GitHub answered ${response.status} ${response.statusText} for ${url}`
      )
    }
  }

  return bases
}

export function migrateInfrastructureToAssets(
  cwd: string,
  templateDir: string,
  readBase: ReadBase
): AssetsMigrationResult {
  const infrastructure = path.join(cwd, INFRASTRUCTURE_DIR)
  const templateAssets = path.join(templateDir, ASSETS_DIR)

  const relativeTo = (dir: string) => (file: string) =>
    file.slice(dir.length + 1)

  const localFiles = listFiles(cwd, INFRASTRUCTURE_DIR)
    .map(relativeTo(INFRASTRUCTURE_DIR))
    .filter(isMigrated)
  const templateFiles = listFiles(templateDir, ASSETS_DIR).map(
    relativeTo(ASSETS_DIR)
  )

  const outcomes: Record<string, Outcome> = {}
  const migrated = new Set<string>()

  for (const file of [...new Set([...templateFiles, ...localFiles])].sort()) {
    const sourceFile =
      !localFiles.includes(file) && localFiles.includes(SOURCE_OF[file])
        ? SOURCE_OF[file]
        : file

    const ours = readIfExists(path.join(infrastructure, sourceFile))
    const theirsPath = path.join(templateAssets, file)
    const theirs = readIfExists(theirsPath)
    const base = ours && readBase(sourceFile)
    const target = path.join(cwd, ASSETS_DIR, file)

    if (NOT_MOVED.includes(file)) {
      if (ours && base && sameBytes(ours, base)) {
        migrated.add(file)
        outcomes[file] = 'dropped'
      } else if (ours) {
        outcomes[file] = 'not-moved'
      }
      continue
    }

    const ownsSource = ours !== undefined && sourceFile === file

    if (existsSync(target)) {
      // Migrated before (a re-run, or by hand): only remove the original
      // when nothing in it would be lost
      if (ownsSource) {
        const same = sameBytes(toBytes(readFileSync(target)), ours)
        if (same) {
          migrated.add(file)
        }
        outcomes[file] = same ? 'exists' : 'exists-differs'
      }
      continue
    }

    if (ownsSource) {
      migrated.add(file)
    }

    let contents: Uint8Array | undefined
    let outcome: Outcome

    if (!ours) {
      contents = theirs
      outcome = 'copied'
    } else if (!theirs) {
      const unchanged = base && sameBytes(ours, base)
      contents = unchanged ? undefined : ours
      outcome = unchanged ? 'dropped' : 'kept'
    } else if (sameBytes(ours, theirs) || (base && sameBytes(ours, base))) {
      contents = theirs
      outcome = 'copied'
    } else if (!base || sameBytes(base, theirs) || isBinary(ours)) {
      contents = ours
      outcome = 'kept'
    } else {
      const result = mergeFile(sourceFile, ours, base, theirs)
      contents = result.contents
      outcome = result.conflicts > 0 ? 'conflict' : 'merged'
    }

    outcomes[file] = outcome

    if (contents === undefined) {
      continue
    }

    mkdirSync(path.dirname(target), { recursive: true })
    writeFileSync(target, contents)

    const modeSource =
      ours && outcome === 'kept'
        ? path.join(infrastructure, sourceFile)
        : theirsPath
    if (existsSync(modeSource)) {
      chmodSync(target, statSync(modeSource).mode & 0o777)
    }
  }

  return { outcomes, migrated: [...migrated].sort() }
}

/** Removes migrated files and any directories they leave empty. */
export function removeMigrated(cwd: string, migrated: string[]) {
  const infrastructure = path.join(cwd, INFRASTRUCTURE_DIR)

  for (const file of migrated) {
    rmSync(path.join(infrastructure, file), { force: true })
  }

  const pruneEmpty = (dir: string): boolean => {
    if (!existsSync(dir)) {
      return true
    }
    const empty = readdirSync(dir, { withFileTypes: true })
      .map((entry) =>
        entry.isDirectory() ? pruneEmpty(path.join(dir, entry.name)) : false
      )
      .every(Boolean)

    if (empty) {
      rmdirSync(dir)
    }
    return empty
  }

  pruneEmpty(infrastructure)
}

const DESCRIPTIONS: Record<Outcome, string> = {
  copied: 'from the template',
  kept: "country's version",
  merged: 'merged',
  conflict: 'CONFLICT, resolve the markers by hand',
  dropped: 'dropped, no longer used',
  exists: 'already migrated',
  'exists-differs':
    'already exists with different contents; infrastructure/ copy kept for review',
  'not-moved':
    'changed locally but not moved: the chart runs its own on-deploy script, port your changes there'
}

async function main(dockerSwarm = false) {
  const cwd = process.cwd()
  console.log('Moving infrastructure/ into assets/...\n')

  const templateDir = findTemplateDir()

  if (existsSync(path.join(cwd, INFRASTRUCTURE_DIR))) {
    assertIsGitRepo()

    const needed = listFiles(cwd, INFRASTRUCTURE_DIR)
      .map((file) => file.slice(INFRASTRUCTURE_DIR.length + 1))
      .filter(isMigrated)

    let bases: Map<string, Uint8Array>
    try {
      bases = await fetchBases(needed)
    } catch (error) {
      console.warn(
        `  ⚠️  Could not read the v2.0 files to merge against (${(error as Error).message}); infrastructure/ was not migrated. Re-run 'opencrvs upgrade' with network access.`
      )
      return
    }

    const { outcomes, migrated } = migrateInfrastructureToAssets(
      cwd,
      templateDir,
      (file) => bases.get(file)
    )

    for (const [file, outcome] of Object.entries(outcomes)) {
      const needsReview = ['conflict', 'not-moved', 'exists-differs'].includes(
        outcome
      )
      const shown = outcome === 'not-moved' ? INFRASTRUCTURE_DIR : ASSETS_DIR
      const line = `  ${needsReview ? '⚠️ ' : '✓'} ${shown}/${file}: ${DESCRIPTIONS[outcome]}`
      if (needsReview) {
        console.warn(line)
      } else {
        console.log(line)
      }
    }

    if (dockerSwarm) {
      console.log(
        '\n  infrastructure/ kept in place (--docker-swarm); assets/ now holds a copy.'
      )
    } else {
      removeMigrated(cwd, migrated)
    }

    tryGit(['add', '-A', '--', ASSETS_DIR, INFRASTRUCTURE_DIR])

    const conflicts = Object.keys(outcomes).filter(
      (file) => outcomes[file] === 'conflict'
    )
    for (const file of conflicts) {
      tryGit(['restore', '--staged', '--', `${ASSETS_DIR}/${file}`])
    }
    if (conflicts.length > 0) {
      console.warn(
        `\n  ⚠️  ${conflicts.length} file(s) need their conflicts resolved: ${conflicts.map((file) => `assets/${file}`).join(', ')}`
      )
    }
    if (existsSync(path.join(cwd, INFRASTRUCTURE_DIR)) && !dockerSwarm) {
      console.warn(
        '  ⚠️  infrastructure/ still has files the Kubernetes deployment does not use. Review and delete them if they are no longer needed.'
      )
    }
  } else {
    console.log('  infrastructure/ not found, nothing to move.')
  }

  const dockerfile = toBytes(
    readFileSync(path.join(templateDir, 'Dockerfile.assets'))
  )
  const current = readIfExists(path.join(cwd, 'Dockerfile.assets'))
  if (!current || !sameBytes(current, dockerfile)) {
    writeFileSync(path.join(cwd, 'Dockerfile.assets'), dockerfile)
    tryGit(['add', '--', 'Dockerfile.assets'])
    console.log('  ✓ Dockerfile.assets replaced with the template version')
  }
}

export { main }
