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

// Finds where a package is installed, from a pnpm v9 lockfile that is
// already converted to JSON. The script reads only the lockfile, so the job
// does not need to run `pnpm install`.
//
// loadLockfile() reads the lockfile and builds the dependency graph once.
// usageOf() then answers for each package from that graph.
//
// Usage: node dependency-chains.mjs <lockfile.json> <package-name> [<lockfile-label>]
// Prints JSON: one entry for each installed version of the package, with the
// workspace packages that reach it and some example chains.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_CHAINS_PER_VERSION = 8
const MAX_CHAIN_LENGTH = 12

const DEPENDENCY_KINDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies'
]

/** "glob@10.5.0(supports-color@8.1.1)" -> "glob" */
function nameOfSnapshot(key) {
  const at = key.indexOf('@', 1)
  return at === -1 ? key : key.slice(0, at)
}

/** "glob@10.5.0(supports-color@8.1.1)" -> "10.5.0" */
function versionOfSnapshot(key) {
  const at = key.indexOf('@', 1)
  const rest = key.slice(at + 1)
  const peers = rest.indexOf('(')
  return peers === -1 ? rest : rest.slice(0, peers)
}

/**
 * A lockfile reference is a version ("10.5.0(peer@1)"), or an alias
 * ("string-width@4.2.3") when the package is installed under another name.
 */
function snapshotKeyOf(name, reference) {
  if (reference.startsWith('link:') || reference.startsWith('file:')) {
    return null
  }
  const at = reference.indexOf('@', 1)
  const looksLikeAlias = at > 0 && !/^\d/.test(reference)
  return looksLikeAlias ? reference : `${name}@${reference}`
}

/**
 * True when the pnpm override key applies to the package. A key is
 * "<name>[@<range>]", and it can start with parent selectors such as
 * "node-gyp>". A range can hold ">=", so ">" before "=" is not a separator.
 */
function overrideTargets(key, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|>(?!=))${escaped}(@(?:[^>]|>=)*)?$`).test(key)
}

/**
 * Reads the lockfile at `path`. `label` is the path of the lockfile in the
 * repository. The importers are given relative to the repository root, so
 * the root package "." of `packages/countryconfig-template/pnpm-lock.yaml`
 * is `packages/countryconfig-template`.
 */
export function loadLockfile(path, label = 'pnpm-lock.yaml') {
  const lockfile = JSON.parse(readFileSync(path, 'utf8'))
  const lockfileDir = dirname(label)

  function importerPath(importer) {
    return join(lockfileDir, importer || '.')
  }

  // Reverse edges: child snapshot key -> list of parents.
  // A parent is { snapshot } or { importer, kind }.
  const parentsOf = new Map()

  function addParent(child, parent) {
    if (!child) {
      return
    }
    const parents = parentsOf.get(child) ?? []
    parents.push(parent)
    parentsOf.set(child, parents)
  }

  for (const [importer, sections] of Object.entries(lockfile.importers ?? {})) {
    for (const kind of DEPENDENCY_KINDS) {
      for (const [name, entry] of Object.entries(sections[kind] ?? {})) {
        addParent(snapshotKeyOf(name, entry.version), {
          importer: importerPath(importer),
          kind
        })
      }
    }
  }

  for (const [key, snapshot] of Object.entries(lockfile.snapshots ?? {})) {
    for (const kind of ['dependencies', 'optionalDependencies']) {
      for (const [name, reference] of Object.entries(snapshot[kind] ?? {})) {
        addParent(snapshotKeyOf(name, reference), { snapshot: key })
      }
    }
  }

  /**
   * Breadth-first walk from one snapshot up to the workspace packages.
   * The walk is breadth-first so that the shortest chains come first.
   * The walk finds all the workspace packages. Only the stored example
   * chains have a maximum length.
   */
  function chainsTo(targetKey) {
    const chains = []
    const importers = new Map()
    const queue = [[targetKey]]
    const visited = new Set([targetKey])

    while (queue.length > 0) {
      const path = queue.shift()
      for (const parent of parentsOf.get(path[0]) ?? []) {
        if (parent.importer) {
          const kinds = importers.get(parent.importer) ?? new Set()
          kinds.add(parent.kind)
          importers.set(parent.importer, kinds)
          if (
            chains.length < MAX_CHAINS_PER_VERSION &&
            path.length <= MAX_CHAIN_LENGTH
          ) {
            // Remove the peer suffix, "(supports-color@8.1.1)", from each step.
            const steps = path.map((step) => step.replace(/\(.*$/, ''))
            chains.push(
              [`${parent.importer} [${parent.kind}]`, ...steps].join(' > ')
            )
          }
          continue
        }
        // A package can appear in many chains. Visit each package once, so
        // the walk stays fast on a large lockfile.
        if (!visited.has(parent.snapshot)) {
          visited.add(parent.snapshot)
          queue.push([parent.snapshot, ...path])
        }
      }
    }

    return {
      workspacePackages: [...importers.entries()].map(([importer, kinds]) => ({
        importer,
        kinds: [...kinds]
      })),
      exampleChains: chains
    }
  }

  function usageOf(packageName) {
    const installed = Object.keys(lockfile.snapshots ?? {}).filter(
      (key) => nameOfSnapshot(key) === packageName
    )

    const byVersion = new Map()
    for (const key of installed) {
      const version = versionOfSnapshot(key)
      const found = chainsTo(key)
      const current = byVersion.get(version) ?? {
        version,
        workspacePackages: [],
        exampleChains: []
      }
      for (const pkg of found.workspacePackages) {
        const existing = current.workspacePackages.find(
          (p) => p.importer === pkg.importer
        )
        if (existing) {
          existing.kinds = [...new Set([...existing.kinds, ...pkg.kinds])]
        } else {
          current.workspacePackages.push(pkg)
        }
      }
      current.exampleChains = [
        ...new Set([...current.exampleChains, ...found.exampleChains])
      ].slice(0, MAX_CHAINS_PER_VERSION)
      byVersion.set(version, current)
    }

    const directDependents = []
    for (const [importer, sections] of Object.entries(
      lockfile.importers ?? {}
    )) {
      for (const kind of DEPENDENCY_KINDS) {
        const entry = sections[kind]?.[packageName]
        if (entry) {
          directDependents.push({
            importer: importerPath(importer),
            kind,
            specifier: entry.specifier,
            version: entry.version
          })
        }
      }
    }

    return {
      lockfile: label,
      package: packageName,
      // Includes scoped overrides such as "node-gyp>glob", and overrides
      // with a version selector such as "glob@<10.5.0".
      overrides: Object.fromEntries(
        Object.entries(lockfile.overrides ?? {}).filter(([key]) =>
          overrideTargets(key, packageName)
        )
      ),
      directDependents,
      installedVersions: [...byVersion.values()]
    }
  }

  return { usageOf }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [lockfilePath, packageName, lockfileLabel] = process.argv.slice(2)
  if (!lockfilePath || !packageName) {
    console.error(
      'usage: dependency-chains.mjs <lockfile.json> <package-name> [<label>]'
    )
    process.exit(2)
  }
  console.log(
    JSON.stringify(
      loadLockfile(lockfilePath, lockfileLabel).usageOf(packageName),
      null,
      2
    )
  )
}
