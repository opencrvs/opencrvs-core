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
 * Codemod: Remove `review` property from `REGISTER` type actions inside `defineConfig` calls.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/remove-review-from-register-action.ts
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds every `defineConfig({ ... })` call expression
 *   - Inside the `actions` array of that config, locates object literals
 *     whose `type` property resolves to `ActionType.REGISTER` or the string literal `"REGISTER"`
 *   - Removes the `review` property assignment from those objects
 *   - Saves the modified files in-place
 */

import { Project, SyntaxKind, ObjectLiteralExpression, Node } from 'ts-morph'
import path from 'path'
import { getCwd } from '.'

const DEFINE_CONFIG_NAME = 'defineConfig'
const ACTIONS_PROPERTY_NAME = 'actions'
const TYPE_PROPERTY_NAME = 'type'
const REVIEW_PROPERTY_NAME = 'review'
const REGISTER_ENUM_NAME = 'ActionType'
const REGISTER_MEMBER_NAME = 'REGISTER'
const REGISTER_STRING_LITERAL = 'REGISTER'

function isRegisterType(typeInitializer: Node): boolean {
  // Matches: ActionType.REGISTER
  if (typeInitializer.getKind() === SyntaxKind.PropertyAccessExpression) {
    const propAccess = typeInitializer.asKindOrThrow(
      SyntaxKind.PropertyAccessExpression
    )
    const obj = propAccess.getExpression()
    const member = propAccess.getName()
    return (
      Node.isIdentifier(obj) &&
      obj.getText() === REGISTER_ENUM_NAME &&
      member === REGISTER_MEMBER_NAME
    )
  }

  // Matches: "REGISTER"
  if (typeInitializer.getKind() === SyntaxKind.StringLiteral) {
    return (
      typeInitializer
        .asKindOrThrow(SyntaxKind.StringLiteral)
        .getLiteralValue() === REGISTER_STRING_LITERAL
    )
  }

  return false
}

function removeReviewFromRegisterActions(
  obj: ObjectLiteralExpression
): boolean {
  const typeProperty = obj.getProperty(TYPE_PROPERTY_NAME)

  if (!typeProperty || !Node.isPropertyAssignment(typeProperty)) {
    return false
  }

  const typeInitializer = typeProperty.getInitializer()

  if (!typeInitializer || !isRegisterType(typeInitializer)) {
    return false
  }

  const reviewProperty = obj.getProperty(REVIEW_PROPERTY_NAME)

  if (!reviewProperty) {
    return false
  }

  reviewProperty.remove()
  return true
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

    // Iterate over every element in the `actions` array
    for (const element of actionsInitializer.getElements()) {
      if (!Node.isObjectLiteralExpression(element)) continue

      const wasRemoved = removeReviewFromRegisterActions(element)
      if (wasRemoved) {
        removedCount++
        console.log(
          `  [${path.relative(getCwd(), filePath)}] Removed 'review' from REGISTER action`
        )
      }
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
    // addFilesFromTsConfig: true
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
      "No 'review' properties found on REGISTER actions. Nothing to do."
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
    `\nDone. Removed ${totalRemoved} 'review' property assignment(s) from REGISTER action(s).`
  )
}

export { main }
