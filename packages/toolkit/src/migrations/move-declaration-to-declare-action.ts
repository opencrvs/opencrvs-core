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
 *   ts-node -r tsconfig-paths/register src/migrations/move-declaration-to-declare-action.ts
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
 *   - Moves the comments on the lines above it and after it with it
 *   - Logs, without changing, configs it cannot rewrite safely: a config not
 *     given as an object literal, `actions` that is not an array literal, an
 *     action not written inline whose type does not rule out DECLARE, no
 *     DECLARE action or more than one, and a DECLARE action that already has
 *     a `declaration` (which `defineConfig` rejects)
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

/** The text from the position to the end of its line, without the line break. */
function restOfLine(text: string, position: number) {
  const lineEnd = text.indexOf('\n', position)

  return text.slice(position, lineEnd === -1 ? text.length : lineEnd)
}

function isOnlyComments(text: string) {
  return /^\s*(?:\/\/.*|\/\*.*?\*\/\s*)*$/.test(text)
}

/**
 * Where a property sits in its object literal. A property on lines of its own
 * owns the comments on the lines above it and the comment after it on its last
 * line, and they move with it.
 */
interface PropertyLayout {
  ownsLines: boolean
  /** The first comment above the property, or the property itself. */
  start: number
  /** After the comma following the property, or the property when it has none. */
  end: number
  hasComma: boolean
  /** The comment after the property on its last line, with the space before it. */
  trailingComment: string
}

function layoutOf(property: Node): PropertyLayout {
  const text = property.getSourceFile().getFullText()
  const next = property.getNextSibling()
  const hasComma = next?.getKind() === SyntaxKind.CommaToken
  const end = next && hasComma ? next.getEnd() : property.getEnd()
  const trailing = restOfLine(text, end)

  // A comment on the line the previous property ends on is that property's
  const lineBreak = text
    .slice(property.getFullStart(), property.getStart())
    .indexOf('\n')

  if (lineBreak === -1 || !isOnlyComments(trailing)) {
    return {
      ownsLines: false,
      start: property.getStart(true),
      end,
      hasComma,
      trailingComment: ''
    }
  }

  const firstLine = property.getFullStart() + lineBreak + 1

  return {
    ownsLines: true,
    start: firstLine + (/^\s*/.exec(text.slice(firstLine))?.[0].length ?? 0),
    end,
    hasComma,
    trailingComment: trailing.trimEnd()
  }
}

interface TextEdit {
  start: number
  end: number
  text: string
}

function insertAt(position: number, text: string): TextEdit {
  return { start: position, end: position, text }
}

/**
 * Returns the edits inserting the property into the DECLARE action after its
 * `label`, or after its `type` when it has no `label`, in the action's own
 * layout: on lines of its own at the anchor's indentation, together with its
 * comments, or inline when the action is on one line.
 */
function insertIntoDeclareAction(
  declareAction: ObjectLiteralExpression,
  property: PropertyAssignment | ShorthandPropertyAssignment
): TextEdit[] {
  // `type` is always there: it is how the DECLARE action was found
  const anchor =
    declareAction.getProperty('label') ??
    declareAction.getPropertyOrThrow('type')

  const text = property.getSourceFile().getFullText()
  const anchorLayout = layoutOf(anchor)
  const layout = layoutOf(property)
  const indent = indentationOf(anchor)

  // Copied as text so the value keeps its formatting and its comments, with
  // continuation lines re-indented from the property's indentation to the
  // anchor's
  const oldIndent = indentationOf(property)
  const reindent = (lines: string) =>
    lines
      .split('\n')
      .map((line, index) =>
        index > 0 && line.startsWith(oldIndent)
          ? indent + line.slice(oldIndent.length)
          : line
      )
      .join('\n')

  if (anchorLayout.ownsLines) {
    const moved = reindent(text.slice(layout.start, property.getEnd()))
    const position =
      anchorLayout.end + restOfLine(text, anchorLayout.end).length
    const insertion = `\n${indent}${moved}${anchorLayout.hasComma ? ',' : ''}${layout.trailingComment}`

    if (anchorLayout.hasComma) {
      return [insertAt(position, insertion)]
    }

    // The anchor was the last property: it needs a comma now
    return position === anchor.getEnd()
      ? [insertAt(position, `,${insertion}`)]
      : [insertAt(anchor.getEnd(), ','), insertAt(position, insertion)]
  }

  const droppedComments =
    text.slice(layout.start, property.getStart(true)).trim() !== '' ||
    layout.trailingComment !== ''

  if (droppedComments) {
    console.warn(
      `  [${location(property)}] The comments next to \`${DECLARATION_PROPERTY_NAME}\` were not moved with it. Move them onto the ${DECLARE_ACTION_TYPE} action by hand.`
    )
  }

  const isMultiLine = declareAction.getText().includes('\n')
  const separator = isMultiLine ? `,\n${indent}` : ', '

  return [
    insertAt(anchor.getEnd(), `${separator}${reindent(property.getText(true))}`)
  ]
}

/**
 * Returns the edits removing the property together with the comma separating
 * it from its neighbours and, when it is on lines of its own, those lines.
 */
function removeFromConfig(
  property: PropertyAssignment | ShorthandPropertyAssignment
): TextEdit[] {
  const text = property.getSourceFile().getFullText()
  const layout = layoutOf(property)
  // The comma before the property, past any comments, which ts-morph lists
  // as siblings
  const previousComma = property
    .getPreviousSiblings()
    .find((sibling) => !isOnlyComments(sibling.getText()))
    ?.asKind(SyntaxKind.CommaToken)

  if (layout.ownsLines) {
    const lines = {
      start: text.lastIndexOf('\n', layout.start - 1),
      end: layout.end + restOfLine(text, layout.end).length,
      text: ''
    }

    // The last property: drop the comma before it too
    return !layout.hasComma && previousComma
      ? [
          lines,
          {
            start: previousComma.getStart(),
            end: previousComma.getEnd(),
            text: ''
          }
        ]
      : [lines]
  }

  if (layout.hasComma) {
    return [{ start: property.getFullStart(), end: layout.end, text: '' }]
  }

  // The last property: drop the comma before it instead
  return [
    {
      start: (previousComma ?? property).getStart(),
      end: property.getEnd(),
      text: ''
    }
  ]
}

/**
 * Returns the config given to a toolkit `defineConfig` call when it is an
 * object literal. Logs a config given any other way that may have a top-level
 * `declaration`, as it cannot be rewritten.
 */
function findConfigLiteral(call: CallExpression) {
  const config = call.getArguments()[0]

  if (!config || Node.isObjectLiteralExpression(config)) {
    return config
  }

  if (config.getType().getProperty(DECLARATION_PROPERTY_NAME)) {
    console.warn(
      `  [${location(config)}] Skipped: \`${DEFINE_CONFIG_NAME}\` is not given an object literal. If its config has a top-level \`${DECLARATION_PROPERTY_NAME}\`, move it onto the ${DECLARE_ACTION_TYPE} action by hand.`
    )
  }

  return undefined
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
    .map(findConfigLiteral)
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
      ...insertIntoDeclareAction(declareAction, declaration),
      ...removeFromConfig(declaration)
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
