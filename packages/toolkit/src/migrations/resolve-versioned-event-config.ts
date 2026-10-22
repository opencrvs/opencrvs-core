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
 * Codemod: Read a `VersionedEventConfig` through `resolveEventConfig()` wherever
 * the country config uses it as a flat `EventConfig`.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/resolve-versioned-event-config.ts
 *
 * Why:
 *   As of v2.2 an event configuration can have several versions, each with an
 *   `effectiveFrom` date. `defineConfig` still accepts a flat configuration and
 *   wraps it in a single version, but it now returns a `VersionedEventConfig`:
 *   `{ id, label, advancedSearch, versions }`. Fields such as `actions` or
 *   `analytics` live on each version, so code that reads them straight off the
 *   result of `defineConfig`, or passes it to a function expecting an
 *   `EventConfig`, stops compiling.
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Rewrites `x.field` to `resolveEventConfig(x).field` wherever `x` is the
 *     toolkit's `VersionedEventConfig` and `field` is not one of its own fields
 *     (`id`, `label`, `advancedSearch` and `versions` are left alone)
 *   - Rewrites `x` to `resolveEventConfig(x)` wherever a `VersionedEventConfig` is
 *     passed, assigned or returned where an `EventConfig` is expected, and `xs` to
 *     `xs.map(resolveEventConfig)` for arrays of them
 *   - Adds `resolveEventConfig` to the file's `@opencrvs/toolkit/events` import
 *   - Logs, without changing: optional chains (`x?.actions`), writes
 *     (`x.actions = ...`, `delete x.actions`...), destructuring `{ actions }` out
 *     of a `VersionedEventConfig`, and a possibly undefined `VersionedEventConfig`
 *     passed where an `EventConfig` is expected
 *   - Leaves a file alone, and logs it, when it already declares its own
 *     `resolveEventConfig`
 *   - Saves the modified files in-place
 *
 * Runs before `read-declaration-through-helper`, which then rewrites
 * `resolveEventConfig(x).declaration` to `getDeclaration(resolveEventConfig(x))`.
 */

import {
  Expression,
  Node,
  Project,
  PropertyAccessExpression,
  SourceFile,
  SyntaxKind,
  Type
} from 'ts-morph'
import path from 'path'

const EVENT_CONFIG_TYPE_NAME = 'EventConfig'
const VERSIONED_EVENT_CONFIG_TYPE_NAME = 'VersionedEventConfig'
const RESOLVE_EVENT_CONFIG_NAME = 'resolveEventConfig'
const TOOLKIT_EVENTS_MODULE = '@opencrvs/toolkit/events'

/**
 * Returns true if the type is the type of that name published by the toolkit,
 * as opposed to a type of the same name declared in the country config itself.
 */
function isToolkitType(type: Type, name: string): boolean {
  const nonNullableType = type.getNonNullableType()
  const symbol = nonNullableType.getAliasSymbol() ?? nonNullableType.getSymbol()

  if (symbol?.getName() !== name) {
    return false
  }

  return symbol
    .getDeclarations()
    .some((declaration) => declaration.getSourceFile().isDeclarationFile())
}

function isVersionedEventConfig(type: Type) {
  return isToolkitType(type, VERSIONED_EVENT_CONFIG_TYPE_NAME)
}

function isEventConfig(type: Type) {
  return isToolkitType(type, EVENT_CONFIG_TYPE_NAME)
}

function isArrayOf(type: Type, isElement: (element: Type) => boolean) {
  const elementType = type.getNonNullableType().getArrayElementType()
  return elementType !== undefined && isElement(elementType)
}

/** Returns true if `name` is a field of `VersionedEventConfig` itself, e.g. `id` or `versions`. */
function isVersionedField(type: Type, name: string) {
  return type.getNonNullableType().getProperty(name) !== undefined
}

function isAssignmentOperator(kind: SyntaxKind) {
  return kind >= SyntaxKind.FirstAssignment && kind <= SyntaxKind.LastAssignment
}

/**
 * Returns true if the node is written to rather than read: the target of `=` or
 * a compound assignment (`??=`, `||=`...), or the operand of `delete`.
 * `resolveEventConfig(x)` gives a separate object, so writing to it is lost.
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

function warnDestructuredVersionFields(sourceFile: SourceFile) {
  for (const pattern of sourceFile.getDescendantsOfKind(
    SyntaxKind.ObjectBindingPattern
  )) {
    const type = pattern.getType()

    if (!isVersionedEventConfig(type)) {
      continue
    }

    const destructuresVersionField = pattern
      .getElements()
      .some(
        (element) =>
          !element.getDotDotDotToken() &&
          !isVersionedField(
            type,
            element.getPropertyNameNode()?.getText() ?? element.getName()
          )
      )

    if (destructuresVersionField) {
      console.warn(
        `  [${location(pattern)}] Destructures a field of a version from a VersionedEventConfig. Destructure it from \`${RESOLVE_EVENT_CONFIG_NAME}(config)\` by hand.`
      )
    }
  }
}

/**
 * Finds `x.field` reads where `x` is a `VersionedEventConfig` and `field` belongs
 * to a version of it, e.g. `actions`.
 */
function findVersionFieldReads(sourceFile: SourceFile) {
  return sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter((node) => {
      const type = node.getExpression().getType()
      return (
        isVersionedEventConfig(type) && !isVersionedField(type, node.getName())
      )
    })
    .filter((node) => {
      if (node.hasQuestionDotToken()) {
        console.warn(
          `  [${location(node)}] Skipped optional chain \`${node.getText()}\`. Rewrite it to use \`${RESOLVE_EVENT_CONFIG_NAME}()\` by hand.`
        )
        return false
      }

      if (isWriteTarget(node)) {
        console.warn(
          `  [${location(node)}] Skipped write to \`${node.getText()}\`. Set it in the version passed to \`defineConfig\` instead.`
        )
        return false
      }

      return true
    })
}

/**
 * Returns true if the node is a value handed over to something else: a call
 * argument, a variable initializer, a returned value or an object property
 * value. Only these get a contextual type that `EventConfig` can come from.
 */
function isHandedOver(node: Expression) {
  const parent = node.getParent()

  if (Node.isCallExpression(parent) || Node.isNewExpression(parent)) {
    return parent.getArguments().includes(node)
  }

  return (
    ((Node.isVariableDeclaration(parent) ||
      Node.isPropertyAssignment(parent)) &&
      parent.getInitializer() === node) ||
    Node.isReturnStatement(parent)
  )
}

/**
 * Finds `VersionedEventConfig` values (or arrays of them) handed over where an
 * `EventConfig` (or an array of them) is expected.
 */
function findValuesExpectingEventConfig(sourceFile: SourceFile) {
  return sourceFile
    .getDescendants()
    .filter((node): node is Expression => Node.isExpression(node))
    .filter(isHandedOver)
    .map((node) => {
      const type = node.getType()
      const expectedType = node.getContextualType()

      if (!expectedType) {
        return undefined
      }

      if (isVersionedEventConfig(type) && isEventConfig(expectedType)) {
        return { node, isArray: false }
      }

      if (
        isArrayOf(type, isVersionedEventConfig) &&
        isArrayOf(expectedType, isEventConfig)
      ) {
        return { node, isArray: true }
      }

      return undefined
    })
    .filter((value) => value !== undefined)
    .filter(({ node }) => {
      if (node.getType().isNullable()) {
        console.warn(
          `  [${location(node)}] Skipped \`${node.getText()}\`, which may be undefined where an EventConfig is expected. Narrow it and pass \`${RESOLVE_EVENT_CONFIG_NAME}(...)\` by hand.`
        )
        return false
      }

      return true
    })
}

/** Finds the value import of the toolkit's events module, if the file has one. */
function findToolkitImport(sourceFile: SourceFile) {
  // A type-only import cannot carry a function, and a namespace import cannot
  // be given named imports, so neither is extended
  return sourceFile.getImportDeclaration(
    (declaration) =>
      declaration.getModuleSpecifierValue() === TOOLKIT_EVENTS_MODULE &&
      !declaration.isTypeOnly() &&
      !declaration.getNamespaceImport()
  )
}

/**
 * Returns the name `resolveEventConfig` is called by in the file: its local
 * alias when the file already imports it from the toolkit, `resolveEventConfig`
 * when the name is free, or undefined when the file binds `resolveEventConfig`
 * to something else.
 */
function findResolveEventConfigName(sourceFile: SourceFile) {
  const imported = findToolkitImport(sourceFile)
    ?.getNamedImports()
    .find((namedImport) => namedImport.getName() === RESOLVE_EVENT_CONFIG_NAME)

  if (imported) {
    return imported.getAliasNode()?.getText() ?? RESOLVE_EVENT_CONFIG_NAME
  }

  if (sourceFile.getLocal(RESOLVE_EVENT_CONFIG_NAME)) {
    return undefined
  }

  return RESOLVE_EVENT_CONFIG_NAME
}

function addResolveEventConfigImport(sourceFile: SourceFile) {
  const toolkitImport = findToolkitImport(sourceFile)

  if (!toolkitImport) {
    const imports = sourceFile.getImportDeclarations()
    const lastImport = imports[imports.length - 1]

    // Inserted as text so the import keeps the country config's style
    // (single quotes, no semicolon) rather than ts-morph's defaults
    sourceFile.insertStatements(
      lastImport ? lastImport.getChildIndex() + 1 : 0,
      `import { ${RESOLVE_EVENT_CONFIG_NAME} } from '${TOOLKIT_EVENTS_MODULE}'`
    )
    return
  }

  const alreadyImported = toolkitImport
    .getNamedImports()
    .some((namedImport) => namedImport.getName() === RESOLVE_EVENT_CONFIG_NAME)

  if (alreadyImported) {
    return
  }

  const namedImports = toolkitImport.getNamedImports()

  // ts-morph's addNamedImport collapses a multi-line import onto one line, so
  // the import is rewritten keeping one name per line when it had them
  if (toolkitImport.getDefaultImport() || namedImports.length === 0) {
    toolkitImport.addNamedImport(RESOLVE_EVENT_CONFIG_NAME)
    return
  }

  const names = [
    ...namedImports.map((namedImport) => namedImport.getText()),
    RESOLVE_EVENT_CONFIG_NAME
  ]
  const specifiers = toolkitImport.getText().includes('\n')
    ? `{\n  ${names.join(',\n  ')}\n}`
    : `{ ${names.join(', ')} }`

  toolkitImport.replaceWithText(
    `import ${specifiers} from '${TOOLKIT_EVENTS_MODULE}'`
  )
}

/**
 * Rewrites every use of a `VersionedEventConfig` as a flat `EventConfig` in the
 * file to go through `resolveEventConfig()`.
 *
 * @returns the number of uses rewritten.
 */
export function rewriteVersionedEventConfigUses(
  sourceFile: SourceFile
): number {
  warnDestructuredVersionFields(sourceFile)

  // Types are read before any rewrite, as a rewrite invalidates them
  const uses = [
    ...findVersionFieldReads(sourceFile).map((node) => ({
      node,
      rewrite: (name: string) =>
        `${name}(${node.getExpression().getText()}).${node.getName()}`
    })),
    ...findValuesExpectingEventConfig(sourceFile).map(({ node, isArray }) => ({
      node,
      rewrite: (name: string) =>
        isArray
          ? `${node.getText()}.map(${name})`
          : `${name}(${node.getText()})`
    }))
  ]
    // Replace the innermost uses first, so replacing an outer use does not
    // invalidate nodes still waiting to be replaced.
    .sort(
      (a, b) =>
        b.node.getStart() - a.node.getStart() ||
        a.node.getEnd() - b.node.getEnd()
    )

  if (uses.length === 0) {
    return 0
  }

  const resolveEventConfigName = findResolveEventConfigName(sourceFile)

  if (!resolveEventConfigName) {
    console.warn(
      `  [${location(uses[uses.length - 1].node)}] Skipped ${uses.length} use(s): the file already declares its own \`${RESOLVE_EVENT_CONFIG_NAME}\`. Rewrite them to use the toolkit's \`${RESOLVE_EVENT_CONFIG_NAME}()\` by hand.`
    )
    return 0
  }

  for (const { node, rewrite } of uses) {
    const before = node.getText()
    const after = rewrite(resolveEventConfigName)
    console.log(`  [${location(node)}] ${before} -> ${after}`)
    node.replaceWithText(after)
  }

  addResolveEventConfigImport(sourceFile)

  return uses.length
}

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(
    `Scanning for VersionedEventConfig used as an EventConfig in: ${srcDir}\n`
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

  let totalChanges = 0
  const modifiedFiles: SourceFile[] = []

  for (const sourceFile of sourceFiles) {
    const changes = rewriteVersionedEventConfigUses(sourceFile)

    if (changes > 0) {
      totalChanges += changes
      modifiedFiles.push(sourceFile)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log(
      'No VersionedEventConfig used as an EventConfig found. Nothing to do.'
    )
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
    `\nDone. Rewrote ${totalChanges} use(s) across ${modifiedFiles.length} file(s).`
  )
}

export { main }
