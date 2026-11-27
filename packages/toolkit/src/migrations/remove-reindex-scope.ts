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
 * Codemod: remove the `record.reindex` scope from the roles.
 *
 * Why:
 *   The reindex runs as a job in the events image and needs no token, so the
 *   scope is removed. A role that still has it fails to parse, and the events
 *   service does not start. See CHANGELOG.md ("The Elasticsearch reindex runs
 *   as a job in the events image").
 *
 * What it does:
 *   - Removes every `{ type: 'record.reindex' }` element from an array
 *   - Lists any other `'record.reindex'` reference for manual update
 */

import { Node, Project, SourceFile, SyntaxKind } from 'ts-morph'
import path from 'path'

const REINDEX_SCOPE = 'record.reindex'

function isReindexScopeLiteral(node: Node) {
  return Node.isStringLiteral(node) && node.getLiteralValue() === REINDEX_SCOPE
}

/**
 * Removes the reindex scope objects from arrays in place.
 * Returns the line numbers of references it could not remove.
 */
export function removeReindexScope(sourceFile: SourceFile) {
  const scopeObjects = sourceFile
    .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
    .filter((object) => {
      const type = object.getProperty('type')
      return (
        Node.isPropertyAssignment(type) &&
        isReindexScopeLiteral(type.getInitializerOrThrow()) &&
        Node.isArrayLiteralExpression(object.getParent())
      )
    })

  for (const object of scopeObjects) {
    object
      .getParentIfKindOrThrow(SyntaxKind.ArrayLiteralExpression)
      .removeElement(object)
  }

  const remaining = sourceFile
    .getDescendantsOfKind(SyntaxKind.StringLiteral)
    .filter(isReindexScopeLiteral)
    .map((node) => node.getStartLineNumber())

  return { changed: scopeObjects.length > 0, remaining }
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
    const { changed, remaining } = removeReindexScope(sourceFile)

    if (changed) {
      await sourceFile.save()
      console.log(`  [${relPath}] Removed the ${REINDEX_SCOPE} scope`)
    }
    for (const line of remaining) {
      console.warn(
        `  [${relPath}:${line}] The ${REINDEX_SCOPE} scope was removed, remove this reference`
      )
    }
  }
}
