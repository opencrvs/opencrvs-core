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

import { Project } from 'ts-morph'
import path from 'path'
import { getCwd } from '.'

const DEPRECATED_IMPORT = 'SCOPES'
const TARGET_MODULES = new Set([
  '@opencrvs/toolkit/scopes',
  '@opencrvs/toolkit'
])

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let removedCount = 0
  const importDecls = sourceFile
    .getImportDeclarations()
    .filter((decl) => TARGET_MODULES.has(decl.getModuleSpecifierValue()))

  for (const decl of importDecls) {
    const matchingNamedImports = decl
      .getNamedImports()
      .filter((ni) => ni.getName() === DEPRECATED_IMPORT)

    if (matchingNamedImports.length === 0) continue

    for (const namedImport of matchingNamedImports) {
      namedImport.remove()
      removedCount++
    }

    const hasAnyNamedImportsLeft = decl.getNamedImports().length > 0
    const hasDefaultImport = !!decl.getDefaultImport()
    const hasNamespaceImport = !!decl.getNamespaceImport()

    // If the declaration only contained SCOPE, remove the now-empty import line.
    if (!hasAnyNamedImportsLeft && !hasDefaultImport && !hasNamespaceImport) {
      decl.remove()
    }

    console.log(
      `  [${path.relative(getCwd(), filePath)}] Removed ${matchingNamedImports.length} deprecated '${DEPRECATED_IMPORT}' import(s) from '${decl.getModuleSpecifierValue()}'`
    )
  }

  return removedCount
}

async function main() {
  const srcDir = path.join(getCwd(), 'src')
  console.log(`Scanning for deprecated imports in: ${srcDir}\n`)

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

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
    console.log('No deprecated imports found. Nothing to do.')
    return
  }

  console.log(`\nSaving ${modifiedFiles.length} modified file(s)...`)
  for (const filePath of modifiedFiles) {
    await project.getSourceFileOrThrow(filePath).save()
    console.log(`  Saved: ${path.relative(getCwd(), filePath)}`)
  }

  console.log(`\nDone. Removed ${totalRemoved} deprecated import(s).`)
}

export { main }
