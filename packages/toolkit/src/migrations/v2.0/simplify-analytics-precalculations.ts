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
 * Codemod: Clean up `src/analytics/analytics.ts` by removing the Farajaland
 * sample precalculation wiring.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/simplify-analytics-precalculations.ts
 *
 * Runs LAST, after `checkout-upstream-files` has replaced
 * `src/analytics/analytics.ts` with the upstream v2.0 version. That upstream
 * version hardcodes a Farajaland-specific birth-event precalculation (it
 * imports `Event` and `precalculateBirthEvent`), which countries implementing
 * their own flows don't want. This codemod strips that out so each country
 * starts from a clean placeholder.
 *
 * What it does (only to `src/analytics/analytics.ts`, if present):
 *   1. Removes the named imports `Event` and `precalculateBirthEvent`.
 *      If an import declaration becomes empty it is removed entirely.
 *   2. Rewrites the body of `precalculateAdditionalAnalytics` so it contains
 *      nothing but `return declaration` — i.e. every statement that
 *      references `Event` or `precalculateBirthEvent` is dropped, and a
 *      `return declaration` is ensured at the end.
 *
 * The codemod is safe to re-run: if the imports are already gone and the
 * function body is already `return declaration`, it is a no-op.
 */

import {
  Project,
  SyntaxKind,
  Node,
  SourceFile,
  FunctionDeclaration,
  VariableDeclaration
} from 'ts-morph'
import fs from 'fs'
import path from 'path'
import { getCwd } from '.'

const ANALYTICS_FILE_REL = 'src/analytics/analytics.ts'
const FUNCTION_NAME = 'precalculateAdditionalAnalytics'
const IMPORT_NAMES_TO_REMOVE = new Set(['Event', 'precalculateBirthEvent'])
const RETURN_EXPRESSION_TEXT = 'declaration'

// ─── Import cleanup ──────────────────────────────────────────────────────────

/**
 * Removes every named import in `sourceFile` whose local binding name is in
 * `IMPORT_NAMES_TO_REMOVE`. If a given import declaration is left with no
 * named imports, default import or namespace import, the declaration itself
 * is removed.
 */
function removeTargetedNamedImports(sourceFile: SourceFile): string[] {
  const log: string[] = []

  for (const importDecl of [...sourceFile.getImportDeclarations()]) {
    const namedImports = importDecl.getNamedImports()
    if (namedImports.length === 0) continue

    const matched = namedImports.filter((ni) =>
      IMPORT_NAMES_TO_REMOVE.has(ni.getName())
    )
    if (matched.length === 0) continue

    const removedNames = matched.map((ni) => ni.getName())
    for (const ni of matched) ni.remove()
    log.push(
      `removed import(s) ${removedNames.join(', ')} from '${importDecl.getModuleSpecifierValue()}'`
    )

    const stillUsed =
      importDecl.getNamedImports().length > 0 ||
      importDecl.getDefaultImport() ||
      importDecl.getNamespaceImport()
    if (!stillUsed) importDecl.remove()
  }

  return log
}

// ─── Function-body cleanup ───────────────────────────────────────────────────

/**
 * Returns the `precalculateAdditionalAnalytics` declaration in `sourceFile`,
 * whether it was written as `function precalculateAdditionalAnalytics(...)` or
 * as `const precalculateAdditionalAnalytics = (...) => { ... }`.
 */
function findPrecalculateFunction(
  sourceFile: SourceFile
): FunctionDeclaration | VariableDeclaration | undefined {
  for (const fn of sourceFile.getFunctions()) {
    if (fn.getName() === FUNCTION_NAME) return fn
  }
  for (const statement of sourceFile.getVariableStatements()) {
    for (const decl of statement.getDeclarations()) {
      if (decl.getName() === FUNCTION_NAME) return decl
    }
  }
  return undefined
}

/**
 * Returns the block body of a function declaration or variable-declared arrow
 * / function expression, or undefined if the function has an expression body
 * or doesn't exist.
 */
function getFunctionBodyBlock(
  fn: FunctionDeclaration | VariableDeclaration
): ReturnType<FunctionDeclaration['getBody']> | undefined {
  if (Node.isFunctionDeclaration(fn)) return fn.getBody()

  const initializer = fn.getInitializer()
  if (!initializer) return undefined
  if (
    !Node.isArrowFunction(initializer) &&
    !Node.isFunctionExpression(initializer)
  ) {
    return undefined
  }
  return initializer.getBody()
}

/**
 * Rewrites the body of `precalculateAdditionalAnalytics` so that the only
 * statement is `return declaration`. Any statement whose subtree references
 * the removed imports (`Event`, `precalculateBirthEvent`) is dropped; a
 * trailing `return declaration` is ensured.
 */
function simplifyPrecalculateFunction(sourceFile: SourceFile): string[] {
  const log: string[] = []

  const fn = findPrecalculateFunction(sourceFile)
  if (!fn) return log

  const body = getFunctionBodyBlock(fn)
  if (!body || !Node.isBlock(body)) return log

  // Drop every statement (not just `if`s) whose AST references an identifier
  // in IMPORT_NAMES_TO_REMOVE. This handles both the upstream shape
  //     if (eventConfig.id === Event.Birth) return precalculateBirthEvent(...)
  // and any equivalent variant a country might have typed.
  for (const statement of [...body.getStatements()]) {
    const references = statement
      .getDescendantsOfKind(SyntaxKind.Identifier)
      .some((id) => IMPORT_NAMES_TO_REMOVE.has(id.getText()))

    if (references) {
      statement.remove()
      log.push(`removed statement in ${FUNCTION_NAME} referencing removed imports`)
    }
  }

  // Ensure the function ends with `return declaration`. If nothing changed
  // and the body already ends correctly, this is a no-op.
  const remaining = body.getStatements()
  const last = remaining[remaining.length - 1]
  const alreadyCorrect =
    last &&
    Node.isReturnStatement(last) &&
    last.getExpression()?.getText() === RETURN_EXPRESSION_TEXT

  if (!alreadyCorrect) {
    body.addStatements(`return ${RETURN_EXPRESSION_TEXT}`)
    log.push(
      `ensured '${FUNCTION_NAME}' ends with 'return ${RETURN_EXPRESSION_TEXT}'`
    )
  }

  return log
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const cwd = getCwd()
  const absPath = path.join(cwd, ANALYTICS_FILE_REL)

  if (!fs.existsSync(absPath)) {
    console.log(
      `[${ANALYTICS_FILE_REL}] does not exist — nothing to clean up.`
    )
    return
  }

  const project = new Project({
    tsConfigFilePath: path.resolve(cwd, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFile = project.getSourceFile(absPath)
  if (!sourceFile) {
    console.log(
      `[${ANALYTICS_FILE_REL}] is not part of the tsconfig project. Skipping.`
    )
    return
  }

  console.log(`Cleaning up ${ANALYTICS_FILE_REL}...\n`)

  const importLogs = removeTargetedNamedImports(sourceFile)
  const fnLogs = simplifyPrecalculateFunction(sourceFile)
  const allLogs = [...importLogs, ...fnLogs]

  if (allLogs.length === 0) {
    console.log(`[${ANALYTICS_FILE_REL}] already clean — nothing to do.`)
    return
  }

  for (const log of allLogs) {
    console.log(`  [${ANALYTICS_FILE_REL}] ${log}`)
  }

  await sourceFile.save()
  console.log(`\nSaved ${ANALYTICS_FILE_REL}.`)
}

export { main }
