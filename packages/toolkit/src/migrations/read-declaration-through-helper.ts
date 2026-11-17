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
 * Codemod: Read an event configuration's declaration form through
 * `getDeclaration()` instead of the top-level `declaration` property.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/read-declaration-through-helper.ts
 *
 * Why:
 *   As of v2.2 the declaration form lives on the DECLARE action. `defineConfig`
 *   still accepts a top-level `declaration` and moves it there, but the parsed
 *   `EventConfig` no longer has a top-level `declaration` property, so code
 *   reading `eventConfig.declaration` stops compiling.
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Rewrites `x.declaration` to `getDeclaration(x)` wherever `x` is the
 *     toolkit's `EventConfig`. Record data (e.g. `event.declaration`) is a
 *     different type and is left alone.
 *   - Adds `getDeclaration` to the file's `@opencrvs/toolkit/events` import
 *   - Logs, without changing, reads it cannot rewrite safely: optional chains
 *     (`x?.declaration`), writes to `x.declaration` (`=`, `??=`, `delete`...)
 *     and destructuring `{ declaration }` out of an `EventConfig`
 *   - Logs object literals that spread an `EventConfig` and set `declaration`
 *     next to it, which `defineConfig` now rejects
 *   - Leaves a file alone, and logs it, when it already declares its own
 *     `getDeclaration`
 *   - Saves the modified files in-place
 */

import {
  Node,
  Project,
  PropertyAccessExpression,
  SourceFile,
  SyntaxKind,
  Type
} from 'ts-morph'
import path from 'path'
import { addToolkitImport, findToolkitImportName } from './utils'

const EVENT_CONFIG_TYPE_NAME = 'EventConfig'
const DECLARATION_PROPERTY_NAME = 'declaration'
const GET_DECLARATION_NAME = 'getDeclaration'

/**
 * Returns true if the type is the `EventConfig` type published by the toolkit,
 * as opposed to a type of the same name declared in the country config itself.
 */
function isToolkitEventConfig(type: Type): boolean {
  const nonNullableType = type.getNonNullableType()
  const symbol = nonNullableType.getAliasSymbol() ?? nonNullableType.getSymbol()

  if (symbol?.getName() !== EVENT_CONFIG_TYPE_NAME) {
    return false
  }

  return symbol
    .getDeclarations()
    .some((declaration) => declaration.getSourceFile().isDeclarationFile())
}

function isDeclarationReadOnEventConfig(node: PropertyAccessExpression) {
  return (
    node.getName() === DECLARATION_PROPERTY_NAME &&
    isToolkitEventConfig(node.getExpression().getType())
  )
}

function isAssignmentOperator(kind: SyntaxKind) {
  return kind >= SyntaxKind.FirstAssignment && kind <= SyntaxKind.LastAssignment
}

/**
 * Returns true if the node is written to rather than read: the target of `=` or
 * a compound assignment (`??=`, `||=`...), or the operand of `delete`.
 * `getDeclaration(x)` is a call, so rewriting any of these does not compile.
 */
function isWriteTarget(node: PropertyAccessExpression) {
  const parent = node.getParent()

  if (Node.isDeleteExpression(parent)) {
    return true
  }

  return (
    Node.isBinaryExpression(parent) &&
    parent.getLeft() === node &&
    isAssignmentOperator(parent.getOperatorToken().getKind())
  )
}

function location(node: Node) {
  const relPath = path.relative(
    process.cwd(),
    node.getSourceFile().getFilePath()
  )
  return `${relPath}:${node.getStartLineNumber()}`
}

function warnDestructuredDeclarations(sourceFile: SourceFile) {
  for (const pattern of sourceFile.getDescendantsOfKind(
    SyntaxKind.ObjectBindingPattern
  )) {
    const destructuresDeclaration = pattern
      .getElements()
      .some(
        (element) =>
          (element.getPropertyNameNode()?.getText() ?? element.getName()) ===
          DECLARATION_PROPERTY_NAME
      )

    if (destructuresDeclaration && isToolkitEventConfig(pattern.getType())) {
      console.warn(
        `  [${location(pattern)}] Destructures \`${DECLARATION_PROPERTY_NAME}\` from an EventConfig. Rewrite it to use \`${GET_DECLARATION_NAME}(config)\` by hand.`
      )
    }
  }
}

function warnSpreadDeclarations(sourceFile: SourceFile) {
  for (const literal of sourceFile.getDescendantsOfKind(
    SyntaxKind.ObjectLiteralExpression
  )) {
    const properties = literal.getProperties()

    const spreadsEventConfig = properties.some(
      (property) =>
        Node.isSpreadAssignment(property) &&
        isToolkitEventConfig(property.getExpression().getType())
    )

    const setsDeclaration = properties.some(
      (property) =>
        (Node.isPropertyAssignment(property) ||
          Node.isShorthandPropertyAssignment(property)) &&
        property.getName() === DECLARATION_PROPERTY_NAME
    )

    if (spreadsEventConfig && setsDeclaration) {
      console.warn(
        `  [${location(literal)}] Spreads an EventConfig and sets \`${DECLARATION_PROPERTY_NAME}\` next to it. The spread config already has a \`${DECLARATION_PROPERTY_NAME}\` on its DECLARE action, so replace that one by hand.`
      )
    }
  }
}

/**
 * Rewrites every `x.declaration` read on an `EventConfig` in the file to
 * `getDeclaration(x)`.
 *
 * @returns the number of reads rewritten.
 */
export function rewriteDeclarationReads(sourceFile: SourceFile): number {
  warnDestructuredDeclarations(sourceFile)
  warnSpreadDeclarations(sourceFile)

  const reads = sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter(isDeclarationReadOnEventConfig)
    .filter((node) => {
      if (node.hasQuestionDotToken()) {
        console.warn(
          `  [${location(node)}] Skipped optional chain \`${node.getText()}\`. Rewrite it to use \`${GET_DECLARATION_NAME}()\` by hand.`
        )
        return false
      }

      if (isWriteTarget(node)) {
        console.warn(
          `  [${location(node)}] Skipped write to \`${node.getText()}\`. Set \`${DECLARATION_PROPERTY_NAME}\` on the DECLARE action instead.`
        )
        return false
      }

      return true
    })
    // Replace the innermost reads first, so replacing an outer read does not
    // invalidate nodes still waiting to be replaced.
    .sort((a, b) => b.getStart() - a.getStart())

  if (reads.length === 0) {
    return 0
  }

  const getDeclarationName = findToolkitImportName(
    sourceFile,
    GET_DECLARATION_NAME
  )

  if (!getDeclarationName) {
    console.warn(
      `  [${location(reads[reads.length - 1])}] Skipped ${reads.length} read(s): the file already declares its own \`${GET_DECLARATION_NAME}\`. Rewrite them to use the toolkit's \`${GET_DECLARATION_NAME}()\` by hand.`
    )
    return 0
  }

  for (const read of reads) {
    console.log(
      `  [${location(read)}] ${read.getText()} -> ${getDeclarationName}(${read.getExpression().getText()})`
    )
    read.replaceWithText(
      `${getDeclarationName}(${read.getExpression().getText()})`
    )
  }

  addToolkitImport(sourceFile, GET_DECLARATION_NAME)

  return reads.length
}

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(`Scanning for EventConfig declaration reads in: ${srcDir}\n`)

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  console.log(`Found ${sourceFiles.length} source file(s) to analyse.\n`)

  let totalChanges = 0
  const modifiedFiles: SourceFile[] = []

  for (const sourceFile of sourceFiles) {
    const changes = rewriteDeclarationReads(sourceFile)

    if (changes > 0) {
      totalChanges += changes
      modifiedFiles.push(sourceFile)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log('No EventConfig declaration reads found. Nothing to do.')
    return
  }

  console.log(`\nSaving ${modifiedFiles.length} modified file(s)...`)

  for (const sourceFile of modifiedFiles) {
    await sourceFile.save()
    console.log(
      `  Saved: ${path.relative(process.cwd(), sourceFile.getFilePath())}`
    )
  }

  console.log(
    `\nDone. Rewrote ${totalChanges} declaration read(s) across ${modifiedFiles.length} file(s).`
  )
}

export { main }
