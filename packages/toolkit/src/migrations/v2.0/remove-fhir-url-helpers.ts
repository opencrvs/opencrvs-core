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
 * Codemod: remove legacy FHIR URL helpers after `FHIR_URL` env cleanup.
 *
 * Targets:
 *   - `FHIR_URL` named imports
 *   - functions: `getFromFhir`, `updateResourceFromHearth`, `updateResourceInHearth`
 *
 * What it does:
 *   1. Removes top-level declarations with one of the helper names.
 *      Supported declaration forms:
 *        - `function getFromFhir(...) {}`
 *        - `const getFromFhir = (...) => {}`
 *        - `export const getFromFhir = (...) => {}`
 *   2. Removes `FHIR_URL` named imports from any import declaration.
 *      Empty import declarations are dropped.
 *   3. Reports any remaining `FHIR_URL` identifier references so developers
 *      can manually clean up unusual patterns.
 */

import path from 'path'
import { Project, SyntaxKind } from 'ts-morph'

const FHIR_IMPORT = 'FHIR_URL'
const HELPER_NAMES = new Set([
  'getFromFhir',
  'updateResourceFromHearth',
  'updateResourceInHearth'
])

interface FileResult {
  removedHelpers: string[]
  removedImportCount: number
  remainingFhirReferences: number
}

function removeHelpers(sourceFilePath: string, project: Project): FileResult {
  const sourceFile = project.getSourceFile(sourceFilePath)
  if (!sourceFile) {
    return {
      removedHelpers: [],
      removedImportCount: 0,
      remainingFhirReferences: 0
    }
  }

  const removedHelpers: string[] = []
  let removedImportCount = 0

  // Function declarations: `function getFromFhir(...) { ... }`
  for (const fn of sourceFile.getFunctions()) {
    const name = fn.getName()
    if (!name || !HELPER_NAMES.has(name)) continue
    removedHelpers.push(name)
    fn.remove()
  }

  // Variable declarations: `const getFromFhir = ...`
  for (const stmt of [...sourceFile.getVariableStatements()]) {
    const declarations = [...stmt.getDeclarations()]
    const toRemove = declarations.filter((decl) => HELPER_NAMES.has(decl.getName()))
    if (toRemove.length === 0) continue

    removedHelpers.push(...toRemove.map((decl) => decl.getName()))

    if (toRemove.length === declarations.length) {
      stmt.remove()
    } else {
      for (const decl of toRemove) decl.remove()
    }
  }

  // Remove FHIR_URL named imports.
  for (const decl of sourceFile.getImportDeclarations()) {
    const matches = decl
      .getNamedImports()
      .filter((ni) => ni.getName() === FHIR_IMPORT)

    if (matches.length === 0) continue

    for (const named of matches) {
      named.remove()
      removedImportCount++
    }

    const hasAnyNamedImportsLeft = decl.getNamedImports().length > 0
    const hasDefaultImport = !!decl.getDefaultImport()
    const hasNamespaceImport = !!decl.getNamespaceImport()

    if (!hasAnyNamedImportsLeft && !hasDefaultImport && !hasNamespaceImport) {
      decl.remove()
    }
  }

  const remainingFhirReferences = sourceFile
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter((id) => id.getText() === FHIR_IMPORT)
    .filter((id) => !id.getFirstAncestorByKind(SyntaxKind.ImportDeclaration))
    .length

  return { removedHelpers, removedImportCount, remainingFhirReferences }
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

  console.log(`Removing legacy FHIR_URL helpers in ${sourceFiles.length} source file(s)...\n`)

  let totalRemovedImports = 0
  let totalRemovedHelpers = 0
  const modifiedFiles: string[] = []
  const warnings: string[] = []

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const rel = path.relative(process.cwd(), filePath)
    const result = removeHelpers(filePath, project)

    const changed =
      result.removedImportCount > 0 || result.removedHelpers.length > 0

    if (changed) {
      modifiedFiles.push(filePath)
      totalRemovedImports += result.removedImportCount
      totalRemovedHelpers += result.removedHelpers.length

      if (result.removedHelpers.length > 0) {
        console.log(
          `  [${rel}] Removed helper(s): ${result.removedHelpers.join(', ')}`
        )
      }
      if (result.removedImportCount > 0) {
        console.log(
          `  [${rel}] Removed ${result.removedImportCount} '${FHIR_IMPORT}' import(s)`
        )
      }
    }

    if (result.remainingFhirReferences > 0) {
      warnings.push(
        `${rel}: ${result.remainingFhirReferences} remaining '${FHIR_IMPORT}' reference(s)`
      )
    }
  }

  if (modifiedFiles.length === 0 && warnings.length === 0) {
    console.log('No FHIR_URL imports/helpers found. Nothing to do.')
    return
  }

  if (modifiedFiles.length > 0) {
    console.log(`\nSaving ${modifiedFiles.length} modified file(s)...`)
    for (const filePath of modifiedFiles) {
      await project.getSourceFileOrThrow(filePath).save()
      console.log(`  Saved: ${path.relative(process.cwd(), filePath)}`)
    }
  }

  if (warnings.length > 0) {
    console.warn(
      `\n  WARNING: Some '${FHIR_IMPORT}' usages remain and need manual cleanup:\n` +
        warnings.map((line) => `    - ${line}`).join('\n')
    )
  }

  console.log(
    `\nDone. Removed ${totalRemovedHelpers} helper declaration(s) and ${totalRemovedImports} '${FHIR_IMPORT}' import(s).`
  )
}

export { main }
