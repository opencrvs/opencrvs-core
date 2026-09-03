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
 * Codemod: Rename the `/triggers/...` country config routes to `/trigger/...`.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.1/rename-trigger-paths.ts
 *
 * Why:
 *   The user-notification and system-ready triggers were served under
 *   `/triggers/`, while the event action and telemetry triggers use
 *   `/trigger/`. v2.1 settles on the singular prefix for all of them, so core
 *   now posts to `/trigger/user/*` and gets `/trigger/system/ready`. A route
 *   left on the old path answers 404, which core logs and moves on from — the
 *   notification is simply never sent and the country config's integrations
 *   are never registered. See CHANGELOG.md ("Country config triggers are all
 *   served under /trigger").
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds every object literal that looks like a Hapi route config (a
 *     `method` property holding an HTTP verb, or an array of them, plus a
 *     string-literal `path`)
 *   - Rewrites a `path` starting with any prefix in PATH_PREFIX_RENAMES
 *   - Saves the modified files in-place
 *   - Warns about every remaining `/triggers/` occurrence under `src/`, which
 *     is anything this codemod cannot rewrite safely: a path built from a
 *     template literal or variable, a route config it did not recognise, or a
 *     test that requests the old path
 */

import {
  Node,
  ObjectLiteralExpression,
  Project,
  SourceFile,
  SyntaxKind
} from 'ts-morph'
import path from 'path'

// ─── Path rename table ────────────────────────────────────────────────────────
// Prefixes rather than whole paths: `/triggers/user/` covers one route per
// `TriggerEvent`, and a country config may have added its own.

const PATH_PREFIX_RENAMES: Record<string, string> = {
  '/triggers/user/': '/trigger/user/',
  '/triggers/system/': '/trigger/system/'
}

/** Matched against the remaining source text once the renames are applied. */
const STALE_PREFIX = '/triggers/'

// ─── Constants ────────────────────────────────────────────────────────────────

const METHOD_PROPERTY_NAME = 'method'
const PATH_PROPERTY_NAME = 'path'

const HTTP_VERBS = new Set([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD',
  '*'
])

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true when the given object literal looks like a Hapi route config,
 * i.e. it has a `method` property holding a recognised HTTP verb string (or an
 * array of them) and a string-literal `path` property.
 */
function isRouteConfig(obj: ObjectLiteralExpression): boolean {
  const methodProp = obj.getProperty(METHOD_PROPERTY_NAME)
  if (!methodProp || !Node.isPropertyAssignment(methodProp)) return false

  const methodInit = methodProp.getInitializer()
  if (!methodInit) return false

  if (Node.isStringLiteral(methodInit)) {
    if (!HTTP_VERBS.has(methodInit.getLiteralValue().toUpperCase()))
      return false
  } else if (Node.isArrayLiteralExpression(methodInit)) {
    const allVerbs = methodInit
      .getElements()
      .every(
        (el) =>
          Node.isStringLiteral(el) &&
          HTTP_VERBS.has(el.getLiteralValue().toUpperCase())
      )
    if (!allVerbs) return false
  } else {
    return false
  }

  const pathProp = obj.getProperty(PATH_PROPERTY_NAME)
  if (!pathProp || !Node.isPropertyAssignment(pathProp)) return false

  const pathInit = pathProp.getInitializer()
  return !!pathInit && Node.isStringLiteral(pathInit)
}

/**
 * Applies PATH_PREFIX_RENAMES to the `path` of a confirmed route config.
 * Returns the new path, or null when no prefix matched.
 */
function renameRoutePath(obj: ObjectLiteralExpression): string | null {
  const pathProp = obj.getProperty(PATH_PROPERTY_NAME)
  if (!pathProp || !Node.isPropertyAssignment(pathProp)) return null

  const pathInit = pathProp.getInitializer()
  if (!pathInit || !Node.isStringLiteral(pathInit)) return null

  const oldPath = pathInit.getLiteralValue()
  const match = Object.entries(PATH_PREFIX_RENAMES).find(([from]) =>
    oldPath.startsWith(from)
  )
  if (!match) return null

  const [from, to] = match
  const newPath = to + oldPath.slice(from.length)
  pathInit.replaceWithText(`'${newPath}'`)
  return newPath
}

// ─── File processor ──────────────────────────────────────────────────────────

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let renamedCount = 0
  const relPath = path.relative(process.cwd(), filePath)

  // Collect candidates first to avoid iterating a mutating tree
  const candidates = sourceFile.getDescendantsOfKind(
    SyntaxKind.ObjectLiteralExpression
  )

  for (const obj of candidates) {
    if (!isRouteConfig(obj)) continue

    const newPath = renameRoutePath(obj)
    if (newPath) {
      renamedCount++
      console.log(`  [${relPath}] Renamed route path → '${newPath}'`)
    }
  }

  return renamedCount
}

/**
 * Reports leftover `/triggers/` occurrences. Rewriting these is guesswork —
 * the path may be assembled at runtime — but leaving them unmentioned would
 * hide a route that still answers on the old path.
 */
function warnAboutStalePaths(sourceFiles: readonly SourceFile[]) {
  const stale: string[] = []

  for (const sourceFile of sourceFiles) {
    const relPath = path.relative(process.cwd(), sourceFile.getFilePath())
    const lines = sourceFile.getFullText().split('\n')

    lines.forEach((line, index) => {
      if (line.includes(STALE_PREFIX)) {
        stale.push(`  ${relPath}:${index + 1}: ${line.trim()}`)
      }
    })
  }

  if (stale.length === 0) return

  console.log(
    `\nWARNING: ${stale.length} remaining '${STALE_PREFIX}' reference(s) need to be renamed by hand:`
  )
  console.log(stale.join('\n'))
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(`Scanning for Hapi route configs in: ${srcDir}\n`)
  console.log('Active path renames:')
  for (const [from, to] of Object.entries(PATH_PREFIX_RENAMES)) {
    console.log(`  '${from}*' → '${to}*'`)
  }
  console.log()

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  console.log(`Found ${sourceFiles.length} source file(s) to analyse.\n`)

  let totalRenamed = 0
  const modifiedFiles: string[] = []

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const renamed = processFile(filePath, project)

    if (renamed > 0) {
      totalRenamed += renamed
      modifiedFiles.push(filePath)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log('No trigger route paths to rename.')
  } else {
    console.log(`\nSaving ${modifiedFiles.length} modified file(s)...`)

    for (const filePath of modifiedFiles) {
      const sourceFile = project.getSourceFileOrThrow(filePath)
      await sourceFile.save()
      console.log(`  Saved: ${path.relative(process.cwd(), filePath)}`)
    }

    console.log(`\nDone. Renamed ${totalRenamed} route path(s).`)
  }

  warnAboutStalePaths(sourceFiles)
}

export { main }
