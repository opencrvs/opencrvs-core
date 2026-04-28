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
 * Codemod: Remove `DELETE` type actions from the `actions` array inside `defineConfig` calls.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/remove-delete-actions.ts
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds every `defineConfig({ ... })` call expression
 *   - Inside the `actions` array of that config, locates object literals
 *     whose `type` property resolves to `ActionType.DELETE` or the string literal `"DELETE"`
 *   - Removes those action objects entirely from the array
 *   - Saves the modified files in-place
 */

import { Project, SyntaxKind, ObjectLiteralExpression, Node } from 'ts-morph'
import path from 'path'
import { getCwd } from '.'

const DEFINE_CONFIG_NAME = 'defineConfig'
const ACTIONS_PROPERTY_NAME = 'actions'
const TYPE_PROPERTY_NAME = 'type'
const ACTION_TYPE_ENUM_NAME = 'ActionType'
const DELETE_MEMBER_NAME = 'DELETE'
const DELETE_STRING_LITERAL = 'DELETE'

function isDeleteType(typeInitializer: Node): boolean {
  // Matches: ActionType.DELETE
  if (typeInitializer.getKind() === SyntaxKind.PropertyAccessExpression) {
    const propAccess = typeInitializer.asKindOrThrow(
      SyntaxKind.PropertyAccessExpression
    )
    const obj = propAccess.getExpression()
    const member = propAccess.getName()
    return (
      Node.isIdentifier(obj) &&
      obj.getText() === ACTION_TYPE_ENUM_NAME &&
      member === DELETE_MEMBER_NAME
    )
  }

  // Matches: "DELETE"
  if (typeInitializer.getKind() === SyntaxKind.StringLiteral) {
    return (
      typeInitializer
        .asKindOrThrow(SyntaxKind.StringLiteral)
        .getLiteralValue() === DELETE_STRING_LITERAL
    )
  }

  return false
}

function isDeleteAction(obj: ObjectLiteralExpression): boolean {
  const typeProperty = obj.getProperty(TYPE_PROPERTY_NAME)

  if (!typeProperty || !Node.isPropertyAssignment(typeProperty)) {
    return false
  }

  const typeInitializer = typeProperty.getInitializer()

  return !!typeInitializer && isDeleteType(typeInitializer)
}

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let removedCount = 0

  // Find all call expressions named `defineConfig`
  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  )

  for (const call of callExpressions) {
    const expression = call.getExpression()

    // Only interested in bare `defineConfig(...)` calls
    if (
      !Node.isIdentifier(expression) ||
      expression.getText() !== DEFINE_CONFIG_NAME
    ) {
      continue
    }

    const args = call.getArguments()
    if (args.length === 0) continue

    // The first argument should be the config object literal
    const configArg = args[0]
    if (!Node.isObjectLiteralExpression(configArg)) continue

    // Find the `actions` property inside the config object
    const actionsProperty = configArg.getProperty(ACTIONS_PROPERTY_NAME)
    if (!actionsProperty || !Node.isPropertyAssignment(actionsProperty))
      continue

    const actionsInitializer = actionsProperty.getInitializer()
    if (
      !actionsInitializer ||
      !Node.isArrayLiteralExpression(actionsInitializer)
    )
      continue

    // Collect indices of DELETE actions in reverse order so removal doesn't
    // shift the indices of elements yet to be processed
    const indicesToRemove: number[] = []

    actionsInitializer.getElements().forEach((element, index) => {
      if (Node.isObjectLiteralExpression(element) && isDeleteAction(element)) {
        indicesToRemove.push(index)
      }
    })

    for (const index of indicesToRemove.reverse()) {
      actionsInitializer.removeElement(index)
      removedCount++
      console.log(
        `  [${path.relative(getCwd(), filePath)}] Removed DELETE action at index ${index}`
      )
    }
  }

  return removedCount
}

async function main() {
  const srcDir = path.join(getCwd(), 'src')
  console.log(`Scanning for defineConfig calls in: ${srcDir}\n`)

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    // Do not emit — we only manipulate source files
    skipAddingFilesFromTsConfig: false
  })

  // Restrict to source files only (exclude node_modules, build artefacts, etc.)
  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  console.log(`Found ${sourceFiles.length} source file(s) to analyse.\n`)

  let totalRemoved = 0
  const modifiedFiles: string[] = []

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const removed = processFile(filePath, project)

    if (removed > 0) {
      totalRemoved += removed
      modifiedFiles.push(filePath)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log(
      'No DELETE actions found inside defineConfig calls. Nothing to do.'
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
    `\nDone. Removed ${totalRemoved} DELETE action(s) from defineConfig call(s).`
  )
}

export { main }
