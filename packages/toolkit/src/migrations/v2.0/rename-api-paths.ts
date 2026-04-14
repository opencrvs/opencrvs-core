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
 * Codemod: Rename Hapi route `path` values inside route configuration objects.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/rename-api-paths.ts
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds every object literal that looks like a Hapi route config, i.e. one that
 *     has both a `method` property whose value is a recognised HTTP verb (or an array
 *     of them) and a `path` property whose value is a string literal
 *   - Applies every rename listed in PATH_RENAMES to the `path` value
 *   - Saves the modified files in-place
 *
 * Adding new renames:
 *   Add an entry to the PATH_RENAMES map below. Keys are the old path strings,
 *   values are the new path strings. Exact string matching is used — no wildcards.
 */

import { Project, SyntaxKind, ObjectLiteralExpression, Node } from 'ts-morph'
import path from 'path'
import { getCwd } from '.'

// ─── Path rename table ────────────────────────────────────────────────────────
// Add new renames here as further API paths are changed between versions.

const PATH_RENAMES: Record<string, string> = {
  '/events': '/config/events',
  '/application-config': '/config/application',
  '/workqueue': '/config/workqueues',
  '/locations': '/config/locations',
  '/users': '/config/users',
  '/roles': '/config/roles'
}

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
 * Returns true when the given object literal looks like a Hapi route config.
 *
 * A route config must have:
 *   - a `method` property whose value is either a recognised HTTP verb string
 *     literal, or an array literal whose elements are all recognised verb strings
 *   - a `path` property whose value is a string literal
 */
function isRouteConfig(obj: ObjectLiteralExpression): boolean {
  // ── method check ────────────────────────────────────────────────────────────
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

  // ── path check ──────────────────────────────────────────────────────────────
  const pathProp = obj.getProperty(PATH_PROPERTY_NAME)
  if (!pathProp || !Node.isPropertyAssignment(pathProp)) return false

  const pathInit = pathProp.getInitializer()
  return !!pathInit && Node.isStringLiteral(pathInit)
}

/**
 * Applies PATH_RENAMES to the `path` property of a confirmed route config object.
 * Returns the new path string if a rename was applied, or null if no change was made.
 */
function renameRoutePath(obj: ObjectLiteralExpression): string | null {
  const pathProp = obj.getProperty(PATH_PROPERTY_NAME)
  if (!pathProp || !Node.isPropertyAssignment(pathProp)) return null

  const pathInit = pathProp.getInitializer()
  if (!pathInit || !Node.isStringLiteral(pathInit)) return null

  const oldPath = pathInit.getLiteralValue()
  const newPath = PATH_RENAMES[oldPath]

  if (!newPath) return null

  pathInit.replaceWithText(`'${newPath}'`)
  return newPath
}

// ─── File processor ──────────────────────────────────────────────────────────

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let renamedCount = 0
  const relPath = path.relative(getCwd(), filePath)

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

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  const srcDir = path.join(getCwd(), 'src')
  console.log(`Scanning for Hapi route configs in: ${srcDir}\n`)
  console.log('Active path renames:')
  for (const [from, to] of Object.entries(PATH_RENAMES)) {
    console.log(`  '${from}' → '${to}'`)
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
    console.log('No matching route paths found. Nothing to do.')
    return
  }

  console.log(`\nSaving ${modifiedFiles.length} modified file(s)...`)

  for (const filePath of modifiedFiles) {
    const sourceFile = project.getSourceFileOrThrow(filePath)
    await sourceFile.save()
    console.log(`  Saved: ${path.relative(getCwd(), filePath)}`)
  }

  console.log(`\nDone. Renamed ${totalRenamed} route path(s).`)
}

export { main }
