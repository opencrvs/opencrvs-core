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
 *   ts-node -r tsconfig-paths/register src/migrations/v2.2/read-declaration-through-helper.ts
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
 *     (`x?.declaration`), assignments to `x.declaration` and destructuring
 *     `{ declaration }` out of an `EventConfig`
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

const EVENT_CONFIG_TYPE_NAME = 'EventConfig'
const DECLARATION_PROPERTY_NAME = 'declaration'
const GET_DECLARATION_NAME = 'getDeclaration'
const TOOLKIT_EVENTS_MODULE = '@opencrvs/toolkit/events'

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

function isAssignmentTarget(node: PropertyAccessExpression) {
  const parent = node.getParent()

  return (
    Node.isBinaryExpression(parent) &&
    parent.getLeft() === node &&
    parent.getOperatorToken().getKind() === SyntaxKind.EqualsToken
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

function addGetDeclarationImport(sourceFile: SourceFile) {
  // A type-only import cannot carry a function, so only a value import is extended
  const toolkitImport = sourceFile.getImportDeclaration(
    (declaration) =>
      declaration.getModuleSpecifierValue() === TOOLKIT_EVENTS_MODULE &&
      !declaration.isTypeOnly()
  )

  if (!toolkitImport) {
    // Inserted as text so the import keeps the country config's style
    // (single quotes, no semicolon) rather than ts-morph's defaults
    sourceFile.insertStatements(
      sourceFile.getImportDeclarations().length,
      `import { ${GET_DECLARATION_NAME} } from '${TOOLKIT_EVENTS_MODULE}'`
    )
    return
  }

  const alreadyImported = toolkitImport
    .getNamedImports()
    .some((namedImport) => namedImport.getName() === GET_DECLARATION_NAME)

  if (alreadyImported) {
    return
  }

  const namedImports = toolkitImport.getNamedImports()

  // ts-morph's addNamedImport collapses a multi-line import onto one line, so
  // the import is rewritten keeping one name per line when it had them
  if (
    toolkitImport.getDefaultImport() ||
    toolkitImport.getNamespaceImport() ||
    namedImports.length === 0
  ) {
    toolkitImport.addNamedImport(GET_DECLARATION_NAME)
    return
  }

  const names = [
    ...namedImports.map((namedImport) => namedImport.getText()),
    GET_DECLARATION_NAME
  ]
  const specifiers = toolkitImport.getText().includes('\n')
    ? `{\n  ${names.join(',\n  ')}\n}`
    : `{ ${names.join(', ')} }`

  toolkitImport.replaceWithText(
    `import ${specifiers} from '${TOOLKIT_EVENTS_MODULE}'`
  )
}

/**
 * Rewrites every `x.declaration` read on an `EventConfig` in the file to
 * `getDeclaration(x)`.
 *
 * @returns the number of reads rewritten.
 */
export function rewriteDeclarationReads(sourceFile: SourceFile): number {
  warnDestructuredDeclarations(sourceFile)

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

      if (isAssignmentTarget(node)) {
        console.warn(
          `  [${location(node)}] Skipped assignment to \`${node.getText()}\`. Set \`${DECLARATION_PROPERTY_NAME}\` on the DECLARE action instead.`
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

  for (const read of reads) {
    console.log(
      `  [${location(read)}] ${read.getText()} -> ${GET_DECLARATION_NAME}(${read.getExpression().getText()})`
    )
    read.replaceWithText(
      `${GET_DECLARATION_NAME}(${read.getExpression().getText()})`
    )
  }

  addGetDeclarationImport(sourceFile)

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
