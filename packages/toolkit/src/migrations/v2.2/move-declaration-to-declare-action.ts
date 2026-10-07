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
 * Codemod: Move the top-level `declaration` given to `defineConfig` onto the
 * event's DECLARE action.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.2/move-declaration-to-declare-action.ts
 *
 * Why:
 *   As of v2.2 the declaration form lives on the DECLARE action. `defineConfig`
 *   still accepts a top-level `declaration`, but warns that it is deprecated
 *   and will stop accepting it in a future release.
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds every call to the toolkit's `defineConfig` given an object literal
 *     with a top-level `declaration`
 *   - Moves that `declaration` property, as written, into the object literal
 *     of the DECLARE action in `actions`, after its `label` (or its `type` when
 *     it has no `label`)
 *   - Logs, without changing, configs it cannot rewrite safely: `actions` that
 *     is not an array literal, an action not written inline whose type does
 *     not rule out DECLARE, no DECLARE action or more than one, and a DECLARE
 *     action that already has a `declaration` (which `defineConfig` rejects)
 *   - Saves the modified files in-place
 */

import {
  CallExpression,
  Node,
  ObjectLiteralExpression,
  Project,
  PropertyAssignment,
  ShorthandPropertyAssignment,
  SourceFile,
  SyntaxKind,
  Type
} from 'ts-morph'
import path from 'path'

const DEFINE_CONFIG_NAME = 'defineConfig'
const DECLARATION_PROPERTY_NAME = 'declaration'
const ACTIONS_PROPERTY_NAME = 'actions'
const DECLARE_ACTION_TYPE = 'DECLARE'

function location(node: Node) {
  const relPath = path.relative(
    process.cwd(),
    node.getSourceFile().getFilePath()
  )
  return `${relPath}:${node.getStartLineNumber()}`
}

/**
 * Returns true if the call is to the `defineConfig` published by the toolkit,
 * as opposed to a function of the same name declared in the country config.
 */
function isToolkitDefineConfigCall(call: CallExpression) {
  const symbol = call.getExpression().getSymbol()
  const resolved = symbol?.getAliasedSymbol() ?? symbol

  if (resolved?.getName() !== DEFINE_CONFIG_NAME) {
    return false
  }

  return resolved
    .getDeclarations()
    .some((declaration) => declaration.getSourceFile().isDeclarationFile())
}

/** Finds a property given by name, whether written `key: value` or shorthand. */
function findProperty(literal: ObjectLiteralExpression, name: string) {
  const property = literal.getProperty(name)

  return Node.isPropertyAssignment(property) ||
    Node.isShorthandPropertyAssignment(property)
    ? property
    : undefined
}

/**
 * Returns false only if the action type's `type` is known to be some other
 * action: a string literal, or a union of them, other than DECLARE.
 */
function mayHaveDeclareType(actionType: Type, node: Node) {
  const typeProperty = actionType.getProperty('type')

  if (!typeProperty) {
    return true
  }

  const type = typeProperty.getTypeAtLocation(node)
  const values = type.isUnion() ? type.getUnionTypes() : [type]

  return !values.every(
    (value) =>
      value.isStringLiteral() && value.getLiteralValue() !== DECLARE_ACTION_TYPE
  )
}

/**
 * Returns true if the node may be the DECLARE action. An action not written
 * inline (a variable, a call, a spread) may be, unless its type shows it is
 * some other action.
 */
function mayBeDeclareAction(node: Node) {
  if (Node.isObjectLiteralExpression(node)) {
    return isDeclareAction(node)
  }

  if (Node.isSpreadElement(node)) {
    const arrayType = node.getExpression().getType()
    const elementTypes = arrayType.isTuple()
      ? arrayType.getTupleElements()
      : [arrayType.getArrayElementType()]

    return elementTypes.some(
      (elementType) => !elementType || mayHaveDeclareType(elementType, node)
    )
  }

  return mayHaveDeclareType(node.getType(), node)
}

function isDeclareAction(literal: ObjectLiteralExpression) {
  const type = findProperty(literal, 'type')

  return (
    Node.isPropertyAssignment(type) &&
    type.getInitializerOrThrow().getType().getLiteralValue() ===
      DECLARE_ACTION_TYPE
  )
}

/**
 * Finds the DECLARE action in `actions`, or logs why the config cannot be
 * rewritten and returns undefined.
 */
function findDeclareAction(config: ObjectLiteralExpression) {
  const actions = findProperty(config, ACTIONS_PROPERTY_NAME)
  const actionsValue = Node.isPropertyAssignment(actions)
    ? actions.getInitializer()
    : undefined

  if (!Node.isArrayLiteralExpression(actionsValue)) {
    console.warn(
      `  [${location(config)}] Skipped: \`${ACTIONS_PROPERTY_NAME}\` is not an array literal. Move \`${DECLARATION_PROPERTY_NAME}\` onto the ${DECLARE_ACTION_TYPE} action by hand.`
    )
    return undefined
  }

  const candidates = actionsValue.getElements().filter(mayBeDeclareAction)

  if (
    candidates.length !== 1 ||
    !Node.isObjectLiteralExpression(candidates[0])
  ) {
    console.warn(
      `  [${location(config)}] Skipped: could not find exactly one ${DECLARE_ACTION_TYPE} action written as an object literal in \`${ACTIONS_PROPERTY_NAME}\`. Move \`${DECLARATION_PROPERTY_NAME}\` onto it by hand.`
    )
    return undefined
  }

  const declareAction = candidates[0]

  if (findProperty(declareAction, DECLARATION_PROPERTY_NAME)) {
    console.warn(
      `  [${location(config)}] Skipped: \`${DECLARATION_PROPERTY_NAME}\` is set both at the top level and on the ${DECLARE_ACTION_TYPE} action. Keep only the one on the action.`
    )
    return undefined
  }

  return declareAction
}

/** The whitespace the line the node starts on is indented by. */
function indentationOf(node: Node) {
  const text = node.getSourceFile().getFullText()
  const lineStart = text.lastIndexOf('\n', node.getStart() - 1) + 1

  return /^[ \t]*/.exec(text.slice(lineStart))?.[0] ?? ''
}

interface TextEdit {
  start: number
  end: number
  text: string
}

/**
 * Returns the edit inserting the property into the DECLARE action after its
 * `label`, or after its `type` when it has no `label`, in the action's own
 * layout: on its own line at the anchor's indentation, or inline when the
 * action is on one line.
 */
function insertIntoDeclareAction(
  declareAction: ObjectLiteralExpression,
  property: PropertyAssignment | ShorthandPropertyAssignment
): TextEdit {
  // `type` is always there: it is how the DECLARE action was found
  const anchor =
    declareAction.getProperty('label') ??
    declareAction.getPropertyOrThrow('type')

  const isMultiLine = declareAction.getText().includes('\n')
  const indent = indentationOf(anchor)
  const separator = isMultiLine ? `,\n${indent}` : ', '

  // Copied as text so the value keeps its formatting and its JSDoc, with
  // continuation lines re-indented from the property's indentation to the
  // anchor's
  const oldIndent = indentationOf(property)
  const text = property
    .getText(true)
    .split('\n')
    .map((line, index) =>
      index > 0 && line.startsWith(oldIndent)
        ? indent + line.slice(oldIndent.length)
        : line
    )
    .join('\n')

  return {
    start: anchor.getEnd(),
    end: anchor.getEnd(),
    text: `${separator}${text}`
  }
}

/**
 * Returns the edit removing the property together with its leading line break
 * and comments, and the comma separating it from its neighbours.
 */
function removeFromConfig(
  property: PropertyAssignment | ShorthandPropertyAssignment
): TextEdit {
  const next = property.getNextSibling()

  if (next?.getKind() === SyntaxKind.CommaToken) {
    return { start: property.getFullStart(), end: next.getEnd(), text: '' }
  }

  // The last property: drop the comma before it instead
  const previous = property.getPreviousSiblingOrThrow()

  return { start: previous.getStart(), end: property.getEnd(), text: '' }
}

/**
 * Moves the top-level `declaration` of every toolkit `defineConfig` call in the
 * file onto its DECLARE action.
 *
 * @returns the number of event configs rewritten.
 */
export function moveDeclarationToDeclareAction(sourceFile: SourceFile): number {
  const configs = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(isToolkitDefineConfigCall)
    .map((call) => call.getArguments()[0])
    .filter(Node.isObjectLiteralExpression)

  // Collected as text edits and applied together, as editing a node through
  // ts-morph invalidates nodes still waiting to be edited
  const edits: TextEdit[] = []
  let changes = 0

  for (const config of configs) {
    const declaration = findProperty(config, DECLARATION_PROPERTY_NAME)

    if (!declaration) {
      continue
    }

    const declareAction = findDeclareAction(config)

    if (!declareAction) {
      continue
    }

    console.log(
      `  [${location(declaration)}] Moved \`${declaration.getText()}\` onto the ${DECLARE_ACTION_TYPE} action`
    )

    edits.push(
      insertIntoDeclareAction(declareAction, declaration),
      removeFromConfig(declaration)
    )
    changes++
  }

  if (changes === 0) {
    return 0
  }

  // Applied from the end of the file, so each edit leaves the positions of
  // the ones still to apply untouched
  const text = edits
    .sort((a, b) => b.start - a.start)
    .reduce(
      (result, edit) =>
        result.slice(0, edit.start) + edit.text + result.slice(edit.end),
      sourceFile.getFullText()
    )

  sourceFile.replaceWithText(text)

  return changes
}

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(`Scanning for top-level event declarations in: ${srcDir}\n`)

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
    const changes = moveDeclarationToDeclareAction(sourceFile)

    if (changes > 0) {
      totalChanges += changes
      modifiedFiles.push(sourceFile)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log('No top-level event declarations found. Nothing to do.')
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
    `\nDone. Moved ${totalChanges} declaration(s) across ${modifiedFiles.length} file(s).`
  )
}

export { main }
