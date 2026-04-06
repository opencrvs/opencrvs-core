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
 * Codemod: Add `pending-first-certificate-issuance` flag to birth event configs and workqueues.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/add-birth-certificate-issuance-flag.ts
 *
 * What it does:
 *   defineConfig (birth type only):
 *     - Ensures the top-level `flags` array contains the `pending-first-certificate-issuance`
 *       flag definition
 *     - Ensures every `REGISTER` action has
 *         `flags: [{ id: 'pending-first-certificate-issuance', operation: 'add' }]`
 *     - Ensures every `PRINT_CERTIFICATE` action has
 *         `flags: [{ id: 'pending-first-certificate-issuance', operation: 'remove' }]`
 *
 *   defineWorkqueues:
 *     - Finds workqueues whose `actions` array (or `action` object) contains a
 *       `PRINT_CERTIFICATE` type entry
 *     - Adds `flags: { anyOf: ['pending-first-certificate-issuance'] }` to every leaf
 *       clause in that workqueue's `query` (merging with existing `flags` if present)
 *
 *   - Saves the modified files in-place
 */

import {
  Project,
  SyntaxKind,
  ObjectLiteralExpression,
  ArrayLiteralExpression,
  Node
} from 'ts-morph'
import path from 'path'

const DEFINE_CONFIG_NAME = 'defineConfig'
const DEFINE_WORKQUEUES_NAME = 'defineWorkqueues'
const ACTIONS_PROPERTY_NAME = 'actions'
const ACTION_PROPERTY_NAME = 'action'
const FLAGS_PROPERTY_NAME = 'flags'
const QUERY_PROPERTY_NAME = 'query'
const TYPE_PROPERTY_NAME = 'type'
const CLAUSES_PROPERTY_NAME = 'clauses'
const ANY_OF_PROPERTY_NAME = 'anyOf'

const FLAG_ID = 'pending-first-certificate-issuance'
const REGISTER_TYPE = 'REGISTER'
const PRINT_CERTIFICATE_TYPE = 'PRINT_CERTIFICATE'

const FLAG_DEFINITION_INITIALIZER = `{
  id: '${FLAG_ID}',
  label: {
    id: 'event.birth.flag.${FLAG_ID}',
    defaultMessage: 'Pending first certificate issuance',
    description: 'Flag label for first certificate issuance'
  },
  requiresAction: true
}`

// ─── Generic helpers ──────────────────────────────────────────────────────────

/**
 * Returns true if the object's `type` property matches the given type name.
 * Handles both `ActionType.PRINT_CERTIFICATE` and `'PRINT_CERTIFICATE'` forms.
 */
function isActionOfType(
  obj: ObjectLiteralExpression,
  typeName: string
): boolean {
  const typeProperty = obj.getProperty(TYPE_PROPERTY_NAME)
  if (!typeProperty || !Node.isPropertyAssignment(typeProperty)) return false

  const typeInit = typeProperty.getInitializer()
  if (!typeInit) return false

  if (Node.isPropertyAccessExpression(typeInit)) {
    return typeInit.getName() === typeName
  }

  if (Node.isStringLiteral(typeInit)) {
    return typeInit.getLiteralValue() === typeName
  }

  return false
}

/**
 * Returns true when the `defineConfig` root config object describes a birth event.
 * Handles both `'birth'` string literal and `EventType.BIRTH` enum access.
 */
function isBirthConfig(configArg: ObjectLiteralExpression): boolean {
  const typeProperty = configArg.getProperty(TYPE_PROPERTY_NAME)
  if (!typeProperty || !Node.isPropertyAssignment(typeProperty)) return false

  const initializer = typeProperty.getInitializer()
  if (!initializer) return false

  if (Node.isStringLiteral(initializer)) {
    return initializer.getLiteralValue().toLowerCase() === 'birth'
  }

  if (Node.isPropertyAccessExpression(initializer)) {
    return initializer.getName().toLowerCase() === 'birth'
  }

  return false
}

/**
 * Returns true if an array literal contains an object literal with `id: <id>`.
 */
function hasElementWithId(array: ArrayLiteralExpression, id: string): boolean {
  for (const el of array.getElements()) {
    if (!Node.isObjectLiteralExpression(el)) continue
    const idProp = el.getProperty('id')
    if (!idProp || !Node.isPropertyAssignment(idProp)) continue
    const idInit = idProp.getInitializer()
    if (
      idInit &&
      Node.isStringLiteral(idInit) &&
      idInit.getLiteralValue() === id
    ) {
      return true
    }
  }
  return false
}

// ─── defineConfig helpers ─────────────────────────────────────────────────────

/**
 * Ensures the top-level `flags` array in a birth `defineConfig` contains the
 * `pending-first-certificate-issuance` flag definition.
 */
function ensureTopLevelFlagDefinition(
  configArg: ObjectLiteralExpression
): boolean {
  const flagsProp = configArg.getProperty(FLAGS_PROPERTY_NAME)

  if (flagsProp && Node.isPropertyAssignment(flagsProp)) {
    const flagsInit = flagsProp.getInitializer()
    if (flagsInit && Node.isArrayLiteralExpression(flagsInit)) {
      if (hasElementWithId(flagsInit, FLAG_ID)) return false
      flagsInit.addElement(FLAG_DEFINITION_INITIALIZER)
      return true
    }
    return false
  }

  // No `flags` property at all — create it
  configArg.addPropertyAssignment({
    name: FLAGS_PROPERTY_NAME,
    initializer: `[\n  ${FLAG_DEFINITION_INITIALIZER}\n]`
  })
  return true
}

/**
 * Ensures an action object's `flags` array contains `{ id: FLAG_ID, operation }`.
 */
function ensureActionOperationFlag(
  action: ObjectLiteralExpression,
  operation: 'add' | 'remove'
): boolean {
  const flagsProp = action.getProperty(FLAGS_PROPERTY_NAME)
  const entry = `{ id: '${FLAG_ID}', operation: '${operation}' }`

  if (flagsProp && Node.isPropertyAssignment(flagsProp)) {
    const flagsInit = flagsProp.getInitializer()
    if (flagsInit && Node.isArrayLiteralExpression(flagsInit)) {
      if (hasElementWithId(flagsInit, FLAG_ID)) return false
      flagsInit.addElement(entry)
      return true
    }
    return false
  }

  action.addPropertyAssignment({
    name: FLAGS_PROPERTY_NAME,
    initializer: `[${entry}]`
  })
  return true
}

/**
 * Processes a birth defineConfig object: ensures top-level flag definition,
 * REGISTER action flags, and PRINT_CERTIFICATE action flags.
 * Returns the number of changes made.
 */
function processBirthConfig(
  configArg: ObjectLiteralExpression,
  relPath: string
): number {
  let changes = 0

  if (ensureTopLevelFlagDefinition(configArg)) {
    changes++
    console.log(`  [${relPath}] Added '${FLAG_ID}' to top-level flags`)
  }

  const actionsProp = configArg.getProperty(ACTIONS_PROPERTY_NAME)
  if (!actionsProp || !Node.isPropertyAssignment(actionsProp)) return changes

  const actionsInit = actionsProp.getInitializer()
  if (!actionsInit || !Node.isArrayLiteralExpression(actionsInit)) return changes

  for (const element of actionsInit.getElements()) {
    if (!Node.isObjectLiteralExpression(element)) continue

    if (isActionOfType(element, REGISTER_TYPE)) {
      if (ensureActionOperationFlag(element, 'add')) {
        changes++
        console.log(
          `  [${relPath}] Added '${FLAG_ID}' add-flag to REGISTER action`
        )
      }
    }

    if (isActionOfType(element, PRINT_CERTIFICATE_TYPE)) {
      if (ensureActionOperationFlag(element, 'remove')) {
        changes++
        console.log(
          `  [${relPath}] Added '${FLAG_ID}' remove-flag to PRINT_CERTIFICATE action`
        )
      }
    }
  }

  return changes
}

// ─── defineWorkqueues helpers ─────────────────────────────────────────────────

/**
 * Returns true if a workqueue config object contains a PRINT_CERTIFICATE action
 * in either the (deprecated) `actions` array or the `action` singular object.
 */
function hasPrintCertificateAction(
  workqueue: ObjectLiteralExpression
): boolean {
  // Deprecated `actions` array
  const actionsProp = workqueue.getProperty(ACTIONS_PROPERTY_NAME)
  if (actionsProp && Node.isPropertyAssignment(actionsProp)) {
    const actionsInit = actionsProp.getInitializer()
    if (actionsInit && Node.isArrayLiteralExpression(actionsInit)) {
      for (const el of actionsInit.getElements()) {
        if (
          Node.isObjectLiteralExpression(el) &&
          isActionOfType(el, PRINT_CERTIFICATE_TYPE)
        ) {
          return true
        }
      }
    }
  }

  // Singular `action` object
  const actionProp = workqueue.getProperty(ACTION_PROPERTY_NAME)
  if (actionProp && Node.isPropertyAssignment(actionProp)) {
    const actionInit = actionProp.getInitializer()
    if (
      actionInit &&
      Node.isObjectLiteralExpression(actionInit) &&
      isActionOfType(actionInit, PRINT_CERTIFICATE_TYPE)
    ) {
      return true
    }
  }

  return false
}

/**
 * Adds `FLAG_ID` to `flags.anyOf` on a leaf query clause,
 * merging with any existing `flags` object.
 */
function addFlagToQueryClause(clause: ObjectLiteralExpression): boolean {
  const flagsProp = clause.getProperty(FLAGS_PROPERTY_NAME)

  if (flagsProp && Node.isPropertyAssignment(flagsProp)) {
    const flagsInit = flagsProp.getInitializer()
    if (flagsInit && Node.isObjectLiteralExpression(flagsInit)) {
      const anyOfProp = flagsInit.getProperty(ANY_OF_PROPERTY_NAME)

      if (anyOfProp && Node.isPropertyAssignment(anyOfProp)) {
        const anyOfInit = anyOfProp.getInitializer()
        if (anyOfInit && Node.isArrayLiteralExpression(anyOfInit)) {
          const alreadyPresent = anyOfInit
            .getElements()
            .some(
              (el) =>
                Node.isStringLiteral(el) && el.getLiteralValue() === FLAG_ID
            )
          if (alreadyPresent) return false
          anyOfInit.addElement(`'${FLAG_ID}'`)
          return true
        }
      } else {
        // flags exists but has no anyOf — add it
        flagsInit.addPropertyAssignment({
          name: ANY_OF_PROPERTY_NAME,
          initializer: `['${FLAG_ID}']`
        })
        return true
      }
    }
  } else {
    clause.addPropertyAssignment({
      name: FLAGS_PROPERTY_NAME,
      initializer: `{ ${ANY_OF_PROPERTY_NAME}: ['${FLAG_ID}'] }`
    })
    return true
  }

  return false
}

/**
 * Recursively walks an `or`/`and` query container, calling `addFlagToQueryClause`
 * on every leaf clause. Returns the number of clauses modified.
 */
function walkQueryForFlagAddition(queryObj: ObjectLiteralExpression): number {
  const typeProp = queryObj.getProperty(TYPE_PROPERTY_NAME)

  if (typeProp && Node.isPropertyAssignment(typeProp)) {
    const typeInit = typeProp.getInitializer()
    if (
      typeInit &&
      Node.isStringLiteral(typeInit) &&
      (typeInit.getLiteralValue() === 'or' ||
        typeInit.getLiteralValue() === 'and')
    ) {
      const clausesProp = queryObj.getProperty(CLAUSES_PROPERTY_NAME)
      if (!clausesProp || !Node.isPropertyAssignment(clausesProp)) return 0

      const clausesInit = clausesProp.getInitializer()
      if (!clausesInit || !Node.isArrayLiteralExpression(clausesInit)) return 0

      let changed = 0
      for (const clause of clausesInit.getElements()) {
        if (Node.isObjectLiteralExpression(clause)) {
          changed += walkQueryForFlagAddition(clause)
        }
      }
      return changed
    }
  }

  // Leaf clause
  return addFlagToQueryClause(queryObj) ? 1 : 0
}

// ─── File processor ──────────────────────────────────────────────────────────

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let totalChanges = 0
  const relPath = path.relative(process.cwd(), filePath)

  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  )

  for (const call of callExpressions) {
    const expression = call.getExpression()
    if (!Node.isIdentifier(expression)) continue

    const calleeName = expression.getText()

    // ── defineConfig ──────────────────────────────────────────────────────────
    if (calleeName === DEFINE_CONFIG_NAME) {
      const args = call.getArguments()
      if (args.length === 0) continue

      const configArg = args[0]
      if (!Node.isObjectLiteralExpression(configArg)) continue
      if (!isBirthConfig(configArg)) continue

      totalChanges += processBirthConfig(configArg, relPath)
    }

    // ── defineWorkqueues ──────────────────────────────────────────────────────
    if (calleeName === DEFINE_WORKQUEUES_NAME) {
      const args = call.getArguments()
      if (args.length === 0) continue

      const workqueuesArg = args[0]
      if (!Node.isArrayLiteralExpression(workqueuesArg)) continue

      for (const workqueueEl of workqueuesArg.getElements()) {
        if (!Node.isObjectLiteralExpression(workqueueEl)) continue
        if (!hasPrintCertificateAction(workqueueEl)) continue

        const queryProp = workqueueEl.getProperty(QUERY_PROPERTY_NAME)
        if (!queryProp || !Node.isPropertyAssignment(queryProp)) continue

        const queryInit = queryProp.getInitializer()
        if (!queryInit || !Node.isObjectLiteralExpression(queryInit)) continue

        const changed = walkQueryForFlagAddition(queryInit)
        if (changed > 0) {
          totalChanges += changed
          console.log(
            `  [${relPath}] Added '${FLAG_ID}' to flags.anyOf in ${changed} PRINT_CERTIFICATE workqueue clause(s)`
          )
        }
      }
    }
  }

  return totalChanges
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(
    `Scanning for birth defineConfig and PRINT_CERTIFICATE workqueues in: ${srcDir}\n`
  )

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  console.log(`Found ${sourceFiles.length} source file(s) to analyse.\n`)

  let totalChanges = 0
  const modifiedFiles: string[] = []

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const changes = processFile(filePath, project)

    if (changes > 0) {
      totalChanges += changes
      modifiedFiles.push(filePath)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log(
      'No birth configs or PRINT_CERTIFICATE workqueues found. Nothing to do.'
    )
    return
  }

  console.log(`\nSaving ${modifiedFiles.length} modified file(s)...`)

  for (const filePath of modifiedFiles) {
    const sourceFile = project.getSourceFileOrThrow(filePath)
    await sourceFile.save()
    console.log(`  Saved: ${path.relative(process.cwd(), filePath)}`)
  }

  console.log(
    `\nDone. Applied ${totalChanges} change(s) across ${modifiedFiles.length} file(s).`
  )
}

export { main }
