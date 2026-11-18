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
 * Reads the dialog copy of v2.1 configs. Remove this file in v2.3.
 *   - `supportingCopy` on any action
 *   - `dialogCopy` with `notify`, `declare` and `register` on the DECLARE action
 */

/** Action types whose dialog showed `supportingCopy` in v2.1. Their `supportingCopy` becomes `dialogCopy`. */
const ACTION_TYPES_THAT_SHOWED_SUPPORTING_COPY: ReadonlyArray<string> = [
  ActionType.NOTIFY,
  ActionType.REGISTER,
  ActionType.REJECT,
  ActionType.ARCHIVE,
  ActionType.UNARCHIVE,
  ActionType.REVOKE_REGISTRATION,
  ActionType.REINSTATE_REGISTRATION,
  ActionType.CUSTOM
]

const UPGRADE_HINT = '`opencrvs upgrade` makes this change for you.'

type ActionConfigInput = z.input<typeof ActionConfig>

type DeprecatedSupportingCopy = {
  /** @deprecated Give `dialogCopy` instead, on an action whose dialog shows it. Removed in v2.3. */
  supportingCopy?: TranslationConfig
}

/** The `dialogCopy` of the DECLARE action in v2.1. */
const DeprecatedDeclareDialogCopy = z.object({
  notify: TranslationConfig,
  declare: TranslationConfig,
  register: TranslationConfig
})

type DeprecatedDeclareDialogCopy = {
  /** @deprecated Give it as `dialogCopy` of the NOTIFY action. Removed in v2.3. */
  notify: TranslationConfig
  /** @deprecated Give it as `dialogCopy` of the DECLARE action. Removed in v2.3. */
  declare: TranslationConfig
  /** @deprecated Give it as `dialogCopy` of the REGISTER action. Removed in v2.3. */
  register: TranslationConfig
}

type WithDeprecatedDialogCopy<T> = T extends {
  type: typeof ActionType.DECLARE
}
  ? Omit<T, 'dialogCopy'> &
      DeprecatedSupportingCopy & {
        dialogCopy?: TranslationConfig | DeprecatedDeclareDialogCopy
      }
  : T & DeprecatedSupportingCopy

/** Input of an action config, which also accepts the dialog copy of v2.1. */
export type ActionConfigInputWithDeprecatedDialogCopy =
  WithDeprecatedDialogCopy<ActionConfigInput>

/** The parts of an action config that `moveDeprecatedDialogCopy` reads. */
const ActionWithDeprecatedDialogCopy = z.looseObject({
  type: z.string(),
  customActionType: z.string().optional(),
  supportingCopy: TranslationConfig.optional(),
  dialogCopy: z.unknown().optional()
})

type ActionWithDeprecatedDialogCopy = z.infer<
  typeof ActionWithDeprecatedDialogCopy
>

interface DialogCopyMove {
  /** The actions with their dialog copy in the place where v2.2 reads it. */
  actions: ActionWithDeprecatedDialogCopy[]
  /** One message for each part of the dialog copy of v2.1. */
  deprecations: string[]
  /** Actions that give both `supportingCopy` and `dialogCopy`. */
  conflicts: Array<{ path: PropertyKey[]; message: string }>
}

function nameOfAction({
  type,
  customActionType
}: ActionWithDeprecatedDialogCopy) {
  return type === ActionType.CUSTOM
    ? `${type} action '${customActionType}'`
    : `${type} action`
}

/**
 * Moves the dialog copy of v2.1 to `dialogCopy`, so that each dialog shows the same copy as in v2.1,
 * with one exception:
 *   - `supportingCopy` of an action whose dialog showed it becomes its `dialogCopy`.
 *   - `supportingCopy` of the other actions is dropped. No dialog showed it.
 *   - `dialogCopy` of the DECLARE action becomes its `declare` copy. Its `notify` and `register` copy
 *     become the `dialogCopy` of the NOTIFY and REGISTER actions, when these actions give no copy.
 *     The exception: when the REGISTER action gives copy, the register dialog on the review page
 *     shows that copy, not the `register` copy of the DECLARE action.
 */
function moveDeprecatedDialogCopy(
  input: ActionWithDeprecatedDialogCopy[]
): DialogCopyMove {
  const deprecations: string[] = []
  const conflicts: DialogCopyMove['conflicts'] = []

  const declareAction = input.find(({ type }) => type === ActionType.DECLARE)
  const copyOfDeclare = DeprecatedDeclareDialogCopy.safeParse(
    declareAction?.dialogCopy
  ).data

  if (copyOfDeclare) {
    deprecations.push(
      `\`dialogCopy\` with \`notify\`, \`declare\` and \`register\` on the ${ActionType.DECLARE} action is deprecated and will be removed in v2.3. Give the \`declare\` copy as \`dialogCopy\` of the ${ActionType.DECLARE} action, the \`notify\` copy as \`dialogCopy\` of the ${ActionType.NOTIFY} action, and the \`register\` copy as \`dialogCopy\` of the ${ActionType.REGISTER} action. ${UPGRADE_HINT}`
    )
  }

  const actions = input.map(({ supportingCopy, ...action }, index) => {
    const name = nameOfAction(action)
    const showedSupportingCopy =
      ACTION_TYPES_THAT_SHOWED_SUPPORTING_COPY.includes(action.type)

    if (supportingCopy) {
      const fix = showedSupportingCopy
        ? 'Rename it to `dialogCopy`.'
        : 'No dialog shows it, so remove it.'
      deprecations.push(
        `\`supportingCopy\` on the ${name} is deprecated and will be removed in v2.3. ${fix} ${UPGRADE_HINT}`
      )
    }

    if (action.type === ActionType.DECLARE) {
      return copyOfDeclare
        ? { ...action, dialogCopy: copyOfDeclare.declare }
        : action
    }

    if (!showedSupportingCopy) {
      return action
    }

    if (supportingCopy && action.dialogCopy !== undefined) {
      conflicts.push({
        path: [index, 'supportingCopy'],
        message: `The ${name} gives both \`dialogCopy\` and the deprecated \`supportingCopy\`. Give only \`dialogCopy\`.`
      })
      return action
    }

    const ownCopy = action.dialogCopy ?? supportingCopy

    if (action.type === ActionType.NOTIFY) {
      return { ...action, dialogCopy: ownCopy ?? copyOfDeclare?.notify }
    }

    if (action.type === ActionType.REGISTER) {
      if (copyOfDeclare && ownCopy) {
        deprecations.push(
          `The register dialog on the review page of the ${ActionType.DECLARE} action now shows the copy of the ${ActionType.REGISTER} action. Before v2.2, it showed the \`register\` copy in \`dialogCopy\` of the ${ActionType.DECLARE} action.`
        )
      }
      return { ...action, dialogCopy: ownCopy ?? copyOfDeclare?.register }
    }

    return { ...action, dialogCopy: ownCopy }
  })

  if (copyOfDeclare) {
    const missingActions = [ActionType.NOTIFY, ActionType.REGISTER].filter(
      (actionType) => !input.some(({ type }) => type === actionType)
    )
    missingActions.forEach((actionType) =>
      deprecations.push(
        `The event has no ${actionType} action, so no dialog shows the \`${actionType.toLowerCase()}\` copy in \`dialogCopy\` of the ${ActionType.DECLARE} action. To show it, add a ${actionType} action with \`dialogCopy\`.`
      )
    )
  }

  return { actions, deprecations, conflicts }
}

/** Actions of an event, which also accept the dialog copy of v2.1. */
export const ActionConfigsWithDeprecatedDialogCopy = z.preprocess(
  (input: ActionConfigInputWithDeprecatedDialogCopy[], ctx) => {
    const parsed = z.array(ActionWithDeprecatedDialogCopy).safeParse(input)
    if (!parsed.success) {
      parsed.error.issues.forEach(({ message, path }) =>
        ctx.addIssue({ code: 'custom', message, path })
      )
      return input
    }

    const { actions, conflicts } = moveDeprecatedDialogCopy(parsed.data)
    conflicts.forEach(({ message, path }) =>
      ctx.addIssue({ code: 'custom', message, path })
    )
    return actions
  },
  z.array(ActionConfig)
)

/**
 * Logs a deprecation warning for each part of the dialog copy of v2.1 in `actions`.
 * Call it only after the actions are parsed.
 */
export function warnOnDeprecatedDialogCopy(
  { eventId, versionId }: { eventId: string; versionId: string },
  actions: unknown
) {
  const parsed = z.array(ActionWithDeprecatedDialogCopy).safeParse(actions)
  if (!parsed.success) {
    return
  }

  moveDeprecatedDialogCopy(parsed.data).deprecations.forEach((message) =>
    // eslint-disable-next-line no-console
    console.warn(`Event '${eventId}', version '${versionId}': ${message}`)
  )
}
