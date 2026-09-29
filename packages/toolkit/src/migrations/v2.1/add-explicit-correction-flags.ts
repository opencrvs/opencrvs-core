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
 * Codemod: Add explicit `APPROVE_CORRECTION` / `REJECT_CORRECTION` action
 * configs when `REQUEST_CORRECTION` has `flags` and/or `conditionals`.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/v2.1/add-explicit-correction-flags.ts
 *
 * Why:
 *   `getActionConfig()` used to alias `APPROVE_CORRECTION` and
 *   `REJECT_CORRECTION` to whatever was configured on `REQUEST_CORRECTION`
 *   (label, flags, conditionals). As of v2.1, each resolves to its own
 *   independent config, so `flags`/`conditionals` configured only on
 *   `REQUEST_CORRECTION` would silently stop applying when an
 *   `APPROVE_CORRECTION`/`REJECT_CORRECTION` action is accepted. See
 *   CHANGELOG.md ("APPROVE_CORRECTION / REJECT_CORRECTION no longer inherit
 *   REQUEST_CORRECTION's config").
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds every `defineConfig({ ... })` call expression
 *   - Inside the `actions` array, locates the `REQUEST_CORRECTION` action
 *   - If it has a non-empty `flags` and/or `conditionals` array, inserts
 *     sibling `APPROVE_CORRECTION` and `REJECT_CORRECTION` action objects
 *     (carrying over the same `flags`/`conditionals`) immediately after it,
 *     unless an action of that type already exists in the array
 *   - Saves the modified files in-place
 */

import { Project, SyntaxKind, ObjectLiteralExpression, Node } from 'ts-morph'
import path from 'path'

const DEFINE_CONFIG_NAME = 'defineConfig'
const ACTIONS_PROPERTY_NAME = 'actions'
const TYPE_PROPERTY_NAME = 'type'
const FLAGS_PROPERTY_NAME = 'flags'
const CONDITIONALS_PROPERTY_NAME = 'conditionals'
const ACTION_TYPE_ENUM_NAME = 'ActionType'

const REQUEST_CORRECTION_TYPE = 'REQUEST_CORRECTION'

const CORRECTION_ACTIONS_TO_ADD = [
  {
    actionType: 'APPROVE_CORRECTION',
    labelId: 'v2.events.correction.approve.label',
    defaultMessage: 'Approve correction',
    description: 'Label for the approve correction action'
  },
  {
    actionType: 'REJECT_CORRECTION',
    labelId: 'v2.events.correction.reject.label',
    defaultMessage: 'Reject correction',
    description: 'Label for the reject correction action'
  }
] as const

/**
 * Returns true if the object's `type` property matches the given type name.
 * Handles both `ActionType.X` and the string literal `'X'` forms.
 */
function isActionOfType(
  obj: ObjectLiteralExpression,
  typeName: string
): boolean {
  const typeProperty = obj.getProperty(TYPE_PROPERTY_NAME)
  if (!typeProperty || !Node.isPropertyAssignment(typeProperty)) return false

  const typeInit = typeProperty.getInitializer()
  if (!typeInit) return false

  if (Node.isPropertyAccessExpression(typeInit)) {
    return (
      typeInit.getExpression().getText() === ACTION_TYPE_ENUM_NAME &&
      typeInit.getName() === typeName
    )
  }

  if (Node.isStringLiteral(typeInit)) {
    return typeInit.getLiteralValue() === typeName
  }

  return false
}

/**
 * Returns whether `type` is written as `ActionType.X` (enum access) or as a
 * bare string literal, so newly inserted actions can mirror the same style.
 */
function getTypeInitializerStyle(
  obj: ObjectLiteralExpression
): 'enum' | 'string' {
  const typeProperty = obj.getProperty(TYPE_PROPERTY_NAME)
  if (typeProperty && Node.isPropertyAssignment(typeProperty)) {
    const typeInit = typeProperty.getInitializer()
    if (typeInit && Node.isPropertyAccessExpression(typeInit)) return 'enum'
  }
  return 'string'
}

/**
 * Returns the source text of `obj[propName]` if it's an array literal with
 * at least one element, otherwise undefined.
 */
function getNonEmptyArrayPropertyText(
  obj: ObjectLiteralExpression,
  propName: string
): string | undefined {
  const prop = obj.getProperty(propName)
  if (!prop || !Node.isPropertyAssignment(prop)) return undefined

  const init = prop.getInitializer()
  if (!init || !Node.isArrayLiteralExpression(init)) return undefined
  if (init.getElements().length === 0) return undefined

  return init.getText()
}

function buildCorrectionActionText(
  spec: (typeof CORRECTION_ACTIONS_TO_ADD)[number],
  typeStyle: 'enum' | 'string',
  flagsText: string | undefined,
  conditionalsText: string | undefined
): string {
  const typeText =
    typeStyle === 'enum'
      ? `${ACTION_TYPE_ENUM_NAME}.${spec.actionType}`
      : `'${spec.actionType}'`

  const lines = [
    `type: ${typeText}`,
    `label: {
    id: '${spec.labelId}',
    defaultMessage: '${spec.defaultMessage}',
    description: '${spec.description}'
  }`
  ]

  if (flagsText) {
    lines.push(`${FLAGS_PROPERTY_NAME}: ${flagsText}`)
  }
  if (conditionalsText) {
    lines.push(`${CONDITIONALS_PROPERTY_NAME}: ${conditionalsText}`)
  }

  return `{\n  ${lines.join(',\n  ')}\n}`
}

function processFile(filePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(filePath)
  if (!sourceFile) return 0

  let changes = 0
  const relPath = path.relative(process.cwd(), filePath)

  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  )

  for (const call of callExpressions) {
    const expression = call.getExpression()
    if (
      !Node.isIdentifier(expression) ||
      expression.getText() !== DEFINE_CONFIG_NAME
    ) {
      continue
    }

    const args = call.getArguments()
    if (args.length === 0) continue

    const configArg = args[0]
    if (!Node.isObjectLiteralExpression(configArg)) continue

    const actionsProperty = configArg.getProperty(ACTIONS_PROPERTY_NAME)
    if (!actionsProperty || !Node.isPropertyAssignment(actionsProperty))
      continue

    const actionsInitializer = actionsProperty.getInitializer()
    if (
      !actionsInitializer ||
      !Node.isArrayLiteralExpression(actionsInitializer)
    )
      continue

    const elements = actionsInitializer.getElements()
    const requestCorrectionIndex = elements.findIndex(
      (el) =>
        Node.isObjectLiteralExpression(el) &&
        isActionOfType(el, REQUEST_CORRECTION_TYPE)
    )
    if (requestCorrectionIndex === -1) continue

    const requestCorrection = elements[
      requestCorrectionIndex
    ] as ObjectLiteralExpression

    const flagsText = getNonEmptyArrayPropertyText(
      requestCorrection,
      FLAGS_PROPERTY_NAME
    )
    const conditionalsText = getNonEmptyArrayPropertyText(
      requestCorrection,
      CONDITIONALS_PROPERTY_NAME
    )

    // Nothing on REQUEST_CORRECTION that approve/reject would need to inherit.
    if (!flagsText && !conditionalsText) continue

    const typeStyle = getTypeInitializerStyle(requestCorrection)

    let insertAt = requestCorrectionIndex + 1
    for (const spec of CORRECTION_ACTIONS_TO_ADD) {
      const alreadyPresent = actionsInitializer
        .getElements()
        .some(
          (el) =>
            Node.isObjectLiteralExpression(el) &&
            isActionOfType(el, spec.actionType)
        )
      if (alreadyPresent) continue

      const text = buildCorrectionActionText(
        spec,
        typeStyle,
        flagsText,
        conditionalsText
      )
      actionsInitializer.insertElement(insertAt, text)
      insertAt++
      changes++
      console.log(
        `  [${relPath}] Added ${spec.actionType} action carrying over REQUEST_CORRECTION's flags/conditionals`
      )
    }
  }

  return changes
}

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(`Scanning for defineConfig calls in: ${srcDir}\n`)

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
  const modifiedFiles: string[] = []

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath()
    const changes = processFile(filePath, project)

    if (changes > 0) {
      totalChanges += changes
      modifiedFiles.push(filePath)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log(
      'No REQUEST_CORRECTION actions with flags/conditionals found. Nothing to do.'
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
    `\nDone. Added ${totalChanges} correction action config(s) across ${modifiedFiles.length} file(s).`
  )
}

export { main }
