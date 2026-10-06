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
 * Codemod: replace the removed `incomplete` flag with the NOTIFIED status.
 *
 * Why:
 *   `InherentFlags.INCOMPLETE` mirrored the NOTIFIED status and has been
 *   removed. See CHANGELOG.md ("The `incomplete` flag is removed").
 *
 * What it does:
 *   - In every query object of the form
 *     `{ flags: { anyOf: [InherentFlags.INCOMPLETE, ...] }, ... }`, removes
 *     the flag (and `anyOf` / `flags` if left empty) and adds
 *     `status: { type: 'exact', term: EventStatus.enum.NOTIFIED }`
 *   - Imports `EventStatus` next to `InherentFlags` when missing
 *   - Lists any other `InherentFlags.INCOMPLETE` reference for manual update
 */

import { Node, Project, SourceFile, SyntaxKind } from 'ts-morph'
import path from 'path'

const INCOMPLETE = 'InherentFlags.INCOMPLETE'
const NOTIFIED_STATUS = `{ type: 'exact', term: EventStatus.enum.NOTIFIED }`

function ensureEventStatusImport(sourceFile: SourceFile) {
  const importDeclaration = sourceFile
    .getImportDeclarations()
    .find((declaration) =>
      declaration
        .getNamedImports()
        .some((named) => named.getName() === 'InherentFlags')
    )
  const hasEventStatus = importDeclaration
    ?.getNamedImports()
    .some((named) => named.getName() === 'EventStatus')
  if (importDeclaration && !hasEventStatus) {
    importDeclaration.addNamedImport('EventStatus')
  }
}

/**
 * Rewrites `flags.anyOf` uses of the incomplete flag in place.
 * Returns the line numbers of references it could not rewrite.
 */
export function replaceIncompleteFlag(sourceFile: SourceFile) {
  let changed = false

  const anyOfIncomplete = sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((node) => node.getText() === INCOMPLETE)
    .map((node) => node.getParent())
    .filter(Node.isArrayLiteralExpression)
    .filter((array) => {
      const anyOf = array.getParent()
      const flags = anyOf?.getParent()?.getParent()
      return (
        Node.isPropertyAssignment(anyOf) &&
        anyOf.getName() === 'anyOf' &&
        Node.isPropertyAssignment(flags) &&
        flags.getName() === 'flags'
      )
    })

  for (const array of anyOfIncomplete) {
    const anyOf = array.getParentIfKindOrThrow(SyntaxKind.PropertyAssignment)
    const flagsObject = anyOf.getParentIfKindOrThrow(
      SyntaxKind.ObjectLiteralExpression
    )
    const flags = flagsObject.getParentIfKindOrThrow(
      SyntaxKind.PropertyAssignment
    )
    const query = flags.getParentIfKindOrThrow(
      SyntaxKind.ObjectLiteralExpression
    )

    array
      .getElements()
      .filter((element) => element.getText() === INCOMPLETE)
      .forEach((element) => array.removeElement(element))
    if (array.getElements().length === 0) anyOf.remove()
    if (flagsObject.getProperties().length === 0) flags.remove()

    if (!query.getProperty('status')) {
      query.addPropertyAssignment({
        name: 'status',
        initializer: NOTIFIED_STATUS
      })
    }
    changed = true
  }

  if (changed) ensureEventStatusImport(sourceFile)

  const remaining = sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((node) => node.getText() === INCOMPLETE)
    .map((node) => node.getStartLineNumber())

  return { changed, remaining }
}

export async function main() {
  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json')
  })
  const sourceFiles = project
    .getSourceFiles()
    .filter((sf) => !sf.getFilePath().includes('/node_modules/'))

  for (const sourceFile of sourceFiles) {
    const relPath = path.relative(process.cwd(), sourceFile.getFilePath())
    const { changed, remaining } = replaceIncompleteFlag(sourceFile)

    if (changed) {
      await sourceFile.save()
      console.log(
        `  [${relPath}] Replaced the incomplete flag with the NOTIFIED status`
      )
    }
    for (const line of remaining) {
      console.warn(
        `  [${relPath}:${line}] ${INCOMPLETE} was removed, update this reference to use the NOTIFIED status`
      )
    }
  }
}
