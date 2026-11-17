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
import * as z from 'zod/v4'
import { ActionConfig } from './ActionConfig'
import { ActionType } from './ActionType'
import { TranslationConfig } from './TranslationConfig'

/*
 * Reads the dialog copy of v2.1 configs: `supportingCopy` on any action, and
 * `dialogCopy.notify` on the DECLARE action. Remove this file in v2.3.
 */

/** Action types that open one confirmation dialog. Their `dialogCopy` is the copy of that dialog. */
const ACTION_TYPES_WITH_ONE_DIALOG: ReadonlyArray<string> = [
  ActionType.NOTIFY,
  ActionType.REGISTER,
  ActionType.REJECT,
  ActionType.ARCHIVE,
  ActionType.UNARCHIVE,
  ActionType.REVOKE_REGISTRATION,
  ActionType.REINSTATE_REGISTRATION,
  ActionType.CUSTOM
]

type ActionConfigInput = z.input<typeof ActionConfig>

type DeprecatedSupportingCopy = {
  /** @deprecated Use `dialogCopy` instead. Removed in v2.3. */
  supportingCopy?: TranslationConfig
}

type DeclareActionConfigInput = Extract<
  ActionConfigInput,
  { type: typeof ActionType.DECLARE }
>

type DeclareDialogCopyInput = NonNullable<
  DeclareActionConfigInput['dialogCopy']
> & {
  /** @deprecated Give `dialogCopy` on the NOTIFY action instead. Removed in v2.3. */
  notify?: TranslationConfig
}

type WithDeprecatedDialogCopy<T> = T extends {
  type: typeof ActionType.DECLARE
}
  ? Omit<T, 'dialogCopy'> &
      DeprecatedSupportingCopy & { dialogCopy?: DeclareDialogCopyInput }
  : T & DeprecatedSupportingCopy

/** Input of an action config, which also accepts the dialog copy of v2.1. */
export type ActionConfigInputWithDeprecatedDialogCopy =
  WithDeprecatedDialogCopy<ActionConfigInput>

/** The parts of an action config that `moveDeprecatedDialogCopy` reads. */
const ActionWithDeprecatedDialogCopy = z.looseObject({
  type: z.string(),
  supportingCopy: TranslationConfig.optional(),
  dialogCopy: z.looseObject({ notify: TranslationConfig.optional() }).optional()
})

/**
 * Moves the dialog copy of v2.1 to `dialogCopy`, so that each dialog shows the same copy as in v2.1:
 *   - `supportingCopy` of an action that opens one dialog becomes its `dialogCopy`.
 *   - `dialogCopy.notify` of the DECLARE action becomes the `dialogCopy` of the NOTIFY action,
 *     when the NOTIFY action has no copy of its own.
 *   - `supportingCopy` of the other actions is dropped. No dialog showed it.
 */
function moveDeprecatedDialogCopy(
  input: ActionConfigInputWithDeprecatedDialogCopy[],
  ctx: z.RefinementCtx<unknown>
) {
  const parsed = z.array(ActionWithDeprecatedDialogCopy).safeParse(input)
  if (!parsed.success) {
    parsed.error.issues.forEach(({ message, path }) =>
      ctx.addIssue({ code: 'custom', message, path })
    )
    return input
  }
  const actions = parsed.data

  const notifyCopyOfDeclare = actions.find(
    ({ type }) => type === ActionType.DECLARE
  )?.dialogCopy?.notify

  return actions.map(({ supportingCopy, ...action }, index) => {
    if (action.type === ActionType.DECLARE) {
      if (!action.dialogCopy) {
        return action
      }
      const { notify: _notify, ...dialogCopy } = action.dialogCopy
      return { ...action, dialogCopy }
    }

    if (!ACTION_TYPES_WITH_ONE_DIALOG.includes(action.type)) {
      return action
    }

    if (supportingCopy && action.dialogCopy) {
      ctx.addIssue({
        code: 'custom',
        message: `The ${action.type} action gives both \`dialogCopy\` and the deprecated \`supportingCopy\`. Give only \`dialogCopy\`.`,
        path: [index, 'supportingCopy']
      })
      return action
    }

    const dialogCopy =
      action.dialogCopy ??
      supportingCopy ??
      (action.type === ActionType.NOTIFY ? notifyCopyOfDeclare : undefined)

    return dialogCopy ? { ...action, dialogCopy } : action
  })
}

/** Actions of an event, which also accept the dialog copy of v2.1. */
export const ActionConfigsWithDeprecatedDialogCopy = z.preprocess(
  moveDeprecatedDialogCopy,
  z.array(ActionConfig)
)

/** The parts of an action config input that `warnOnDeprecatedDialogCopy` reads. */
type ActionDialogCopyInput = DeprecatedSupportingCopy & {
  type: string
  customActionType?: string
  dialogCopy?: TranslationConfig | DeclareDialogCopyInput
}

/** Logs a deprecation warning for each part of the dialog copy of v2.1 in `actions`. */
export function warnOnDeprecatedDialogCopy(
  { eventId, versionId }: { eventId: string; versionId: string },
  actions: ActionDialogCopyInput[]
) {
  const location = `Event '${eventId}', version '${versionId}'`

  actions.forEach((action) => {
    const actionName =
      action.type === ActionType.CUSTOM
        ? `${action.type} action '${action.customActionType}'`
        : `${action.type} action`

    if (action.supportingCopy) {
      const fix = ACTION_TYPES_WITH_ONE_DIALOG.includes(action.type)
        ? 'Rename it to `dialogCopy`.'
        : 'No dialog shows it, so remove it.'
      // eslint-disable-next-line no-console
      console.warn(
        `${location}: \`supportingCopy\` on the ${actionName} is deprecated and will be removed in v2.3. ${fix} \`opencrvs upgrade\` makes this change for you.`
      )
    }

    const hasNotifyCopy =
      action.type === ActionType.DECLARE &&
      action.dialogCopy !== undefined &&
      'notify' in action.dialogCopy &&
      action.dialogCopy.notify !== undefined
    if (hasNotifyCopy) {
      // eslint-disable-next-line no-console
      console.warn(
        `${location}: \`dialogCopy.notify\` on the ${actionName} is deprecated and will be removed in v2.3. Give it as \`dialogCopy\` on the ${ActionType.NOTIFY} action instead. \`opencrvs upgrade\` makes this change for you.`
      )
    }
  })
}
