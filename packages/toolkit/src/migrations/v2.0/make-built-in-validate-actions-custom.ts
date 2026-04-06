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
 * Codemod: Transform `VALIDATE` type actions into `CUSTOM` actions inside `defineConfig` calls.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.0/make-built-in-validate-actions-custom.ts
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds every `defineConfig({ ... })` call expression
 *   - Inside the `actions` array of that config, locates object literals
 *     whose `type` property resolves to `ActionType.VALIDATE` or the string literal `"VALIDATE"`
 *   - Changes the `type` value to `ActionType.CUSTOM` (or `"CUSTOM"` for string literals)
 *   - Adds a `customActionType: 'VALIDATE_DECLARATION'` property to those objects
 *   - Adds an `auditHistoryLabel` intl descriptor whose `id` is derived from the
 *     root `type` value of the `defineConfig` config object
 *   - Replaces `review: { fields: <value> }` with `form: <value>`, or
 *     `review: <expr>` with `form: <expr>.fields` when the value is not an inline object
 *   - Saves the modified files in-place
 */

import { Project, SyntaxKind, ObjectLiteralExpression, Node } from 'ts-morph'
import path from 'path'

const DEFINE_CONFIG_NAME = 'defineConfig'
const ACTIONS_PROPERTY_NAME = 'actions'
const TYPE_PROPERTY_NAME = 'type'
const CUSTOM_ACTION_TYPE_PROPERTY_NAME = 'customActionType'
const AUDIT_HISTORY_LABEL_PROPERTY_NAME = 'auditHistoryLabel'
const REVIEW_PROPERTY_NAME = 'review'
const FIELDS_PROPERTY_NAME = 'fields'
const FORM_PROPERTY_NAME = 'form'
const ACTION_TYPE_ENUM_NAME = 'ActionType'
const VALIDATE_MEMBER_NAME = 'VALIDATE'
const CUSTOM_MEMBER_NAME = 'CUSTOM'
const VALIDATE_STRING_LITERAL = 'VALIDATE'
const CUSTOM_STRING_LITERAL = 'CUSTOM'
const VALIDATE_DECLARATION_VALUE = 'VALIDATE_DECLARATION'

function isValidateType(typeInitializer: Node): boolean {
  // Matches: ActionType.VALIDATE
  if (typeInitializer.getKind() === SyntaxKind.PropertyAccessExpression) {
    const propAccess = typeInitializer.asKindOrThrow(
      SyntaxKind.PropertyAccessExpression
    )
    const obj = propAccess.getExpression()
    const member = propAccess.getName()
    return (
      Node.isIdentifier(obj) &&
      obj.getText() === ACTION_TYPE_ENUM_NAME &&
      member === VALIDATE_MEMBER_NAME
    )
  }

  // Matches: "VALIDATE"
  if (typeInitializer.getKind() === SyntaxKind.StringLiteral) {
    return (
      typeInitializer
        .asKindOrThrow(SyntaxKind.StringLiteral)
        .getLiteralValue() === VALIDATE_STRING_LITERAL
    )
  }

  return false
}

function resolveEventType(configArg: ObjectLiteralExpression): string | null {
  const typeProperty = configArg.getProperty(TYPE_PROPERTY_NAME)
  if (!typeProperty || !Node.isPropertyAssignment(typeProperty)) return null

  const initializer = typeProperty.getInitializer()
  if (!initializer) return null

  // 'birth' / 'death' etc. — use the literal value directly
  if (Node.isStringLiteral(initializer)) {
    return initializer.getLiteralValue().toLowerCase()
  }

  // EventType.BIRTH — extract and lowercase the member name
  if (
    initializer.getKind() === SyntaxKind.PropertyAccessExpression &&
    Node.isPropertyAccessExpression(initializer)
  ) {
    return initializer.getName().toLowerCase()
  }

  return null
}

function transformValidateActionToCustom(
  obj: ObjectLiteralExpression,
  eventType: string
): boolean {
  const typeProperty = obj.getProperty(TYPE_PROPERTY_NAME)

  if (!typeProperty || !Node.isPropertyAssignment(typeProperty)) {
    return false
  }

  const typeInitializer = typeProperty.getInitializer()

  if (!typeInitializer || !isValidateType(typeInitializer)) {
    return false
  }

  // Replace the type value: ActionType.VALIDATE -> ActionType.CUSTOM, "VALIDATE" -> "CUSTOM"
  if (typeInitializer.getKind() === SyntaxKind.PropertyAccessExpression) {
    typeInitializer.replaceWithText(
      `${ACTION_TYPE_ENUM_NAME}.${CUSTOM_MEMBER_NAME}`
    )
  } else {
    typeInitializer.replaceWithText(`'${CUSTOM_STRING_LITERAL}'`)
  }

  // Add customActionType: 'VALIDATE_DECLARATION' if not already present
  if (!obj.getProperty(CUSTOM_ACTION_TYPE_PROPERTY_NAME)) {
    obj.addPropertyAssignment({
      name: CUSTOM_ACTION_TYPE_PROPERTY_NAME,
      initializer: `'${VALIDATE_DECLARATION_VALUE}'`
    })
  }

  // Add auditHistoryLabel intl descriptor if not already present
  if (!obj.getProperty(AUDIT_HISTORY_LABEL_PROPERTY_NAME)) {
    const messageId = `event.${eventType}.custom.action.validate-declaration.audit-history-label`
    obj.addPropertyAssignment({
      name: AUDIT_HISTORY_LABEL_PROPERTY_NAME,
      initializer: `{
  defaultMessage: 'Validated',
  description: 'The label to show in audit history for the validate action',
  id: '${messageId}'
}`
    })
  }

  // Replace `review` with `form`:
  //   - `review: { fields: <value> }` → `form: <value>`
  //   - `review: <expr>`              → `form: <expr>.fields`
  const reviewProperty = obj.getProperty(REVIEW_PROPERTY_NAME)
  if (reviewProperty && Node.isPropertyAssignment(reviewProperty)) {
    const reviewInitializer = reviewProperty.getInitializer()
    if (reviewInitializer) {
      if (Node.isObjectLiteralExpression(reviewInitializer)) {
        // Inline object: extract the `fields` value directly
        const fieldsProperty =
          reviewInitializer.getProperty(FIELDS_PROPERTY_NAME)
        if (fieldsProperty && Node.isPropertyAssignment(fieldsProperty)) {
          const fieldsInitializer = fieldsProperty.getInitializer()
          if (fieldsInitializer) {
            reviewProperty.set({
              name: FORM_PROPERTY_NAME,
              initializer: fieldsInitializer.getText()
            })
          }
        }
      } else {
        // Reference or other expression: append `.fields`
        reviewProperty.set({
          name: FORM_PROPERTY_NAME,
          initializer: `${reviewInitializer.getText()}.fields`
        })
      }
    }
  }

  return true
}

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let transformedCount = 0

  // Find all call expressions named `defineConfig`
  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  )

  for (const call of callExpressions) {
    const expression = call.getExpression()

    // Only interested in bare `defineConfig(...)` calls
    if (
      !Node.isIdentifier(expression) ||
      expression.getText() !== DEFINE_CONFIG_NAME
    ) {
      continue
    }

    const args = call.getArguments()
    if (args.length === 0) continue

    // The first argument should be the config object literal
    const configArg = args[0]
    if (!Node.isObjectLiteralExpression(configArg)) continue

    // Find the `actions` property inside the config object
    const actionsProperty = configArg.getProperty(ACTIONS_PROPERTY_NAME)
    if (!actionsProperty || !Node.isPropertyAssignment(actionsProperty))
      continue

    const actionsInitializer = actionsProperty.getInitializer()
    if (
      !actionsInitializer ||
      !Node.isArrayLiteralExpression(actionsInitializer)
    )
      continue

    // Resolve the root event type for use in the auditHistoryLabel id
    const eventType = resolveEventType(configArg)
    if (!eventType) {
      console.warn(
        `  [${path.relative(process.cwd(), configArg.getSourceFile().getFilePath())}] Could not resolve root 'type' from defineConfig — skipping auditHistoryLabel id generation`
      )
    }

    // Iterate over every element in the `actions` array
    for (const element of actionsInitializer.getElements()) {
      if (!Node.isObjectLiteralExpression(element)) continue

      const wasTransformed = transformValidateActionToCustom(
        element,
        eventType ?? 'unknown'
      )
      if (wasTransformed) {
        transformedCount++
        console.log(
          `  [${path.relative(process.cwd(), filePath)}] Transformed VALIDATE action to CUSTOM with customActionType: '${VALIDATE_DECLARATION_VALUE}'`
        )
      }
    }
  }

  return transformedCount
}

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(`Scanning for defineConfig calls in: ${srcDir}\n`)

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    // Do not emit — we only manipulate source files
    skipAddingFilesFromTsConfig: false
  })

  // Restrict to source files only (exclude node_modules, build artefacts, etc.)
  const sourceFiles = project.getSourceFiles().filter((sf) => {
    const fp = sf.getFilePath()
    return fp.includes('/src/') && !fp.includes('/node_modules/')
  })

  console.log(`Found ${sourceFiles.length} source file(s) to analyse.\n`)

  let totalTransformed = 0
  const modifiedFiles: string[] = []

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const transformed = processFile(filePath, project)

    if (transformed > 0) {
      totalTransformed += transformed
      modifiedFiles.push(filePath)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log(
      'No VALIDATE actions found inside defineConfig calls. Nothing to do.'
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
    `\nDone. Transformed ${totalTransformed} VALIDATE action(s) to CUSTOM with customActionType: '${VALIDATE_DECLARATION_VALUE}'.`
  )
}

export { main }
