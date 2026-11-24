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
 * Codemod: Remove the legacy `GET /statistics` Hapi route and its handler.
 *
 * Background:
 *   In v1.x country configs exposed a `GET /statistics` route used by the
 *   demo data-generator script to seed location statistics. In v2.0 this is
 *   no longer part of the country config surface — the data-generator (where
 *   it remains) talks to the Core FHIR APIs directly.
 *
 * What it does (per source file under `src/`):
 *   1. Removes any `<receiver>.route({ method: 'GET', path: '/statistics', ... })`
 *      call. Both single-route (`server.route({...})`) and array-route
 *      (`server.route([{...}, {...}])`) forms are handled — for the array
 *      form only the matching object is removed, the other routes stay.
 *   2. Removes any `statisticsHandler` named import. If that empties an
 *      import declaration, the whole declaration is dropped.
 *   3. Finds the file that defines `export async function statisticsHandler`
 *      (typically `src/api/data-generator/handler.ts`):
 *        - If `statisticsHandler` is the file's *only* export → the whole
 *          file is deleted.
 *        - Otherwise → just the function declaration is removed and a
 *          warning is logged so the developer can decide what to do with
 *          the rest of the file.
 *   4. After deleting the handler file, performs a transitive orphan sweep
 *      bounded to the handler's directory subtree (e.g.
 *      `src/api/data-generator/`):
 *        - Each project-local import the handler had is checked. If no
 *          remaining file in the project imports that module, the module
 *          file is deleted too.
 *        - Recursive: a deleted file's own local imports are then checked
 *          the same way. The directory boundary prevents this from ever
 *          touching shared utilities outside the handler's subtree.
 *      This is what reaches `service.ts` (and friends) once nothing else
 *      uses it.
 *
 * Caveats:
 *   - Only project-local imports inside the handler's directory are
 *     considered for orphan deletion. Helpers in shared locations (e.g.
 *     `src/utils/`, `src/constants.ts`) are never auto-deleted.
 *   - Files that are still referenced by *anything* in the project (other
 *     handlers, scripts, demo/data-generators) are kept untouched.
 *   - The codemod is a no-op when the route doesn't exist (already
 *     migrated country configs).
 */

import path from 'path'
import { Node, ObjectLiteralExpression, Project, SourceFile, SyntaxKind } from 'ts-morph'

const ROUTE_PATH = '/statistics'
const HANDLER_NAME = 'statisticsHandler'

interface FileResult {
  routesRemoved: number
  importsCleaned: boolean
}

/**
 * Returns true if the given object literal has a property `path` whose
 * value (string literal or no-substitution template literal) equals
 * `ROUTE_PATH`.
 */
function isStatisticsRouteObject(obj: ObjectLiteralExpression): boolean {
  const pathProp = obj.getProperty('path')
  if (!pathProp || !Node.isPropertyAssignment(pathProp)) return false

  const init = pathProp.getInitializer()
  if (!init) return false

  if (Node.isStringLiteral(init) || Node.isNoSubstitutionTemplateLiteral(init)) {
    return init.getLiteralValue() === ROUTE_PATH
  }

  return false
}

/**
 * Removes `<receiver>.route({...})` and `<receiver>.route([{...}, ...])`
 * calls whose route object has `path: '/statistics'`. For the array form
 * only the matching element is removed; siblings are preserved.
 *
 * Returns the number of routes removed in this file.
 */
function removeStatisticsRoutes(sourceFile: SourceFile): number {
  let removed = 0

  // Snapshot first — we'll be mutating the AST during iteration.
  const callExpressions = [
    ...sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
  ]

  for (const call of callExpressions) {
    if (call.wasForgotten()) continue

    const expr = call.getExpression()
    if (!Node.isPropertyAccessExpression(expr)) continue
    if (expr.getName() !== 'route') continue

    const args = call.getArguments()
    if (args.length === 0) continue

    const firstArg = args[0]

    // Single-route form: `server.route({ method, path, handler, ... })`
    if (Node.isObjectLiteralExpression(firstArg)) {
      if (!isStatisticsRouteObject(firstArg)) continue

      // Drop the whole `server.route({...})` statement, not just the call,
      // so we don't leave a dangling `;` behind.
      const stmt = call.getFirstAncestorByKind(SyntaxKind.ExpressionStatement)
      if (stmt) {
        stmt.remove()
        removed++
      } else {
        // Fallback (shouldn't happen at top level): replace the call.
        call.replaceWithText('')
        removed++
      }
      continue
    }

    // Array-route form: `server.route([{...}, {...}])`
    if (Node.isArrayLiteralExpression(firstArg)) {
      const matchingIndexes = firstArg
        .getElements()
        .map((el, idx) => ({ el, idx }))
        .filter(
          ({ el }) =>
            Node.isObjectLiteralExpression(el) && isStatisticsRouteObject(el)
        )
        .map(({ idx }) => idx)

      // Highest index first so each removal doesn't shift the index of
      // matches we haven't dropped yet.
      matchingIndexes
        .sort((a, b) => b - a)
        .forEach((idx) => {
          firstArg.removeElement(idx)
          removed++
        })
    }
  }

  return removed
}

/**
 * Removes any `statisticsHandler` named import. Returns true if the file
 * was modified.
 */
function removeStatisticsHandlerImports(sourceFile: SourceFile): boolean {
  let changed = false

  for (const decl of sourceFile.getImportDeclarations()) {
    const targetNamed = decl
      .getNamedImports()
      .find((ni) => ni.getName() === HANDLER_NAME)

    if (!targetNamed) continue

    targetNamed.remove()
    changed = true

    const isNowEmpty =
      decl.getNamedImports().length === 0 &&
      !decl.getDefaultImport() &&
      !decl.getNamespaceImport()
    if (isNowEmpty) decl.remove()
  }

  return changed
}

function processFile(sourceFile: SourceFile): FileResult {
  const routesRemoved = removeStatisticsRoutes(sourceFile)
  const importsCleaned = removeStatisticsHandlerImports(sourceFile)
  return { routesRemoved, importsCleaned }
}

interface HandlerFileResult {
  filePath: string
  action: 'deleted' | 'function-removed' | 'not-found'
  remainingExports?: string[]
  /** Files transitively orphaned and deleted alongside the handler. */
  orphansDeleted: string[]
}

/**
 * Returns local-project import paths from the given source file that
 * resolve to a file inside `subtreeRoot`. External (npm) imports and
 * imports outside the subtree are excluded.
 */
function collectLocalImportsInSubtree(
  sourceFile: SourceFile,
  subtreeRoot: string
): string[] {
  const result: string[] = []
  for (const decl of sourceFile.getImportDeclarations()) {
    const moduleSf = decl.getModuleSpecifierSourceFile()
    if (!moduleSf) continue
    const fp = moduleSf.getFilePath()
    if (!fp.startsWith(subtreeRoot)) continue
    result.push(fp)
  }
  return result
}

/**
 * Walks files reachable from a deleted starting file via local imports
 * within `subtreeRoot`, deleting any that nobody else imports. Recursive
 * via worklist — when a file is deleted, its own local imports become
 * candidates for the next round.
 */
function deleteOrphanedDescendants(
  project: Project,
  startingFile: SourceFile,
  subtreeRoot: string
): string[] {
  const initialCandidates = collectLocalImportsInSubtree(
    startingFile,
    subtreeRoot
  )

  const startingPath = startingFile.getFilePath()
  const deleted = new Set<string>([startingPath])
  const seen = new Set<string>()
  const worklist = [...initialCandidates]
  const orphans: string[] = []

  while (worklist.length > 0) {
    const candidate = worklist.shift()!
    if (seen.has(candidate)) continue
    seen.add(candidate)

    if (deleted.has(candidate)) continue
    if (!candidate.startsWith(subtreeRoot)) continue

    const candidateSf = project.getSourceFile(candidate)
    if (!candidateSf) continue

    // Anyone left in the project still importing this file (including
    // files outside the subtree)? If so, it's not actually orphaned.
    const stillImported = project.getSourceFiles().some((sf) => {
      const sfPath = sf.getFilePath()
      if (deleted.has(sfPath)) return false
      if (sfPath === candidate) return false
      return sf
        .getImportDeclarations()
        .some(
          (decl) =>
            decl.getModuleSpecifierSourceFile()?.getFilePath() === candidate
        )
    })

    if (stillImported) continue

    // Capture local imports BEFORE deletion — `delete()` invalidates the
    // node, so we wouldn't be able to read them afterwards.
    const next = collectLocalImportsInSubtree(candidateSf, subtreeRoot)
    worklist.push(...next)

    candidateSf.delete()
    deleted.add(candidate)
    orphans.push(candidate)
  }

  return orphans
}

/**
 * Finds the file that exports `statisticsHandler` and either deletes the
 * whole file (when it's the sole export) or just removes the function
 * declaration. When the file is deleted, also performs a transitive
 * orphan sweep bounded to the file's directory.
 */
function processHandlerFile(project: Project): HandlerFileResult {
  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  for (const sf of sourceFiles) {
    const fn = sf.getFunction(HANDLER_NAME)
    if (!fn) continue

    const filePath = sf.getFilePath()
    const exportsByName = [...sf.getExportedDeclarations().keys()]
    const otherExports = exportsByName.filter((name) => name !== HANDLER_NAME)

    if (otherExports.length === 0) {
      // Sole export — delete the file, then sweep orphans inside its
      // directory subtree.
      const subtreeRoot = path.dirname(filePath) + path.sep
      const orphansDeleted = deleteOrphanedDescendants(
        project,
        sf,
        subtreeRoot
      )
      sf.delete()
      return { filePath, action: 'deleted', orphansDeleted }
    }

    // Other exports exist; surgically remove just this function.
    // We don't run the orphan sweep here — the file isn't gone, so
    // anything it imports is presumably still in use.
    fn.remove()
    return {
      filePath,
      action: 'function-removed',
      remainingExports: otherExports,
      orphansDeleted: []
    }
  }

  return { filePath: '', action: 'not-found', orphansDeleted: [] }
}

async function main() {
  const project = new Project({
    tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  console.log(
    `Removing legacy 'GET ${ROUTE_PATH}' route and '${HANDLER_NAME}' across ${sourceFiles.length} source file(s)...\n`
  )

  let totalRoutesRemoved = 0
  let totalFilesWithImportsCleaned = 0
  let totalFilesWithRoutesRemoved = 0

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const rel = path.relative(process.cwd(), filePath)
    const result = processFile(sourceFile)

    if (result.routesRemoved > 0) {
      console.log(
        `  [${rel}] Removed ${result.routesRemoved} '${ROUTE_PATH}' route(s)`
      )
      totalRoutesRemoved += result.routesRemoved
      totalFilesWithRoutesRemoved++
    }

    if (result.importsCleaned) {
      console.log(`  [${rel}] Cleaned up '${HANDLER_NAME}' import`)
      totalFilesWithImportsCleaned++
    }

    if (result.routesRemoved > 0 || result.importsCleaned) {
      await sourceFile.save()
    }
  }

  const handlerResult = processHandlerFile(project)
  switch (handlerResult.action) {
    case 'deleted': {
      const rel = path.relative(process.cwd(), handlerResult.filePath)
      console.log(
        `  [${rel}] Deleted handler file ('${HANDLER_NAME}' was the sole export).`
      )
      for (const orphanPath of handlerResult.orphansDeleted) {
        const orphanRel = path.relative(process.cwd(), orphanPath)
        console.log(
          `  [${orphanRel}] Deleted (no remaining importers in the project after handler removal).`
        )
      }
      // `delete()` schedules deletion; `save()` writes it to disk.
      await project.save()
      break
    }
    case 'function-removed': {
      const rel = path.relative(process.cwd(), handlerResult.filePath)
      console.warn(
        `  [${rel}] Removed '${HANDLER_NAME}' function but kept the file (other exports remain: ${handlerResult.remainingExports?.join(', ')}). Review whether the file is still needed.`
      )
      // Save the source file with the function removed.
      const sf = project.getSourceFile(handlerResult.filePath)
      if (sf) await sf.save()
      break
    }
    case 'not-found':
      // Either already migrated or the handler lives somewhere unexpected.
      // Not an error — continue silently.
      break
  }

  if (
    totalRoutesRemoved === 0 &&
    totalFilesWithImportsCleaned === 0 &&
    handlerResult.action === 'not-found'
  ) {
    console.log(`\nNo legacy '${ROUTE_PATH}' route or handler found. Nothing to do.`)
    return
  }

  const orphansSummary =
    handlerResult.orphansDeleted.length > 0
      ? ` and ${handlerResult.orphansDeleted.length} orphaned helper file(s)`
      : ''

  console.log(
    `\nDone. Removed ${totalRoutesRemoved} route(s) across ${totalFilesWithRoutesRemoved} file(s); cleaned ${HANDLER_NAME} import in ${totalFilesWithImportsCleaned} file(s)${orphansSummary}.`
  )
}

export { main }
