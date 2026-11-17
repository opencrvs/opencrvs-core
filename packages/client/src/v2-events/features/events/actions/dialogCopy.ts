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
import {
  ActionType,
  EventConfig,
  getActionConfig,
  TranslationConfig
} from '@opencrvs/commons/client'

/**
 * A dialog that the review page of the DECLARE or EDIT action opens to submit another
 * action. `openedBy` is the action of the page.
 */
type ReviewPageDialog =
  | {
      openedBy: typeof ActionType.DECLARE
      submits: typeof ActionType.REGISTER
    }
  | {
      openedBy: typeof ActionType.EDIT
      submits:
        | typeof ActionType.NOTIFY
        | typeof ActionType.DECLARE
        | typeof ActionType.REGISTER
    }

/** A confirmation dialog. Without `openedBy`, it is the dialog that `submits` opens to confirm itself. */
type Dialog = { submits: ActionType } | ReviewPageDialog

const EDIT_DIALOG_COPY_KEYS = {
  [ActionType.NOTIFY]: 'notify',
  [ActionType.DECLARE]: 'declare',
  [ActionType.REGISTER]: 'register'
} as const

/** @returns the copy of the dialog that an action opens to confirm itself. */
function findOwnDialogCopy(
  eventConfiguration: EventConfig,
  actionType: ActionType
): TranslationConfig | undefined {
  const action = getActionConfig({ eventConfiguration, actionType })
  if (!action || !('dialogCopy' in action)) {
    return undefined
  }

  if (action.type === ActionType.DECLARE) {
    return action.dialogCopy?.declare
  }
  // EDIT only opens dialogs that submit other actions
  if (action.type === ActionType.EDIT) {
    return undefined
  }
  return action.dialogCopy
}

/** @returns the copy that the action of `dialog.openedBy` gives for the dialog. */
function findCopyOfOpener(
  eventConfiguration: EventConfig,
  dialog: ReviewPageDialog
): TranslationConfig | undefined {
  const opener = getActionConfig({
    eventConfiguration,
    actionType: dialog.openedBy
  })

  switch (dialog.openedBy) {
    case ActionType.DECLARE:
      return opener?.type === ActionType.DECLARE
        ? opener.dialogCopy?.register
        : undefined
    case ActionType.EDIT:
      return opener?.type === ActionType.EDIT
        ? opener.dialogCopy?.[EDIT_DIALOG_COPY_KEYS[dialog.submits]]
        : undefined
  }
}

/**
 * @returns the copy that `dialog` shows at its top. When the action that opens the dialog
 * gives no copy for it, the dialog shows the copy of the action that it submits.
 */
export function getDialogCopy(
  eventConfiguration: EventConfig,
  dialog: Dialog
): TranslationConfig | undefined {
  const ownCopy = findOwnDialogCopy(eventConfiguration, dialog.submits)
  if (!('openedBy' in dialog)) {
    return ownCopy
  }
  return findCopyOfOpener(eventConfiguration, dialog) ?? ownCopy
}
