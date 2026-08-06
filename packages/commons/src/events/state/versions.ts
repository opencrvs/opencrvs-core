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

import { UUID } from '../../uuid'
import { Action, ActionStatus } from '../ActionDocument'
import { ActionType } from '../ActionType'
import { EventDocument } from '../EventDocument'

/**
 * The three legally distinct forms a record can hold. A record has at most one
 * of each; each can hold several versions.
 */
export const RecordForm = {
  NOTIFICATION: 'NOTIFICATION',
  DECLARATION: 'DECLARATION',
  REGISTRATION: 'REGISTRATION'
} as const

export type RecordForm = (typeof RecordForm)[keyof typeof RecordForm]

/**
 * Accepted action types that open or amend one of the forms. Every other
 * accepted action still participates in the declaration fold — it just does not
 * get its own entry in the selector.
 */
const VERSION_ACTION_TYPES: ActionType[] = [
  ActionType.NOTIFY,
  ActionType.DECLARE,
  ActionType.EDIT,
  ActionType.REGISTER,
  ActionType.APPROVE_CORRECTION
]

export interface RecordVersion {
  actionId: UUID
  actionType: ActionType
  form: RecordForm
  /** 0-based position within its own form, oldest first. */
  indexInForm: number
  isLatestOfForm: boolean
  createdAt: string
  createdBy: string
  createdAtLocation?: UUID | null
}

/**
 * Actions are ordered by createdAt, with the original array position breaking
 * ties so the order stays stable when two actions share a timestamp.
 */
export function sortActionsChronologically<T extends Action>(
  actions: T[]
): T[] {
  return actions
    .map((action, originalIndex) => ({ action, originalIndex }))
    .sort(
      (a, b) =>
        a.action.createdAt.localeCompare(b.action.createdAt) ||
        a.originalIndex - b.originalIndex
    )
    .map(({ action }) => action)
}

/**
 * @returns every selectable version of the record, oldest first.
 *
 * An action belongs to whichever form was open when it happened: everything
 * before DECLARE is the notification, everything from DECLARE until REGISTER is
 * the declaration, everything from REGISTER onwards is the registration. This
 * needs no special casing because EDIT is unavailable once a record is
 * registered — see AVAILABLE_ACTIONS_BY_EVENT_STATUS in ./availableActions.
 */
export function getRecordVersions(event: EventDocument): RecordVersion[] {
  const sorted = sortActionsChronologically(event.actions)

  let form: RecordForm = RecordForm.NOTIFICATION
  const countByForm: Record<RecordForm, number> = {
    [RecordForm.NOTIFICATION]: 0,
    [RecordForm.DECLARATION]: 0,
    [RecordForm.REGISTRATION]: 0
  }
  const versions: RecordVersion[] = []

  for (const action of sorted) {
    if (action.type === ActionType.DECLARE) {
      form = RecordForm.DECLARATION
    }
    if (action.type === ActionType.REGISTER) {
      form = RecordForm.REGISTRATION
    }

    if (action.status !== ActionStatus.Accepted) {
      continue
    }

    if (!VERSION_ACTION_TYPES.includes(action.type)) {
      continue
    }

    versions.push({
      actionId: action.id,
      actionType: action.type,
      form,
      indexInForm: countByForm[form],
      isLatestOfForm: false,
      createdAt: action.createdAt,
      createdBy: action.createdBy,
      createdAtLocation: action.createdAtLocation
    })

    countByForm[form] = countByForm[form] + 1
  }

  return versions.map((version) => ({
    ...version,
    isLatestOfForm: version.indexInForm === countByForm[version.form] - 1
  }))
}
