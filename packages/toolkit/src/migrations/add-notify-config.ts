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
 * Codemod: Give every NOTIFY action the `notificationForm` and `review` it
 * requires.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/add-notify-config.ts
 *
 * Why:
 *   As of v2.2 a NOTIFY action must configure its `notificationForm` and
 *   `review`. A notification form is validated like any form, so a plain copy
 *   of the declaration would make NOTIFY reject incomplete records.
 *   `toNotificationForm` and `toNotificationReview` copy the DECLARE form and
 *   review with every field optional, which keeps NOTIFY accepting them.
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Finds the NOTIFY action in the `actions` of every call to the toolkit's
 *     `defineConfig`
 *   - Adds `notificationForm: toNotificationForm(<DECLARE declaration>)` and
 *     `review: toNotificationReview(<DECLARE review>)` when missing, after its
 *     `label` (or its `type` when it has no `label`)
 *   - Adds the helpers to the file's `@opencrvs/toolkit/events` import
 *   - Logs events without a NOTIFY action, which cannot be notified
 *   - Logs, without changing, configs it cannot rewrite safely: a config not
 *     given as an object literal, `actions` that is not an array literal, a
 *     NOTIFY action not written inline, and a DECLARE `declaration` or
 *     `review` not given as a name (e.g. written inline)
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
  SyntaxKind
} from 'ts-morph'
import path from 'path'
import {
  addToolkitImport,
  applyTextEdits,
  findProperty,
  findToolkitImportName,
  indentationOf,
  insertAt,
  isAction,
  isToolkitDefineConfigCall,
  layoutOf,
  location,
  mayBeAction,
  restOfLine,
  TextEdit
} from './utils'

const DEFINE_CONFIG_NAME = 'defineConfig'
const ACTIONS_PROPERTY_NAME = 'actions'
const DECLARATION_PROPERTY_NAME = 'declaration'
const NOTIFY_ACTION_TYPE = 'NOTIFY'
const DECLARE_ACTION_TYPE = 'DECLARE'

/** The NOTIFY properties added, each copied from a DECLARE property through a toolkit helper. */
const NOTIFY_PROPERTIES = [
  {
    name: 'notificationForm',
    helper: 'toNotificationForm',
    declareProperty: DECLARATION_PROPERTY_NAME
  },
  {
    name: 'review',
    helper: 'toNotificationReview',
    declareProperty: 'review'
  }
] as const

/**
 * Returns the value of the property as text when it is a name or a property
 * access, which can be referred to again from the NOTIFY action.
 */
function referenceOf(
  property: PropertyAssignment | ShorthandPropertyAssignment | undefined
) {
  if (Node.isShorthandPropertyAssignment(property)) {
    return property.getName()
  }

  const value = property?.getInitializer()

  return Node.isIdentifier(value) || Node.isPropertyAccessExpression(value)
    ? value.getText()
    : undefined
}

function findConfigLiteral(call: CallExpression) {
  const config = call.getArguments()[0]

  if (Node.isObjectLiteralExpression(config)) {
    return config
  }

  console.warn(
    `  [${location(call)}] Skipped: \`${DEFINE_CONFIG_NAME}\` is not given an object literal. If the event has a NOTIFY action, give it a \`notificationForm\` and \`review\` by hand.`
  )

  return undefined
}

/**
 * Finds the NOTIFY action in `actions`, or logs why the config is not
 * rewritten and returns undefined.
 */
function findNotifyAction(config: ObjectLiteralExpression, actions: Node[]) {
  const candidates = actions.filter((action) =>
    mayBeAction(action, NOTIFY_ACTION_TYPE)
  )

  if (candidates.length === 0) {
    console.warn(
      `  [${location(config)}] No ${NOTIFY_ACTION_TYPE} action: the event cannot be notified. If a role has \`record.notify\` for it, add a ${NOTIFY_ACTION_TYPE} action with a \`notificationForm\` and \`review\`.`
    )
    return undefined
  }

  if (
    candidates.length !== 1 ||
    !Node.isObjectLiteralExpression(candidates[0])
  ) {
    console.warn(
      `  [${location(config)}] Skipped: could not find exactly one ${NOTIFY_ACTION_TYPE} action written as an object literal in \`${ACTIONS_PROPERTY_NAME}\`. Give it a \`notificationForm\` and \`review\` by hand.`
    )
    return undefined
  }

  return candidates[0]
}

/**
 * Returns the edit inserting the properties into the action after its `label`,
 * or after its `type` when it has no `label`, in the action's own layout: on
 * lines of their own at the anchor's indentation, or inline when the action is
 * on one line.
 */
function insertIntoAction(
  action: ObjectLiteralExpression,
  properties: string[]
): TextEdit[] {
  // `type` is always there: it is how the action was found
  const anchor =
    action.getProperty('label') ?? action.getPropertyOrThrow('type')

  const text = action.getSourceFile().getFullText()
  const anchorLayout = layoutOf(anchor)
  const indent = indentationOf(anchor)

  if (anchorLayout.ownsLines) {
    const position =
      anchorLayout.end + restOfLine(text, anchorLayout.end).length
    const lines = properties.map((property) => `\n${indent}${property}`)

    if (anchorLayout.hasComma) {
      return [insertAt(position, `${lines.join(',')},`)]
    }

    // The anchor was the last property: it needs a comma now
    return position === anchor.getEnd()
      ? [insertAt(position, `,${lines.join(',')}`)]
      : [insertAt(anchor.getEnd(), ','), insertAt(position, lines.join(','))]
  }

  const separator = action.getText().includes('\n') ? `,\n${indent}` : ', '

  return [
    insertAt(
      anchor.getEnd(),
      properties.map((property) => `${separator}${property}`).join('')
    )
  ]
}

/**
 * Adds the missing `notificationForm` and `review` to the NOTIFY action of
 * every toolkit `defineConfig` call in the file.
 *
 * @returns the number of NOTIFY actions rewritten.
 */
export function addNotifyConfig(sourceFile: SourceFile): number {
  const configs = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(isToolkitDefineConfigCall)
    .map(findConfigLiteral)
    .filter(Node.isObjectLiteralExpression)

  const helperNames = Object.fromEntries(
    NOTIFY_PROPERTIES.map(({ helper }) => [
      helper,
      findToolkitImportName(sourceFile, helper)
    ])
  )

  const edits: TextEdit[] = []
  const usedHelpers = new Set<string>()
  let changes = 0

  for (const config of configs) {
    const actions = findProperty(config, ACTIONS_PROPERTY_NAME)
    const actionsValue = Node.isPropertyAssignment(actions)
      ? actions.getInitializer()
      : undefined

    if (!Node.isArrayLiteralExpression(actionsValue)) {
      console.warn(
        `  [${location(config)}] Skipped: \`${ACTIONS_PROPERTY_NAME}\` is not an array literal. If the event has a ${NOTIFY_ACTION_TYPE} action, give it a \`notificationForm\` and \`review\` by hand.`
      )
      continue
    }

    const notifyAction = findNotifyAction(config, actionsValue.getElements())

    if (!notifyAction) {
      continue
    }

    const declareAction = actionsValue
      .getElements()
      .find(
        (action): action is ObjectLiteralExpression =>
          Node.isObjectLiteralExpression(action) &&
          isAction(action, DECLARE_ACTION_TYPE)
      )

    const properties = NOTIFY_PROPERTIES.filter(
      ({ name }) => !findProperty(notifyAction, name)
    ).flatMap(({ name, helper, declareProperty }) => {
      const helperName = helperNames[helper]
      // A `declaration` not yet moved onto the DECLARE action is still at the top level
      const reference = referenceOf(
        (declareAction && findProperty(declareAction, declareProperty)) ??
          (declareProperty === DECLARATION_PROPERTY_NAME
            ? findProperty(config, declareProperty)
            : undefined)
      )

      if (!helperName) {
        console.warn(
          `  [${location(notifyAction)}] Skipped \`${name}\`: the file already declares its own \`${helper}\`. Add \`${name}\` to the ${NOTIFY_ACTION_TYPE} action by hand, using the toolkit's \`${helper}\`.`
        )
        return []
      }

      if (!reference) {
        console.warn(
          `  [${location(notifyAction)}] Skipped \`${name}\`: the ${DECLARE_ACTION_TYPE} action's \`${declareProperty}\` is not given as a name. Add \`${name}: ${helper}(<${DECLARE_ACTION_TYPE} ${declareProperty}>)\` to the ${NOTIFY_ACTION_TYPE} action by hand.`
        )
        return []
      }

      if (helperName === helper) {
        usedHelpers.add(helper)
      }

      return [`${name}: ${helperName}(${reference})`]
    })

    if (properties.length === 0) {
      continue
    }

    console.log(
      `  [${location(notifyAction)}] Added \`${properties.join('`, `')}\` to the ${NOTIFY_ACTION_TYPE} action`
    )

    edits.push(...insertIntoAction(notifyAction, properties))
    changes++
  }

  if (changes === 0) {
    return 0
  }

  applyTextEdits(sourceFile, edits)

  for (const helper of usedHelpers) {
    addToolkitImport(sourceFile, helper)
  }

  return changes
}

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(`Scanning for NOTIFY actions in: ${srcDir}\n`)

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
    const changes = addNotifyConfig(sourceFile)

    if (changes > 0) {
      totalChanges += changes
      modifiedFiles.push(sourceFile)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log('No NOTIFY actions to update. Nothing to do.')
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
    `\nDone. Updated ${totalChanges} NOTIFY action(s) across ${modifiedFiles.length} file(s).`
  )
}

export { main }
