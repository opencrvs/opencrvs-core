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
 * Helpers shared by the codemods, kept apart so a codemod can be removed
 * without breaking the others.
 */

import {
  CallExpression,
  Node,
  ObjectLiteralExpression,
  SourceFile,
  SyntaxKind,
  Type
} from 'ts-morph'
import path from 'path'

const DEFINE_CONFIG_NAME = 'defineConfig'
const TOOLKIT_EVENTS_MODULE = '@opencrvs/toolkit/events'

export function location(node: Node) {
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
export function isToolkitDefineConfigCall(call: CallExpression) {
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
export function findProperty(literal: ObjectLiteralExpression, name: string) {
  const property = literal.getProperty(name)

  return Node.isPropertyAssignment(property) ||
    Node.isShorthandPropertyAssignment(property)
    ? property
    : undefined
}

/**
 * Returns false only if the action type's `type` is known to be some other
 * action: a string literal, or a union of them, other than the given one.
 */
function mayHaveActionType(
  actionType: Type,
  node: Node,
  expectedActionType: string
) {
  const typeProperty = actionType.getProperty('type')

  if (!typeProperty) {
    return true
  }

  const type = typeProperty.getTypeAtLocation(node)
  const values = type.isUnion() ? type.getUnionTypes() : [type]

  return !values.every(
    (value) =>
      value.isStringLiteral() && value.getLiteralValue() !== expectedActionType
  )
}

/**
 * Returns true if the node may be the action of the given type. An action not
 * written inline (a variable, a call, a spread) may be, unless its type shows
 * it is some other action.
 */
export function mayBeAction(node: Node, actionType: string) {
  if (Node.isObjectLiteralExpression(node)) {
    return isAction(node, actionType)
  }

  if (Node.isSpreadElement(node)) {
    const arrayType = node.getExpression().getType()
    const elementTypes = arrayType.isTuple()
      ? arrayType.getTupleElements()
      : [arrayType.getArrayElementType()]

    return elementTypes.some(
      (elementType) =>
        !elementType || mayHaveActionType(elementType, node, actionType)
    )
  }

  return mayHaveActionType(node.getType(), node, actionType)
}

export function isAction(literal: ObjectLiteralExpression, actionType: string) {
  const type = findProperty(literal, 'type')

  return (
    Node.isPropertyAssignment(type) &&
    type.getInitializerOrThrow().getType().getLiteralValue() === actionType
  )
}

/** The whitespace the line the node starts on is indented by. */
export function indentationOf(node: Node) {
  const text = node.getSourceFile().getFullText()
  const lineStart = text.lastIndexOf('\n', node.getStart() - 1) + 1

  return /^[ \t]*/.exec(text.slice(lineStart))?.[0] ?? ''
}

/** The text from the position to the end of its line, without the line break. */
export function restOfLine(text: string, position: number) {
  const lineEnd = text.indexOf('\n', position)

  return text.slice(position, lineEnd === -1 ? text.length : lineEnd)
}

export function isOnlyComments(text: string) {
  return /^\s*(?:\/\/.*|\/\*.*?\*\/\s*)*$/.test(text)
}

/**
 * Where a property sits in its object literal. A property on lines of its own
 * owns the comments on the lines above it and the comment after it on its last
 * line, and they move with it.
 */
export interface PropertyLayout {
  ownsLines: boolean
  /** The first comment above the property, or the property itself. */
  start: number
  /** After the comma following the property, or the property when it has none. */
  end: number
  hasComma: boolean
  /** The comment after the property on its last line, with the space before it. */
  trailingComment: string
}

export function layoutOf(property: Node): PropertyLayout {
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

export interface TextEdit {
  start: number
  end: number
  text: string
}

export function insertAt(position: number, text: string): TextEdit {
  return { start: position, end: position, text }
}

/**
 * Applies the edits to the file together, as editing a node through ts-morph
 * invalidates nodes still waiting to be edited.
 */
export function applyTextEdits(sourceFile: SourceFile, edits: TextEdit[]) {
  // Applied from the end of the file, so each edit leaves the positions of
  // the ones still to apply untouched
  const text = [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce(
      (result, edit) =>
        result.slice(0, edit.start) + edit.text + result.slice(edit.end),
      sourceFile.getFullText()
    )

  sourceFile.replaceWithText(text)
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
 * Returns the name a toolkit export is called by in the file: its local alias
 * when the file already imports it from the toolkit, its own name when the
 * name is free, or undefined when the file binds that name to something else.
 */
export function findToolkitImportName(sourceFile: SourceFile, name: string) {
  const imported = findToolkitImport(sourceFile)
    ?.getNamedImports()
    .find((namedImport) => namedImport.getName() === name)

  if (imported) {
    return imported.getAliasNode()?.getText() ?? name
  }

  if (sourceFile.getLocal(name)) {
    return undefined
  }

  return name
}

/** Adds the toolkit export to the file's toolkit import, unless already imported. */
export function addToolkitImport(sourceFile: SourceFile, name: string) {
  const toolkitImport = findToolkitImport(sourceFile)

  if (!toolkitImport) {
    const imports = sourceFile.getImportDeclarations()
    const lastImport = imports[imports.length - 1]

    // Inserted as text so the import keeps the country config's style
    // (single quotes, no semicolon) rather than ts-morph's defaults
    sourceFile.insertStatements(
      lastImport ? lastImport.getChildIndex() + 1 : 0,
      `import { ${name} } from '${TOOLKIT_EVENTS_MODULE}'`
    )
    return
  }

  const alreadyImported = toolkitImport
    .getNamedImports()
    .some((namedImport) => namedImport.getName() === name)

  if (alreadyImported) {
    return
  }

  const namedImports = toolkitImport.getNamedImports()

  // ts-morph's addNamedImport collapses a multi-line import onto one line, so
  // the import is rewritten keeping one name per line when it had them
  if (toolkitImport.getDefaultImport() || namedImports.length === 0) {
    toolkitImport.addNamedImport(name)
    return
  }

  const names = [
    ...namedImports.map((namedImport) => namedImport.getText()),
    name
  ]
  const specifiers = toolkitImport.getText().includes('\n')
    ? `{\n  ${names.join(',\n  ')}\n}`
    : `{ ${names.join(', ')} }`

  toolkitImport.replaceWithText(
    `import ${specifiers} from '${TOOLKIT_EVENTS_MODULE}'`
  )
}
