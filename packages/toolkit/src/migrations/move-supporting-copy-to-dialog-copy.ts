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
 * Codemod: give the copy of every confirmation dialog as `dialogCopy`.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/move-supporting-copy-to-dialog-copy.ts
 *
 * Why:
 *   As of v2.2, `dialogCopy` is the one key for the copy of a confirmation
 *   dialog, and the action that opens a dialog gives its copy. `supportingCopy`
 *   and `dialogCopy.notify` of the DECLARE action are deprecated, and v2.3
 *   removes them. See CHANGELOG.md.
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Renames `supportingCopy` to `dialogCopy` on the actions that open one
 *     confirmation dialog
 *   - Removes `supportingCopy` from the other actions, where no dialog shows it
 *   - Moves `dialogCopy.notify` of a DECLARE action to `dialogCopy` of the
 *     NOTIFY action in the same `actions` array. When the NOTIFY action has
 *     copy of its own, or the event has no NOTIFY action, it removes
 *     `dialogCopy.notify`, because no dialog shows it
 *   - Logs, without changing, what it cannot rewrite safely: an action whose
 *     type it cannot read, an action with both `supportingCopy` and
 *     `dialogCopy`, a `dialogCopy` of the DECLARE action that is not written
 *     inline, a NOTIFY action that is not written inline, and every other
 *     reference to `supportingCopy`
 *   - Saves the modified files in-place
 */

import {
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
  applyTextEdits,
  findProperty,
  indentationOf,
  insertIntoAction,
  layoutOf,
  location,
  mayBeAction,
  reindent,
  removeProperty,
  TextEdit
} from './utils'

const SUPPORTING_COPY = 'supportingCopy'
const DIALOG_COPY = 'dialogCopy'
const NOTIFY_COPY = 'notify'
const DECLARE_ACTION_TYPE = 'DECLARE'
const NOTIFY_ACTION_TYPE = 'NOTIFY'

/** Action types that open one confirmation dialog. Their `dialogCopy` is the copy of that dialog. */
const ACTION_TYPES_WITH_ONE_DIALOG = [
  'NOTIFY',
  'REGISTER',
  'REJECT',
  'ARCHIVE',
  'UNARCHIVE',
  'REVOKE_REGISTRATION',
  'REINSTATE_REGISTRATION',
  'CUSTOM'
]

/** Action types whose `supportingCopy` no dialog showed. */
const ACTION_TYPES_WITHOUT_SUPPORTING_COPY = [
  'READ',
  'DECLARE',
  'EDIT',
  'DUPLICATE_DETECTED',
  'MARK_AS_DUPLICATE',
  'MARK_AS_NOT_DUPLICATE',
  'ASSIGN',
  'UNASSIGN',
  'DELETE',
  'PRINT_CERTIFICATE',
  'REQUEST_CORRECTION',
  'APPROVE_CORRECTION',
  'REJECT_CORRECTION'
]

type Property = PropertyAssignment | ShorthandPropertyAssignment

/** Returns the `type` of the object when it is a string literal, e.g. `ActionType.REGISTER`. */
function actionTypeOf(literal: ObjectLiteralExpression) {
  const type = findProperty(literal, 'type')
  const value = Node.isPropertyAssignment(type)
    ? type.getInitializerOrThrow().getType().getLiteralValue()
    : undefined

  return typeof value === 'string' ? value : undefined
}

function renameToDialogCopy(property: Property): TextEdit {
  if (Node.isShorthandPropertyAssignment(property)) {
    return {
      start: property.getStart(),
      end: property.getEnd(),
      text: `${DIALOG_COPY}: ${property.getName()}`
    }
  }

  const name = property.getNameNode()

  return { start: name.getStart(), end: name.getEnd(), text: DIALOG_COPY }
}

/**
 * Returns the edits for `supportingCopy` of the action, or logs why it is not
 * rewritten and returns no edits.
 */
function rewriteSupportingCopy(
  action: ObjectLiteralExpression,
  supportingCopy: Property
): TextEdit[] {
  const actionType = actionTypeOf(action)

  if (!actionType) {
    console.warn(
      `  [${location(supportingCopy)}] Skipped: could not read the action type. If the action opens one confirmation dialog (${ACTION_TYPES_WITH_ONE_DIALOG.join(', ')}), rename \`${SUPPORTING_COPY}\` to \`${DIALOG_COPY}\` by hand. Otherwise remove it.`
    )
    return []
  }

  if (ACTION_TYPES_WITH_ONE_DIALOG.includes(actionType)) {
    if (findProperty(action, DIALOG_COPY)) {
      console.warn(
        `  [${location(supportingCopy)}] Skipped: the ${actionType} action has both \`${SUPPORTING_COPY}\` and \`${DIALOG_COPY}\`. Keep the copy that the dialog must show as \`${DIALOG_COPY}\` by hand, and remove \`${SUPPORTING_COPY}\`.`
      )
      return []
    }

    console.log(
      `  [${location(supportingCopy)}] Renamed \`${SUPPORTING_COPY}\` of the ${actionType} action to \`${DIALOG_COPY}\``
    )
    return [renameToDialogCopy(supportingCopy)]
  }

  if (ACTION_TYPES_WITHOUT_SUPPORTING_COPY.includes(actionType)) {
    console.log(
      `  [${location(supportingCopy)}] Removed \`${SUPPORTING_COPY}\` of the ${actionType} action: no dialog showed it`
    )
    return removeProperty(supportingCopy)
  }

  console.warn(
    `  [${location(supportingCopy)}] Skipped: \`${SUPPORTING_COPY}\` is on an object of type '${actionType}', which is not an action.`
  )
  return []
}

/**
 * Returns the edits that move `dialogCopy.notify` of the DECLARE action to
 * `dialogCopy` of the NOTIFY action, or that remove it when no dialog shows
 * it. Logs why it is not rewritten and returns no edits otherwise.
 */
function moveNotifyCopy(
  declareAction: ObjectLiteralExpression,
  notifyCopy: Property
): TextEdit[] {
  const actions = declareAction.getParent()

  if (!Node.isArrayLiteralExpression(actions)) {
    console.warn(
      `  [${location(notifyCopy)}] Skipped: the ${DECLARE_ACTION_TYPE} action is not written in an \`actions\` array. Move \`${DIALOG_COPY}.${NOTIFY_COPY}\` to \`${DIALOG_COPY}\` of the ${NOTIFY_ACTION_TYPE} action by hand.`
    )
    return []
  }

  const candidates = actions
    .getElements()
    .filter(
      (action) =>
        action !== declareAction && mayBeAction(action, NOTIFY_ACTION_TYPE)
    )

  if (candidates.length === 0) {
    console.log(
      `  [${location(notifyCopy)}] Removed \`${DIALOG_COPY}.${NOTIFY_COPY}\` of the ${DECLARE_ACTION_TYPE} action: the event has no ${NOTIFY_ACTION_TYPE} action`
    )
    return removeProperty(notifyCopy)
  }

  const notifyAction = candidates[0]

  if (
    candidates.length !== 1 ||
    !Node.isObjectLiteralExpression(notifyAction)
  ) {
    console.warn(
      `  [${location(notifyCopy)}] Skipped: could not find exactly one ${NOTIFY_ACTION_TYPE} action written as an object literal next to the ${DECLARE_ACTION_TYPE} action. Move \`${DIALOG_COPY}.${NOTIFY_COPY}\` to \`${DIALOG_COPY}\` of the ${NOTIFY_ACTION_TYPE} action by hand.`
    )
    return []
  }

  if (
    findProperty(notifyAction, DIALOG_COPY) ||
    findProperty(notifyAction, SUPPORTING_COPY)
  ) {
    console.log(
      `  [${location(notifyCopy)}] Removed \`${DIALOG_COPY}.${NOTIFY_COPY}\` of the ${DECLARE_ACTION_TYPE} action: the notify dialog shows the copy of the ${NOTIFY_ACTION_TYPE} action`
    )
    return removeProperty(notifyCopy)
  }

  const text = notifyCopy.getSourceFile().getFullText()
  const layout = layoutOf(notifyCopy)
  const hasComments =
    text.slice(layout.start, notifyCopy.getStart(true)).trim() !== '' ||
    layout.trailingComment !== ''

  if (hasComments) {
    console.warn(
      `  [${location(notifyCopy)}] The comments next to \`${DIALOG_COPY}.${NOTIFY_COPY}\` were not moved with it. Move them to the ${NOTIFY_ACTION_TYPE} action by hand.`
    )
  }

  // The same property that `insertIntoAction` inserts after
  const anchor =
    notifyAction.getProperty('label') ?? notifyAction.getPropertyOrThrow('type')
  const value = Node.isShorthandPropertyAssignment(notifyCopy)
    ? notifyCopy.getName()
    : reindent(
        notifyCopy.getInitializerOrThrow().getText(),
        indentationOf(notifyCopy),
        indentationOf(anchor)
      )

  console.log(
    `  [${location(notifyCopy)}] Moved \`${DIALOG_COPY}.${NOTIFY_COPY}\` of the ${DECLARE_ACTION_TYPE} action to \`${DIALOG_COPY}\` of the ${NOTIFY_ACTION_TYPE} action`
  )

  return [
    ...insertIntoAction(notifyAction, [`${DIALOG_COPY}: ${value}`]),
    ...removeProperty(notifyCopy)
  ]
}

/** Returns true when the identifier names a property, e.g. in `{ supportingCopy }` or `action.supportingCopy`. */
function isPropertyName(identifier: Node) {
  const parent = identifier.getParentOrThrow()

  if (
    Node.isPropertyAssignment(parent) ||
    Node.isPropertyAccessExpression(parent)
  ) {
    return parent.getNameNode() === identifier
  }

  if (Node.isBindingElement(parent)) {
    return (parent.getPropertyNameNode() ?? parent.getNameNode()) === identifier
  }

  return Node.isShorthandPropertyAssignment(parent)
}

/** Returns `dialogCopy.notify` of the DECLARE action, or undefined when it has none. */
function findNotifyCopy(declareAction: ObjectLiteralExpression) {
  const dialogCopy = findProperty(declareAction, DIALOG_COPY)

  if (!dialogCopy) {
    return undefined
  }

  const value = Node.isPropertyAssignment(dialogCopy)
    ? dialogCopy.getInitializer()
    : undefined

  if (!Node.isObjectLiteralExpression(value)) {
    console.warn(
      `  [${location(dialogCopy)}] Skipped: \`${DIALOG_COPY}\` of the ${DECLARE_ACTION_TYPE} action is not written inline. If it has \`${NOTIFY_COPY}\`, move it to \`${DIALOG_COPY}\` of the ${NOTIFY_ACTION_TYPE} action by hand.`
    )
    return undefined
  }

  return findProperty(value, NOTIFY_COPY)
}

/**
 * Gives the copy of every confirmation dialog in the file as `dialogCopy`.
 *
 * @returns the number of properties rewritten.
 */
export function moveSupportingCopyToDialogCopy(sourceFile: SourceFile): number {
  const edits: TextEdit[] = []
  const visited = new Set<Node>()
  let changes = 0

  const actions = sourceFile
    .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
    .filter((literal) => findProperty(literal, 'type'))

  for (const action of actions) {
    const supportingCopy = findProperty(action, SUPPORTING_COPY)

    if (supportingCopy) {
      visited.add(supportingCopy)
      const supportingCopyEdits = rewriteSupportingCopy(action, supportingCopy)
      edits.push(...supportingCopyEdits)
      changes += supportingCopyEdits.length > 0 ? 1 : 0
    }

    const notifyCopy =
      actionTypeOf(action) === DECLARE_ACTION_TYPE
        ? findNotifyCopy(action)
        : undefined

    if (notifyCopy) {
      const notifyCopyEdits = moveNotifyCopy(action, notifyCopy)
      edits.push(...notifyCopyEdits)
      changes += notifyCopyEdits.length > 0 ? 1 : 0
    }
  }

  sourceFile
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter(
      (identifier) =>
        identifier.getText() === SUPPORTING_COPY &&
        isPropertyName(identifier) &&
        !visited.has(identifier.getParentOrThrow())
    )
    .forEach((identifier) =>
      console.warn(
        `  [${location(identifier)}] Skipped: \`${SUPPORTING_COPY}\` is not on an action written as an object literal. Change it to \`${DIALOG_COPY}\` by hand.`
      )
    )

  if (edits.length > 0) {
    applyTextEdits(sourceFile, edits)
  }

  return changes
}

async function main() {
  const srcDir = path.join(process.cwd(), 'src')
  console.log(`Scanning for the copy of confirmation dialogs in: ${srcDir}\n`)

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
    const changes = moveSupportingCopyToDialogCopy(sourceFile)

    if (changes > 0) {
      totalChanges += changes
      modifiedFiles.push(sourceFile)
    }
  }

  if (modifiedFiles.length === 0) {
    console.log('No dialog copy to update. Nothing to do.')
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
    `\nDone. Updated the dialog copy in ${totalChanges} place(s) across ${modifiedFiles.length} file(s).`
  )
}

export { main }
