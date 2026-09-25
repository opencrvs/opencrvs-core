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
 * Codemod: move what is left of `infrastructure/` to `assets/`, the layout the
 * v2.1 country config template has.
 *
 * The v2.0 upgrade deleted `infrastructure/` down to the Metabase and Postgres
 * scripts that Kubernetes deployments bake into the countryconfig assets
 * image. The v2.1 template keeps them under `assets/`, and its
 * `Dockerfile.assets` copies that directory into the image as it is — so the
 * paths here are the paths the Helm charts read (`/assets/metabase/...`,
 * `/assets/elasticsearch/reindex.sh`).
 *
 * What it does:
 *   1. Deletes `infrastructure/postgres/on-deploy.sh`. It is the Docker Swarm
 *      on-deploy script — the charts ship their own — and the v2.0
 *      `Dockerfile.assets` removed it from the image for that reason. Copying
 *      `assets/` whole would put it back.
 *   2. Moves `infrastructure/metabase/` and `infrastructure/postgres/` to
 *      `assets/`, and `infrastructure/deployment/reindex.sh` to
 *      `assets/elasticsearch/reindex.sh`, where the v2.0 `Dockerfile.assets`
 *      put it in the image. Untracked files (the local Metabase data) move
 *      along.
 *   3. Rewrites the moved paths in the `package.json` scripts.
 *   4. Lists the other files that still mention the old paths.
 *
 * Caveats:
 *   - Not run with `--docker-swarm`: Swarm deployments mount these scripts
 *     from `infrastructure/`.
 *   - A file whose destination already exists with other contents stays where
 *     it is, with a warning.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmdirSync,
  statSync,
  unlinkSync
} from 'fs'
import path from 'path'
import {
  findTrackedReferences,
  readPackageJson,
  writePackageJson
} from './countryconfig-template'

export type Move = { from: string; to: string }

export const MOVES: Move[] = [
  { from: 'infrastructure/metabase', to: 'assets/metabase' },
  { from: 'infrastructure/postgres', to: 'assets/postgres' },
  {
    from: 'infrastructure/deployment/reindex.sh',
    to: 'assets/elasticsearch/reindex.sh'
  }
]

const SWARM_ONLY_FILES = ['infrastructure/postgres/on-deploy.sh']

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Rewrites the relative paths `moves` moved in a shell command. Only paths
 * relative to the repository root are touched — `./infrastructure/...` or
 * `infrastructure/...` starting a word — so an absolute Swarm mount such as
 * `/opt/opencrvs/infrastructure/metabase` is left alone.
 */
export function rewriteMovedPaths(command: string, moves: Move[]): string {
  return moves.reduce(
    (result, { from, to }) =>
      result.replace(
        new RegExp(
          `(^|[\\s'"=(<>])(\\./)?${escapeRegExp(from)}(?=[/\\s'";)&|]|$)`,
          'g'
        ),
        `$1$2${to}`
      ),
    command
  )
}

function filesUnder(root: string): string[] {
  if (!statSync(root).isDirectory()) {
    return ['']
  }

  return readdirSync(root).flatMap((name) =>
    filesUnder(path.join(root, name)).map((file) => path.join(name, file))
  )
}

/** Removes `dir` and its parents up to `stopAt` for as long as they are empty. */
function removeEmptyDirs(dir: string, stopAt: string) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    return
  }

  for (const name of readdirSync(dir)) {
    removeEmptyDirs(path.join(dir, name), stopAt)
  }

  let current = dir
  while (
    current.startsWith(stopAt) &&
    existsSync(current) &&
    readdirSync(current).length === 0
  ) {
    rmdirSync(current)
    current = path.dirname(current)
  }
}

/**
 * Moves `from` to `to` file by file. Returns true when nothing is left behind.
 */
function move(cwd: string, { from, to }: Move): boolean {
  const source = path.join(cwd, from)

  if (!existsSync(source)) {
    return true
  }

  let conflicts = 0

  for (const file of filesUnder(source)) {
    const sourceFile = path.join(source, file)
    const destination = path.join(cwd, to, file)

    if (existsSync(destination)) {
      // latin1 maps every byte to one character, so this compares bytes
      if (
        readFileSync(destination, 'latin1') ===
        readFileSync(sourceFile, 'latin1')
      ) {
        unlinkSync(sourceFile)
        continue
      }

      conflicts++
      console.warn(
        `  ⚠️  ${path.join(from, file)} was not moved: ${path.join(to, file)} already exists with other contents. Merge them by hand.`
      )
      continue
    }

    mkdirSync(path.dirname(destination), { recursive: true })
    renameSync(sourceFile, destination)
  }

  removeEmptyDirs(source, path.join(cwd, 'infrastructure'))

  if (conflicts === 0) {
    console.log(`  ✓ Moved ${from} -> ${to}`)
  }

  return conflicts === 0
}

function rewritePackageJsonScripts(cwd: string, moves: Move[]) {
  const packageJson = readPackageJson(cwd)

  if (!packageJson?.scripts) {
    return
  }

  let changed = false

  for (const [name, command] of Object.entries(packageJson.scripts)) {
    const rewritten = rewriteMovedPaths(command, moves)

    if (rewritten !== command) {
      packageJson.scripts[name] = rewritten
      changed = true
      console.log(`  ✓ package.json: scripts.${name}`)
    }
  }

  if (changed) {
    writePackageJson(cwd, packageJson)
  }
}

async function main(): Promise<void> {
  const cwd = process.cwd()

  console.log('\nMoving infrastructure/ to assets/...\n')

  const pending = MOVES.filter(({ from }) => existsSync(path.join(cwd, from)))

  if (pending.length === 0) {
    console.log('  Nothing to move — infrastructure/ is already gone.')
    return
  }

  for (const file of SWARM_ONLY_FILES) {
    if (existsSync(path.join(cwd, file))) {
      unlinkSync(path.join(cwd, file))
      console.log(`  ✓ Deleted ${file} (Docker Swarm only)`)
    }
  }

  const moved = pending.filter((entry) => move(cwd, entry))

  rewritePackageJsonScripts(cwd, moved)

  const leftovers = findTrackedReferences(
    cwd,
    moved.map(({ from }) => escapeRegExp(from)),
    ['CHANGELOG.md', 'Tiltfile', 'Dockerfile.assets']
  )

  if (leftovers.length > 0) {
    console.warn(
      `\n  ⚠️  These lines still mention the old paths. Update them if they refer to this repository:`
    )
    for (const line of leftovers) {
      console.warn(`    ${line}`)
    }
  }
}

export { main }
