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
 * Codemod: migrate deprecated workqueue `actions` array to singular `action`.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/migrate-workqueue-configs.ts
 *
 * What it does:
 *   - Scans TypeScript files under `src/`
 *   - Finds `defineWorkqueues([...])` calls
 *   - For each workqueue object:
 *       - `actions: []`                      -> removes `actions`
 *       - `actions: [{ ... }]`               -> replaces with `action: { ... }` if type is supported
 *       - `actions: [{ type: 'DEFAULT' }]`   -> removes `actions` and does not create `action`
 *       - `actions: [{...}, {...}, ...]`     -> keeps first as `action`, warns about dropped extras
 *   - If `action` already exists, removes deprecated `actions` and keeps `action`
 *   - Removes unsupported `action.type` values (`DEFAULT`, `VALIDATE`, etc.)
 *   - Ensures every workqueue ends up with a valid `action`. When none is
 *     present (or the existing one is unsupported), falls back to
 *     `action: { type: ActionType.READ }` and ensures `ActionType` is imported
 *     from `@opencrvs/toolkit/events` in the file.
 *   - Saves modified files in-place
 */

import {
  Node,
  ObjectLiteralExpression,
  Project,
  SourceFile,
  SyntaxKind
} from 'ts-morph'
import path from 'path'
const DEFINE_WORKQUEUES_NAME = 'defineWorkqueues'
const ACTIONS_PROPERTY_NAME = 'actions'
const ACTION_PROPERTY_NAME = 'action'
const CONDITIONALS_PROPERTY_NAME = 'conditionals'
const TYPE_PROPERTY_NAME = 'type'
const SLUG_PROPERTY_NAME = 'slug'
const READ_ACTION_TYPE = 'READ'
const ACTION_TYPE_IMPORT_NAME = 'ActionType'
const TOOLKIT_EVENTS_MODULE = '@opencrvs/toolkit/events'
const READ_ACTION_FALLBACK_INITIALIZER = `{ type: ${ACTION_TYPE_IMPORT_NAME}.${READ_ACTION_TYPE} }`
const SUPPORTED_WORKQUEUE_ACTION_TYPES = new Set([
  'READ',
  'DELETE',
  'DECLARE',
  'REGISTER',
  'EDIT',
  'REJECT',
  'MARK_AS_DUPLICATE',
  'ARCHIVE',
  'PRINT_CERTIFICATE',
  'REQUEST_CORRECTION'
])

function getWorkqueueLabel(workqueue: ObjectLiteralExpression): string {
  const slugProperty = workqueue.getProperty(SLUG_PROPERTY_NAME)
  if (!slugProperty || !Node.isPropertyAssignment(slugProperty)) {
    return '(unknown slug)'
  }

  const slugInitializer = slugProperty.getInitializer()
  if (!slugInitializer || !Node.isStringLiteral(slugInitializer)) {
    return '(unknown slug)'
  }

  return slugInitializer.getLiteralValue()
}

function getActionTypeName(action: ObjectLiteralExpression): string | null {
  const typeProperty = action.getProperty(TYPE_PROPERTY_NAME)
  if (!typeProperty || !Node.isPropertyAssignment(typeProperty)) {
    return null
  }

  const typeInitializer = typeProperty.getInitializer()
  if (!typeInitializer) {
    return null
  }

  if (Node.isStringLiteral(typeInitializer)) {
    return typeInitializer.getLiteralValue()
  }

  if (Node.isPropertyAccessExpression(typeInitializer)) {
    return typeInitializer.getName()
  }

  return null
}

function isUnsupportedActionType(action: ObjectLiteralExpression): boolean {
  const typeName = getActionTypeName(action)
  if (!typeName) {
    return false
  }

  return !SUPPORTED_WORKQUEUE_ACTION_TYPES.has(typeName)
}

/**
 * Ensures the workqueue has a valid singular `action` property. When the
 * existing `action` is missing or has an unsupported type, replaces it with
 * `action: { type: ActionType.READ }`.
 *
 * Returns whether anything was changed and whether the READ fallback was
 * applied (so the caller can ensure `ActionType` is imported in the file).
 */
function ensureValidAction(
  workqueue: ObjectLiteralExpression,
  relPath: string
): { changed: boolean; usedReadFallback: boolean } {
  const workqueueLabel = getWorkqueueLabel(workqueue)
  const actionProperty = workqueue.getProperty(ACTION_PROPERTY_NAME)

  if (actionProperty && Node.isPropertyAssignment(actionProperty)) {
    const initializer = actionProperty.getInitializer()
    if (initializer && Node.isObjectLiteralExpression(initializer)) {
      if (!isUnsupportedActionType(initializer)) {
        return { changed: false, usedReadFallback: false }
      }

      actionProperty.set({
        name: ACTION_PROPERTY_NAME,
        initializer: READ_ACTION_FALLBACK_INITIALIZER
      })
      // eslint-disable-next-line no-console
      console.log(
        `  [${relPath}] Replaced unsupported 'action' type with '${ACTION_TYPE_IMPORT_NAME}.${READ_ACTION_TYPE}' on workqueue '${workqueueLabel}'`
      )
      return { changed: true, usedReadFallback: true }
    }
  }

  workqueue.addPropertyAssignment({
    name: ACTION_PROPERTY_NAME,
    initializer: READ_ACTION_FALLBACK_INITIALIZER
  })
  // eslint-disable-next-line no-console
  console.log(
    `  [${relPath}] Added default 'action: ${READ_ACTION_FALLBACK_INITIALIZER}' to workqueue '${workqueueLabel}'`
  )
  return { changed: true, usedReadFallback: true }
}

function migrateWorkqueueActions(
  workqueue: ObjectLiteralExpression,
  relPath: string
): { changed: boolean; usedReadFallback: boolean } {
  const workqueueLabel = getWorkqueueLabel(workqueue)
  const actionsProperty = workqueue.getProperty(ACTIONS_PROPERTY_NAME)
  let actionsArrayMigrated = false

  if (actionsProperty && Node.isPropertyAssignment(actionsProperty)) {
    const actionsInitializer = actionsProperty.getInitializer()
    if (
      actionsInitializer &&
      Node.isArrayLiteralExpression(actionsInitializer)
    ) {
      const existingActionProperty = workqueue.getProperty(ACTION_PROPERTY_NAME)

      if (existingActionProperty) {
        if (Node.isPropertyAssignment(existingActionProperty)) {
          const existingActionInitializer =
            existingActionProperty.getInitializer()
          if (
            existingActionInitializer &&
            Node.isObjectLiteralExpression(existingActionInitializer)
          ) {
            const conditionalsProperty = existingActionInitializer.getProperty(
              CONDITIONALS_PROPERTY_NAME
            )
            if (conditionalsProperty) {
              conditionalsProperty.remove()
              // eslint-disable-next-line no-console
              console.log(
                `  [${relPath}] Removed deprecated 'conditionals' from 'action' on workqueue '${workqueueLabel}'`
              )
            }
          }
        }

        actionsProperty.remove()
        // eslint-disable-next-line no-console
        console.log(
          `  [${relPath}] Removed deprecated 'actions' from workqueue '${workqueueLabel}' (existing 'action' kept)`
        )
        actionsArrayMigrated = true
      } else {
        const actionCandidates = actionsInitializer
          .getElements()
          .filter((element): element is ObjectLiteralExpression =>
            Node.isObjectLiteralExpression(element)
          )

        if (actionCandidates.length === 0) {
          actionsProperty.remove()
          // eslint-disable-next-line no-console
          console.log(
            `  [${relPath}] Removed empty 'actions' from workqueue '${workqueueLabel}'`
          )
          actionsArrayMigrated = true
        } else {
          if (actionCandidates.length > 1) {
            const droppedCount = actionCandidates.length - 1
            // eslint-disable-next-line no-console
            console.warn(
              `  [${relPath}] Workqueue '${workqueueLabel}' has ${actionCandidates.length} actions; keeping first as 'action' and dropping ${droppedCount} extra action(s)`
            )
          }

          const conditionalsProperty = actionCandidates[0].getProperty(
            CONDITIONALS_PROPERTY_NAME
          )
          if (conditionalsProperty) {
            conditionalsProperty.remove()
            // eslint-disable-next-line no-console
            console.log(
              `  [${relPath}] Removed deprecated 'conditionals' from migrated 'action' on workqueue '${workqueueLabel}'`
            )
          }

          if (isUnsupportedActionType(actionCandidates[0])) {
            actionsProperty.remove()
            // eslint-disable-next-line no-console
            console.log(
              `  [${relPath}] Removed deprecated 'actions' from workqueue '${workqueueLabel}' because action type is unsupported`
            )
            actionsArrayMigrated = true
          } else {
            const firstActionText = actionCandidates[0].getText()
            workqueue.addPropertyAssignment({
              name: ACTION_PROPERTY_NAME,
              initializer: firstActionText
            })
            actionsProperty.remove()
            // eslint-disable-next-line no-console
            console.log(
              `  [${relPath}] Replaced 'actions' with 'action' on workqueue '${workqueueLabel}'`
            )
            actionsArrayMigrated = true
          }
        }
      }
    }
  }

  // Always ensure the workqueue ends up with a valid `action`. This both
  // covers workqueues that never had an `actions` array, and patches up
  // workqueues whose existing/migrated action type is unsupported.
  const fallback = ensureValidAction(workqueue, relPath)

  return {
    changed: actionsArrayMigrated || fallback.changed,
    usedReadFallback: fallback.usedReadFallback
  }
}

/**
 * Ensures `import { ActionType } from '@opencrvs/toolkit/events'` exists in
 * the source file, merging into any existing import declaration from the
 * same module specifier.
 */
function ensureActionTypeImport(sourceFile: SourceFile): void {
  const existingImport = sourceFile.getImportDeclaration(
    (decl) => decl.getModuleSpecifierValue() === TOOLKIT_EVENTS_MODULE
  )

  if (existingImport) {
    const alreadyImported = existingImport
      .getNamedImports()
      .some((ni) => ni.getName() === ACTION_TYPE_IMPORT_NAME)
    if (!alreadyImported) {
      existingImport.addNamedImport(ACTION_TYPE_IMPORT_NAME)
    }
    return
  }

  sourceFile.addImportDeclaration({
    moduleSpecifier: TOOLKIT_EVENTS_MODULE,
    namedImports: [ACTION_TYPE_IMPORT_NAME]
  })
}

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let migratedWorkqueues = 0
  let needsActionTypeImport = false
  const relPath = path.relative(process.cwd(), filePath)

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

    const workqueuesArg = args[0]
    if (!Node.isArrayLiteralExpression(workqueuesArg)) continue

    for (const element of workqueuesArg.getElements()) {
      if (!Node.isObjectLiteralExpression(element)) continue
      const result = migrateWorkqueueActions(element, relPath)
      if (result.changed) migratedWorkqueues++
      if (result.usedReadFallback) needsActionTypeImport = true
    }
  }

  if (needsActionTypeImport) {
    ensureActionTypeImport(sourceFile)
  }

  return migratedWorkqueues
}

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  // eslint-disable-next-line no-console
  console.log(`Scanning for defineWorkqueues calls in: ${srcDir}\n`)

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.log(
      "No deprecated workqueue 'actions' arrays found inside defineWorkqueues calls. Nothing to do."
    )
    return
  }

  // eslint-disable-next-line no-console
  console.log(`\nSaving ${modifiedFiles.length} modified file(s)...`)

  for (const filePath of modifiedFiles) {
    const sourceFile = project.getSourceFileOrThrow(filePath)
    await sourceFile.save()
    // eslint-disable-next-line no-console
    console.log(`  Saved: ${path.relative(process.cwd(), filePath)}`)
  }

  // eslint-disable-next-line no-console
  console.log(
    `\nDone. Migrated ${totalMigrated} deprecated workqueue 'actions' definition(s) to 'action'.`
  )
}

export { main }
