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
 * Codemod: give the copy of every confirmation dialog as `dialogCopy` on the
 * action that the dialog submits.
 *
 * Usage:
 *   ts-node -r tsconfig-paths/register src/migrations/move-supporting-copy-to-dialog-copy.ts
 *
 * Why:
 *   As of v2.2, `supportingCopy` is renamed to `dialogCopy`, and only the
 *   actions whose dialog shows it accept it. The `dialogCopy` of the DECLARE
 *   action with `notify`, `declare` and `register` is replaced by `dialogCopy`
 *   of the DECLARE, NOTIFY and REGISTER actions. v2.2 rejects the old keys.
 *   See CHANGELOG.md.
 *
 * What it does:
 *   - Scans all TypeScript files under `src/`
 *   - Renames `supportingCopy` to `dialogCopy` on the actions whose dialog
 *     showed it
 *   - Removes `supportingCopy` from the other actions, where no dialog showed it
 *   - Replaces `dialogCopy` with `notify`, `declare` and `register` on a
 *     DECLARE action with its `declare` copy, and moves its `notify` and
 *     `register` copy to `dialogCopy` of the NOTIFY and REGISTER actions in
 *     the same `actions` array. When one of these actions gives copy of its
 *     own, it keeps that copy and drops the copy of the DECLARE action
 *   - Logs, without changing, what it cannot rewrite safely: an action whose
 *     type it cannot read, an action with both `supportingCopy` and
 *     `dialogCopy`, a `dialogCopy` of the DECLARE action that is not written
 *     inline or that has other keys, a NOTIFY or REGISTER action that is not
 *     written inline or that is missing, and every other reference to
 *     `supportingCopy`
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
const DECLARE_ACTION_TYPE = 'DECLARE'

/** Action types whose dialog showed `supportingCopy`. Their `supportingCopy` becomes `dialogCopy`. */
const ACTION_TYPES_THAT_SHOWED_SUPPORTING_COPY = [
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

/** The keys of `dialogCopy` of the DECLARE action that move to another action, and that action. */
const MOVED_DECLARE_COPY = [
  { key: 'notify', actionType: 'NOTIFY' },
  { key: 'register', actionType: 'REGISTER' }
] as const

const DECLARE_COPY_KEYS = ['notify', 'declare', 'register']

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
      `  [${location(supportingCopy)}] Skipped: could not read the action type. If it is one of ${ACTION_TYPES_THAT_SHOWED_SUPPORTING_COPY.join(', ')}, rename \`${SUPPORTING_COPY}\` to \`${DIALOG_COPY}\` by hand. Otherwise remove it.`
    )
    return []
  }

  if (ACTION_TYPES_THAT_SHOWED_SUPPORTING_COPY.includes(actionType)) {
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

/** Returns true when comments sit next to the property, on its lines or the lines above it. */
function hasCommentsAround(property: Property) {
  const text = property.getSourceFile().getFullText()
  const layout = layoutOf(property)

  return (
    text.slice(layout.start, property.getStart(true)).trim() !== '' ||
    layout.trailingComment !== ''
  )
}

/** The value of the property, re-indented for a property at the indentation of `anchor`. */
function valueOf(property: Property, anchor: Node) {
  return Node.isShorthandPropertyAssignment(property)
    ? property.getName()
    : reindent(
        property.getInitializerOrThrow().getText(),
        indentationOf(property),
        indentationOf(anchor)
      )
}

/**
 * Returns the edits that replace `dialogCopy` with `notify`, `declare` and
 * `register` on the DECLARE action. Logs why it is not rewritten and returns no
 * edits when it cannot move all three copies safely.
 */
function rewriteDeclareDialogCopy(
  declareAction: ObjectLiteralExpression
): TextEdit[] {
  const dialogCopy = findProperty(declareAction, DIALOG_COPY)

  if (!dialogCopy) {
    return []
  }

  const value = Node.isPropertyAssignment(dialogCopy)
    ? dialogCopy.getInitializer()
    : undefined

  if (!Node.isObjectLiteralExpression(value)) {
    console.warn(
      `  [${location(dialogCopy)}] Skipped: \`${DIALOG_COPY}\` of the ${DECLARE_ACTION_TYPE} action is not written inline. If it has \`notify\`, \`declare\` and \`register\`, give each copy as \`${DIALOG_COPY}\` of the NOTIFY, ${DECLARE_ACTION_TYPE} and REGISTER actions by hand.`
    )
    return []
  }

  const [notify, declare, register] = DECLARE_COPY_KEYS.map((key) =>
    findProperty(value, key)
  )

  // The copy of the declare dialog itself, as of v2.2
  if (!notify && !declare && !register) {
    return []
  }

  if (!notify || !declare || !register || value.getProperties().length !== 3) {
    console.warn(
      `  [${location(dialogCopy)}] Skipped: \`${DIALOG_COPY}\` of the ${DECLARE_ACTION_TYPE} action does not have exactly \`notify\`, \`declare\` and \`register\`. Give each copy as \`${DIALOG_COPY}\` of the NOTIFY, ${DECLARE_ACTION_TYPE} and REGISTER actions by hand.`
    )
    return []
  }

  const actions = declareAction.getParent()

  if (!Node.isArrayLiteralExpression(actions)) {
    console.warn(
      `  [${location(dialogCopy)}] Skipped: the ${DECLARE_ACTION_TYPE} action is not written in an \`actions\` array. Give each copy in \`${DIALOG_COPY}\` as \`${DIALOG_COPY}\` of the NOTIFY, ${DECLARE_ACTION_TYPE} and REGISTER actions by hand.`
    )
    return []
  }

  const copies = { notify, register }
  const edits: TextEdit[] = []
  const messages: Array<() => void> = []

  for (const { key, actionType } of MOVED_DECLARE_COPY) {
    const candidates = actions
      .getElements()
      .filter(
        (action) => action !== declareAction && mayBeAction(action, actionType)
      )
    const target = candidates[0]

    if (candidates.length !== 1 || !Node.isObjectLiteralExpression(target)) {
      const problem =
        candidates.length === 0
          ? `the event has no ${actionType} action`
          : `could not find exactly one ${actionType} action written as an object literal next to the ${DECLARE_ACTION_TYPE} action`
      console.warn(
        `  [${location(dialogCopy)}] Skipped: ${problem}. Give the \`${key}\` copy in \`${DIALOG_COPY}\` of the ${DECLARE_ACTION_TYPE} action as \`${DIALOG_COPY}\` of the ${actionType} action by hand, and the \`declare\` copy as \`${DIALOG_COPY}\` of the ${DECLARE_ACTION_TYPE} action.`
      )
      return []
    }

    if (
      findProperty(target, DIALOG_COPY) ||
      findProperty(target, SUPPORTING_COPY)
    ) {
      messages.push(() =>
        key === 'register'
          ? console.warn(
              `  [${location(copies[key])}] Removed \`${DIALOG_COPY}.${key}\` of the ${DECLARE_ACTION_TYPE} action: the ${actionType} action gives its own copy. As of v2.2, the register dialog on the review page also shows that copy. Check that it fits both register dialogs.`
            )
          : console.log(
              `  [${location(copies[key])}] Removed \`${DIALOG_COPY}.${key}\` of the ${DECLARE_ACTION_TYPE} action: the notify dialog shows the copy of the ${actionType} action`
            )
      )
      continue
    }

    // The same property that `insertIntoAction` inserts after
    const anchor =
      target.getProperty('label') ?? target.getPropertyOrThrow('type')

    edits.push(
      ...insertIntoAction(target, [
        `${DIALOG_COPY}: ${valueOf(copies[key], anchor)}`
      ])
    )
    messages.push(() =>
      console.log(
        `  [${location(copies[key])}] Moved \`${DIALOG_COPY}.${key}\` of the ${DECLARE_ACTION_TYPE} action to \`${DIALOG_COPY}\` of the ${actionType} action`
      )
    )
  }

  if ([notify, declare, register].some(hasCommentsAround)) {
    console.warn(
      `  [${location(dialogCopy)}] The comments next to \`notify\`, \`declare\` or \`register\` in \`${DIALOG_COPY}\` of the ${DECLARE_ACTION_TYPE} action were removed. Add them again by hand where they still apply.`
    )
  }

  messages.forEach((message) => message())
  console.log(
    `  [${location(declare)}] Replaced \`${DIALOG_COPY}\` of the ${DECLARE_ACTION_TYPE} action with its \`declare\` copy`
  )

  return [
    ...edits,
    {
      start: value.getStart(),
      end: value.getEnd(),
      text: valueOf(declare, dialogCopy)
    }
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

/**
 * Gives the copy of every confirmation dialog in the file as `dialogCopy` on
 * the action that the dialog submits.
 *
 * @returns the number of actions rewritten.
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

    if (actionTypeOf(action) === DECLARE_ACTION_TYPE) {
      const dialogCopyEdits = rewriteDeclareDialogCopy(action)
      edits.push(...dialogCopyEdits)
      changes += dialogCopyEdits.length > 0 ? 1 : 0
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
