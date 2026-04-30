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
 * Codemod: Migrate `VALIDATED` status references to flags inside `defineWorkqueues` calls.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/migrate-validated-workqueue-status-to-flag.ts
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds every `defineWorkqueues([...])` call expression
 *   - For each workqueue config's `query`, recursively walks `or`/`and` containers
 *     and processes every leaf clause object
 *   - In each clause:
 *       - `status: { type: 'anyOf', terms: [..., 'VALIDATED', ...] }`
 *           → removes `'VALIDATED'` from `terms`; removes `status` entirely if `terms`
 *             becomes empty; adds `'validated'` to `flags.anyOf`
 *       - `status: { type: 'exact', term: 'VALIDATED' }`
 *           → removes `status` entirely; adds `'validated'` to `flags.anyOf`
 *   - When adding to `flags.anyOf`, merges with an existing `flags` object if present
 *   - Saves the modified files in-place
 */

import { Project, SyntaxKind, ObjectLiteralExpression, Node } from 'ts-morph'
import path from 'path'
import { getCwd } from '.'

const DEFINE_WORKQUEUES_NAME = 'defineWorkqueues'
const QUERY_PROPERTY_NAME = 'query'
const TYPE_PROPERTY_NAME = 'type'
const CLAUSES_PROPERTY_NAME = 'clauses'
const STATUS_PROPERTY_NAME = 'status'
const FLAGS_PROPERTY_NAME = 'flags'
const TERMS_PROPERTY_NAME = 'terms'
const TERM_PROPERTY_NAME = 'term'
const ANY_OF_PROPERTY_NAME = 'anyOf'

const VALIDATED_STATUS_VALUE = 'VALIDATED'
const VALIDATED_FLAG_VALUE = 'validated'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Adds `'validated'` to `flags.anyOf` on a clause object, merging with
 * whatever `flags` shape already exists.
 */
function addValidatedFlag(clause: ObjectLiteralExpression): void {
  const flagsProperty = clause.getProperty(FLAGS_PROPERTY_NAME)

  if (flagsProperty && Node.isPropertyAssignment(flagsProperty)) {
    const flagsInit = flagsProperty.getInitializer()

    if (flagsInit && Node.isObjectLiteralExpression(flagsInit)) {
      const anyOfProperty = flagsInit.getProperty(ANY_OF_PROPERTY_NAME)

      if (anyOfProperty && Node.isPropertyAssignment(anyOfProperty)) {
        // Append to existing anyOf array
        const anyOfInit = anyOfProperty.getInitializer()
        if (anyOfInit && Node.isArrayLiteralExpression(anyOfInit)) {
          anyOfInit.addElement(`'${VALIDATED_FLAG_VALUE}'`)
        }
      } else {
        // flags exists but has no anyOf — add it
        flagsInit.addPropertyAssignment({
          name: ANY_OF_PROPERTY_NAME,
          initializer: `['${VALIDATED_FLAG_VALUE}']`
        })
      }
    }
  } else {
    // No flags property at all — add one
    clause.addPropertyAssignment({
      name: FLAGS_PROPERTY_NAME,
      initializer: `{ ${ANY_OF_PROPERTY_NAME}: ['${VALIDATED_FLAG_VALUE}'] }`
    })
  }
}

/**
 * Processes a single leaf clause object.
 * Returns true if any change was made.
 */
function migrateClause(clause: ObjectLiteralExpression): boolean {
  const statusProperty = clause.getProperty(STATUS_PROPERTY_NAME)
  if (!statusProperty || !Node.isPropertyAssignment(statusProperty)) {
    return false
  }

  const statusInit = statusProperty.getInitializer()
  if (!statusInit || !Node.isObjectLiteralExpression(statusInit)) {
    return false
  }

  const statusTypeProperty = statusInit.getProperty(TYPE_PROPERTY_NAME)
  if (!statusTypeProperty || !Node.isPropertyAssignment(statusTypeProperty)) {
    return false
  }

  const statusTypeInit = statusTypeProperty.getInitializer()
  if (!statusTypeInit || !Node.isStringLiteral(statusTypeInit)) {
    return false
  }

  const statusType = statusTypeInit.getLiteralValue()

  // ── anyOf case ──────────────────────────────────────────────────────────────
  if (statusType === 'anyOf') {
    const termsProperty = statusInit.getProperty(TERMS_PROPERTY_NAME)
    if (!termsProperty || !Node.isPropertyAssignment(termsProperty)) {
      return false
    }

    const termsInit = termsProperty.getInitializer()
    if (!termsInit || !Node.isArrayLiteralExpression(termsInit)) {
      return false
    }

    const elements = termsInit.getElements()
    const validatedIndex = elements.findIndex(
      (el) =>
        Node.isStringLiteral(el) &&
        el.getLiteralValue() === VALIDATED_STATUS_VALUE
    )

    if (validatedIndex === -1) return false

    // Remove 'VALIDATED' from terms
    termsInit.removeElement(validatedIndex)

    // If terms is now empty, drop the whole status property
    if (termsInit.getElements().length === 0) {
      statusProperty.remove()
    }

    addValidatedFlag(clause)
    return true
  }

  // ── exact case ──────────────────────────────────────────────────────────────
  if (statusType === 'exact') {
    const termProperty = statusInit.getProperty(TERM_PROPERTY_NAME)
    if (!termProperty || !Node.isPropertyAssignment(termProperty)) {
      return false
    }

    const termInit = termProperty.getInitializer()
    if (!termInit || !Node.isStringLiteral(termInit)) {
      return false
    }

    if (termInit.getLiteralValue() !== VALIDATED_STATUS_VALUE) return false

    // Remove the entire status property
    statusProperty.remove()

    addValidatedFlag(clause)
    return true
  }

  return false
}

/**
 * Recursively walks a query node.
 *  - If it is an `or`/`and` container, recurses into `clauses`
 *  - Otherwise treats it as a leaf clause and calls `migrateClause`
 * Returns the number of clauses changed.
 */
function walkQuery(queryObj: ObjectLiteralExpression): number {
  const typeProperty = queryObj.getProperty(TYPE_PROPERTY_NAME)

  if (typeProperty && Node.isPropertyAssignment(typeProperty)) {
    const typeInit = typeProperty.getInitializer()

    if (
      typeInit &&
      Node.isStringLiteral(typeInit) &&
      (typeInit.getLiteralValue() === 'or' ||
        typeInit.getLiteralValue() === 'and')
    ) {
      const clausesProperty = queryObj.getProperty(CLAUSES_PROPERTY_NAME)
      if (!clausesProperty || !Node.isPropertyAssignment(clausesProperty)) {
        return 0
      }

      const clausesInit = clausesProperty.getInitializer()
      if (!clausesInit || !Node.isArrayLiteralExpression(clausesInit)) {
        return 0
      }

      let changed = 0
      for (const clause of clausesInit.getElements()) {
        if (Node.isObjectLiteralExpression(clause)) {
          changed += walkQuery(clause)
        }
      }
      return changed
    }
  }

  // Leaf clause
  return migrateClause(queryObj) ? 1 : 0
}

// ─── File processor ──────────────────────────────────────────────────────────

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let migratedCount = 0

  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  )

  for (const call of callExpressions) {
    const expression = call.getExpression()

    if (
      !Node.isIdentifier(expression) ||
      expression.getText() !== DEFINE_WORKQUEUES_NAME
    ) {
      continue
    }

    const args = call.getArguments()
    if (args.length === 0) continue

    // The argument must be an array literal of workqueue config objects
    const workqueuesArg = args[0]
    if (!Node.isArrayLiteralExpression(workqueuesArg)) continue

    for (const workqueueElement of workqueuesArg.getElements()) {
      if (!Node.isObjectLiteralExpression(workqueueElement)) continue

      const queryProperty = workqueueElement.getProperty(QUERY_PROPERTY_NAME)
      if (!queryProperty || !Node.isPropertyAssignment(queryProperty)) continue

      const queryInit = queryProperty.getInitializer()
      if (!queryInit || !Node.isObjectLiteralExpression(queryInit)) continue

      const changed = walkQuery(queryInit)

      if (changed > 0) {
        migratedCount += changed
        console.log(
          `  [${path.relative(getCwd(), filePath)}] Migrated ${changed} clause(s): VALIDATED status → flags.anyOf`
        )
      }
    }
  }

  return migratedCount
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  const srcDir = path.join(getCwd(), 'src')
  console.log(`Scanning for defineWorkqueues calls in: ${srcDir}\n`)

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  console.log(`Found ${sourceFiles.length} source file(s) to analyse.\n`)

  let totalMigrated = 0
  const modifiedFiles: string[] = []

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const migrated = processFile(filePath, project)

    if (migrated > 0) {
      totalMigrated += migrated
      modifiedFiles.push(filePath)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log(
      'No VALIDATED status references found in defineWorkqueues calls. Nothing to do.'
    )
    return
  }

  console.log(`\nSaving ${modifiedFiles.length} modified file(s)...`)

  for (const filePath of modifiedFiles) {
    const sourceFile = project.getSourceFileOrThrow(filePath)
    await sourceFile.save()
    console.log(`  Saved: ${path.relative(getCwd(), filePath)}`)
  }

  console.log(
    `\nDone. Migrated ${totalMigrated} clause(s) from VALIDATED status to flags.anyOf['validated'].`
  )
}

export { main }
