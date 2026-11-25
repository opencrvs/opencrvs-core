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
 * Codemod: bring the country config's package.json in line with the toolkit
 * running the upgrade.
 *
 * What it does:
 *   1. Sets `version` and the `@opencrvs/toolkit` dependency to the version of
 *      the toolkit being run. On a released version the two always match.
 *   2. Points script paths under `infrastructure/` at `assets/`, where the
 *      file now lives.
 *   3. Removes scripts that run a file which exists in neither directory,
 *      e.g. `snapshot` or `environment:init`, whose scripts were Docker Swarm
 *      only. GitHub environments are managed with `opencrvs environment`
 *      from the infrastructure repository.
 *
 * Runs after `infrastructure/` has been migrated (and possibly deleted), so a
 * script is only removed when its file is really gone.
 *
 * Caveats:
 *   - Only plain file paths are checked. Globs and bare directories such as
 *     `infrastructure/` are left alone.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

const TOOLKIT = '@opencrvs/toolkit'

/** `infrastructure/x` or `assets/x` as a word of a script, optionally `./`-prefixed. */
const PATH_PATTERN =
  /(^|[\s"'=<>(])(\.\/)?(infrastructure|assets)\/([^\s"'&|;<>()]+)/g

const GLOB = /[*?{}[\]]/

/** `yarn x`, `pnpm x`, `pnpm run x`, `npm run x`. */
const SCRIPT_CALL = /(?:^|[\s;&|(])(?:yarn|pnpm|npm)\s+(?:run\s+)?([\w:.-]+)/g

interface PackageJson {
  version?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  [key: string]: unknown
}

export interface PackageJsonChanges {
  version?: { from?: string; to: string }
  toolkit?: { from?: string; to: string }
  /** Script name → rewritten command. */
  rewritten: Record<string, string>
  /** Script name → the missing file, or removed script, it ran. */
  removed: Record<string, string>
}

/**
 * The scripts with `infrastructure/` paths pointed at `assets/`, without the
 * ones that run a file that no longer exists. `exists` is relative to the
 * country config root.
 */
export function updateScripts(
  scripts: Record<string, string>,
  exists: (file: string) => boolean
) {
  const result: Record<string, string> = {}
  const rewritten: Record<string, string> = {}
  const removed: Record<string, string> = {}

  for (const [name, command] of Object.entries(scripts)) {
    let missing: string | undefined

    const updated = command.replace(
      PATH_PATTERN,
      (match, before: string, dotSlash = '', dir: string, rest: string) => {
        if (GLOB.test(rest)) {
          return match
        }

        const asset = `assets/${rest}`
        if (dir === 'infrastructure' && exists(asset)) {
          return `${before}${dotSlash}${asset}`
        }
        if (!exists(`${dir}/${rest}`)) {
          missing ??= `${dir}/${rest}`
        }
        return match
      }
    )

    if (missing) {
      removed[name] = missing
      continue
    }

    result[name] = updated
    if (updated !== command) {
      rewritten[name] = updated
    }
  }

  // A script calling a removed one would fail too, e.g. `environment:upgrade`
  // running `yarn environment:init`
  let removedAny = Object.keys(removed).length > 0
  while (removedAny) {
    removedAny = false
    for (const [name, command] of Object.entries(result)) {
      const calls = [...command.matchAll(SCRIPT_CALL)].map((m) => m[1])
      const gone = calls.find((script) => script in removed)
      if (gone) {
        removed[name] = `the "${gone}" script`
        delete result[name]
        delete rewritten[name]
        removedAny = true
      }
    }
  }

  return { scripts: result, rewritten, removed }
}

export function updatePackageJson(
  pkg: PackageJson,
  toolkitVersion: string,
  exists: (file: string) => boolean
): { pkg: PackageJson; changes: PackageJsonChanges } {
  const next: PackageJson = { ...pkg }
  const changes: PackageJsonChanges = { rewritten: {}, removed: {} }

  if (pkg.version !== toolkitVersion) {
    next.version = toolkitVersion
    changes.version = { from: pkg.version, to: toolkitVersion }
  }

  const field = pkg.devDependencies?.[TOOLKIT]
    ? 'devDependencies'
    : 'dependencies'
  const current = pkg[field]?.[TOOLKIT]
  if (current !== toolkitVersion) {
    next[field] = { ...pkg[field], [TOOLKIT]: toolkitVersion }
    changes.toolkit = { from: current, to: toolkitVersion }
  }

  if (pkg.scripts) {
    const { scripts, rewritten, removed } = updateScripts(pkg.scripts, exists)
    next.scripts = scripts
    changes.rewritten = rewritten
    changes.removed = removed
  }

  return { pkg: next, changes }
}

/** The version of the toolkit running this code, from its own package.json. */
export function findToolkitVersion(from = __dirname): string {
  let dir = from

  while (true) {
    const candidate = path.join(dir, 'package.json')
    if (existsSync(candidate)) {
      const pkg = JSON.parse(readFileSync(candidate, 'utf8')) as PackageJson
      if (pkg.name === TOOLKIT && pkg.version) {
        return pkg.version
      }
    }

    const parent = path.dirname(dir)
    if (parent === dir) {
      throw new Error(`Could not find the package.json of ${TOOLKIT}`)
    }
    dir = parent
  }
}

function detectIndent(source: string) {
  return source.match(/^[ \t]+(?=")/m)?.[0] ?? 2
}

export async function main(cwd = process.cwd(), toolkitVersion?: string) {
  console.log('\nUpdating package.json...\n')

  const file = path.join(cwd, 'package.json')
  if (!existsSync(file)) {
    console.warn('  ⚠️  package.json not found, nothing to update.')
    return
  }

  const source = readFileSync(file, 'utf8')
  const { pkg, changes } = updatePackageJson(
    JSON.parse(source) as PackageJson,
    toolkitVersion ?? findToolkitVersion(),
    (relative) => existsSync(path.join(cwd, relative))
  )

  const output =
    JSON.stringify(pkg, null, detectIndent(source)) +
    (source.endsWith('\n') ? '\n' : '')

  if (output === source) {
    console.log('  package.json is already up to date.')
    return
  }

  writeFileSync(file, output)

  if (changes.version) {
    console.log(
      `  ✓ version: ${changes.version.from ?? '(none)'} -> ${changes.version.to}`
    )
  }
  if (changes.toolkit) {
    console.log(
      `  ✓ ${TOOLKIT}: ${changes.toolkit.from ?? '(none)'} -> ${changes.toolkit.to}`
    )
  }
  for (const [name, command] of Object.entries(changes.rewritten)) {
    console.log(`  ✓ scripts.${name}: ${command}`)
  }
  for (const [name, missing] of Object.entries(changes.removed)) {
    console.warn(
      `  ⚠️  scripts.${name} removed: it runs ${missing}, which no longer exists`
    )
  }
  if (changes.version || changes.toolkit) {
    console.log('\n  Run your package manager install to update the lockfile.')
  }
}
