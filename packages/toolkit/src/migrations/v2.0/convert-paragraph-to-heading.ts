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
 * Codemod: Convert `FieldType.PARAGRAPH` fields with a heading `fontVariant` to `FieldType.HEADING`,
 * and remove the `fontVariant` property from plain paragraphs.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/convert-paragraph-to-heading.ts
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds every object literal whose `type` property is `FieldType.PARAGRAPH`
 *   - Navigates `configuration.styles.fontVariant` on that object
 *   - If `fontVariant` is one of 'h1' | 'h2' | 'h3' | 'h4':
 *       changes `type` to `FieldType.HEADING`
 *   - If `fontVariant` is absent, not a string literal, or any other value:
 *       leaves `type` as `FieldType.PARAGRAPH` and removes the `fontVariant` property
 *   - Saves the modified files in-place
 */

import {
  Project,
  SyntaxKind,
  ObjectLiteralExpression,
  Node,
  PropertyAssignment
} from 'ts-morph'
import path from 'path'

const FIELD_TYPE_ENUM_NAME = 'FieldType'
const PARAGRAPH_MEMBER_NAME = 'PARAGRAPH'
const HEADING_MEMBER_NAME = 'HEADING'
const TYPE_PROPERTY_NAME = 'type'
const CONFIGURATION_PROPERTY_NAME = 'configuration'
const STYLES_PROPERTY_NAME = 'styles'
const FONT_VARIANT_PROPERTY_NAME = 'fontVariant'

const HEADING_FONT_VARIANTS = new Set(['h1', 'h2', 'h3', 'h4'])

type TransformResult = 'converted-to-heading' | 'removed-font-variant' | null

function isParagraphType(typeInitializer: Node): boolean {
  if (!Node.isPropertyAccessExpression(typeInitializer)) return false
  const obj = typeInitializer.getExpression()
  const member = typeInitializer.getName()
  return (
    Node.isIdentifier(obj) &&
    obj.getText() === FIELD_TYPE_ENUM_NAME &&
    member === PARAGRAPH_MEMBER_NAME
  )
}

function getFontVariantProperty(
  obj: ObjectLiteralExpression
): PropertyAssignment | null {
  const configProperty = obj.getProperty(CONFIGURATION_PROPERTY_NAME)
  if (!configProperty || !Node.isPropertyAssignment(configProperty)) return null

  const configInitializer = configProperty.getInitializer()
  if (!configInitializer || !Node.isObjectLiteralExpression(configInitializer))
    return null

  const stylesProperty = configInitializer.getProperty(STYLES_PROPERTY_NAME)
  if (!stylesProperty || !Node.isPropertyAssignment(stylesProperty)) return null

  const stylesInitializer = stylesProperty.getInitializer()
  if (!stylesInitializer || !Node.isObjectLiteralExpression(stylesInitializer))
    return null

  const fontVariantProperty = stylesInitializer.getProperty(
    FONT_VARIANT_PROPERTY_NAME
  )
  if (!fontVariantProperty || !Node.isPropertyAssignment(fontVariantProperty))
    return null

  return fontVariantProperty
}

function transformParagraphField(obj: ObjectLiteralExpression): TransformResult {
  const typeProperty = obj.getProperty(TYPE_PROPERTY_NAME)
  if (!typeProperty || !Node.isPropertyAssignment(typeProperty)) return null

  const typeInitializer = typeProperty.getInitializer()
  if (!typeInitializer || !isParagraphType(typeInitializer)) return null

  const fontVariantProperty = getFontVariantProperty(obj)

  if (fontVariantProperty) {
    const fontVariantInitializer = fontVariantProperty.getInitializer()

    if (
      fontVariantInitializer &&
      Node.isStringLiteral(fontVariantInitializer) &&
      HEADING_FONT_VARIANTS.has(fontVariantInitializer.getLiteralValue())
    ) {
      // fontVariant is h1–h4: promote to HEADING
      typeInitializer.replaceWithText(
        `${FIELD_TYPE_ENUM_NAME}.${HEADING_MEMBER_NAME}`
      )
      return 'converted-to-heading'
    }

    // fontVariant is present but not a heading variant: remove it
    fontVariantProperty.remove()
    return 'removed-font-variant'
  }

  // No fontVariant at all: nothing to do
  return null
}

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let changedCount = 0

  const objectLiterals = sourceFile.getDescendantsOfKind(
    SyntaxKind.ObjectLiteralExpression
  )

  for (const obj of objectLiterals) {
    const result = transformParagraphField(obj)

    if (result === 'converted-to-heading') {
      changedCount++
      console.log(
        `  [${path.relative(process.cwd(), filePath)}] Converted PARAGRAPH with heading fontVariant to HEADING`
      )
    } else if (result === 'removed-font-variant') {
      changedCount++
      console.log(
        `  [${path.relative(process.cwd(), filePath)}] Removed non-heading fontVariant from PARAGRAPH`
      )
    }
  }

  return changedCount
}

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(`Scanning for FieldType.PARAGRAPH fields in: ${srcDir}\n`)

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  console.log(`Found ${sourceFiles.length} source file(s) to analyse.\n`)

  let totalChanged = 0
  const modifiedFiles: string[] = []

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const changed = processFile(filePath, project)

    if (changed > 0) {
      totalChanged += changed
      modifiedFiles.push(filePath)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log(
      'No FieldType.PARAGRAPH fields with fontVariant found. Nothing to do.'
    )
    return
  }

  console.log(`\nSaving ${modifiedFiles.length} modified file(s)...`)

  for (const filePath of modifiedFiles) {
    const sourceFile = project.getSourceFileOrThrow(filePath)
    await sourceFile.save()
    console.log(`  Saved: ${path.relative(process.cwd(), filePath)}`)
  }

  console.log(`\nDone. Processed ${totalChanged} FieldType.PARAGRAPH field(s).`)
}

export { main }
