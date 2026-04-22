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
 *   - Saves modified files in-place
 */

import { Node, ObjectLiteralExpression, Project, SyntaxKind } from 'ts-morph'
import path from 'path'
import { getCwd } from '.'

const DEFINE_WORKQUEUES_NAME = 'defineWorkqueues'
const ACTIONS_PROPERTY_NAME = 'actions'
const ACTION_PROPERTY_NAME = 'action'
const CONDITIONALS_PROPERTY_NAME = 'conditionals'
const TYPE_PROPERTY_NAME = 'type'
const SLUG_PROPERTY_NAME = 'slug'
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

function migrateWorkqueueActions(
  workqueue: ObjectLiteralExpression,
  relPath: string
): number {
  const actionsProperty = workqueue.getProperty(ACTIONS_PROPERTY_NAME)
  if (!actionsProperty || !Node.isPropertyAssignment(actionsProperty)) {
    return 0
  }

  const actionsInitializer = actionsProperty.getInitializer()
  if (!actionsInitializer || !Node.isArrayLiteralExpression(actionsInitializer)) {
    return 0
  }

  const workqueueLabel = getWorkqueueLabel(workqueue)
  const existingActionProperty = workqueue.getProperty(ACTION_PROPERTY_NAME)

  if (existingActionProperty) {
    if (Node.isPropertyAssignment(existingActionProperty)) {
      const existingActionInitializer = existingActionProperty.getInitializer()
      if (existingActionInitializer && Node.isObjectLiteralExpression(existingActionInitializer)) {
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

        if (isUnsupportedActionType(existingActionInitializer)) {
          existingActionProperty.remove()
          // eslint-disable-next-line no-console
          console.log(
            `  [${relPath}] Removed unsupported 'action' type on workqueue '${workqueueLabel}'`
          )
        }
      }
    }

    actionsProperty.remove()
    // eslint-disable-next-line no-console
    console.log(
      `  [${relPath}] Removed deprecated 'actions' from workqueue '${workqueueLabel}' (existing 'action' kept)`
    )
    return 1
  }

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
    return 1
  }

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
    return 1
  }

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
  return 1
}

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let migratedWorkqueues = 0
  const relPath = path.relative(getCwd(), filePath)

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
      migratedWorkqueues += migrateWorkqueueActions(element, relPath)
    }
  }

  return migratedWorkqueues
}

async function main() {
  const srcDir = path.join(getCwd(), 'src')
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
    console.log(`  Saved: ${path.relative(getCwd(), filePath)}`)
  }

  // eslint-disable-next-line no-console
  console.log(
    `\nDone. Migrated ${totalMigrated} deprecated workqueue 'actions' definition(s) to 'action'.`
  )
}

export { main }
