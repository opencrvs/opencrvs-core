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
 * Codemod: Remove `InherentFlags.PENDING_CERTIFICATION` from any array literal.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/remove-pending-certification-flag.ts
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds every array literal in every file
 *   - Removes any element that is the property access expression
 *     `InherentFlags.PENDING_CERTIFICATION`
 *   - Saves the modified files in-place
 */

import { Project, SyntaxKind, Node } from 'ts-morph'
import path from 'path'

const INHERENT_FLAGS_ENUM_NAME = 'InherentFlags'
const PENDING_CERTIFICATION_MEMBER = 'PENDING_CERTIFICATION'

function isPendingCertificationFlag(node: Node): boolean {
  if (!Node.isPropertyAccessExpression(node)) return false
  const obj = node.getExpression()
  const member = node.getName()
  return (
    Node.isIdentifier(obj) &&
    obj.getText() === INHERENT_FLAGS_ENUM_NAME &&
    member === PENDING_CERTIFICATION_MEMBER
  )
}

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let removedCount = 0

  const arrayLiterals = sourceFile.getDescendantsOfKind(
    SyntaxKind.ArrayLiteralExpression
  )

  for (const array of arrayLiterals) {
    // Collect indices in reverse order so removal doesn't shift remaining indices
    const indicesToRemove: number[] = []

    array.getElements().forEach((element, index) => {
      if (isPendingCertificationFlag(element)) {
        indicesToRemove.push(index)
      }
    })

    for (const index of indicesToRemove.reverse()) {
      array.removeElement(index)
      removedCount++
      console.log(
        `  [${path.relative(process.cwd(), filePath)}] Removed InherentFlags.PENDING_CERTIFICATION from array`
      )
    }
  }

  return removedCount
}

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(
    `Scanning for InherentFlags.PENDING_CERTIFICATION array elements in: ${srcDir}\n`
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
      'No InherentFlags.PENDING_CERTIFICATION elements found in any array. Nothing to do.'
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
    `\nDone. Removed ${totalRemoved} InherentFlags.PENDING_CERTIFICATION element(s) from array(s).`
  )
}

export { main }
