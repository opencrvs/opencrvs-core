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
 * Codemod: Update action confirmation handler parameter type from:
 *   action: ActionInput
 * to:
 *   action: Extract<ActionInput, { type?: 'REGISTER' }>
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds function parameters named `action` with type exactly `ActionInput`
 *   - Rewrites the type annotation to the extracted REGISTER action subtype
 *   - Saves modified files in-place
 */

/* eslint-disable no-console */

import { Project, SyntaxKind } from 'ts-morph'
import path from 'path'
const TARGET_FUNCTION_NAME = 'acceptRequestedRegistration'
const ACTION_PARAMETER_NAME = 'action'
const OLD_TYPE = 'ActionInput'
const NEW_TYPE = "Extract<ActionInput, { type?: 'REGISTER' }>"

function isTargetFunctionParameter(
  parameter: import('ts-morph').ParameterDeclaration
): boolean {
  const functionDeclaration = parameter.getFirstAncestorByKind(
    SyntaxKind.FunctionDeclaration
  )

  if (functionDeclaration?.getName() === TARGET_FUNCTION_NAME) {
    return true
  }

  const arrowFunction = parameter.getFirstAncestorByKind(
    SyntaxKind.ArrowFunction
  )
  const variableDeclaration = arrowFunction?.getFirstAncestorByKind(
    SyntaxKind.VariableDeclaration
  )

  return variableDeclaration?.getName() === TARGET_FUNCTION_NAME
}

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let updatedCount = 0
  const parameters = sourceFile.getDescendantsOfKind(SyntaxKind.Parameter)

  for (const parameter of parameters) {
    if (parameter.getName() !== ACTION_PARAMETER_NAME) {
      continue
    }
    if (!isTargetFunctionParameter(parameter)) {
      continue
    }

    const typeNode = parameter.getTypeNode()
    if (!typeNode) continue

    if (typeNode.getText() !== OLD_TYPE) {
      continue
    }

    parameter.setType(NEW_TYPE)
    updatedCount++
    console.log(
      `  [${path.relative(process.cwd(), filePath)}] Updated '${ACTION_PARAMETER_NAME}' parameter type to ${NEW_TYPE}`
    )
  }

  return updatedCount
}

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(`Scanning for action confirmation handler types in: ${srcDir}\n`)

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const filePath = sf.getFilePath()
    return filePath.includes('/src/') && !filePath.includes('/node_modules/')
  })

  let totalUpdated = 0
  const modifiedFiles: string[] = []

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const updated = processFile(filePath, project)

    if (updated > 0) {
      totalUpdated += updated
      modifiedFiles.push(filePath)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log(
      `No '${ACTION_PARAMETER_NAME}: ${OLD_TYPE}' parameter signatures found. Nothing to do.`
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
    `\nDone. Updated ${totalUpdated} '${ACTION_PARAMETER_NAME}' parameter type annotation(s).`
  )
}

export { main }
