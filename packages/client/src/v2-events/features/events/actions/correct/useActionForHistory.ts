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

import { isEqual, take } from 'lodash'
import {
  Action,
  ActionDocument,
  ActionType,
  ActionTypes,
  DeclarationActionType,
  EventConfig,
  EventDocument,
  getCurrentEventState,
  UUID
} from '@opencrvs/commons/client'
import { getPreviousDeclarationActionType } from '../../components/Action/utils'

/**
 * Indicates that declaration action changed declaration content. Satisfies V1 spec.
 */
export const DECLARATION_ACTION_UPDATE = 'UPDATE' as const
type DECLARATION_ACTION_UPDATE = typeof DECLARATION_ACTION_UPDATE

type UpdateActionDocument = Omit<ActionDocument, 'type'> & {
  type: DECLARATION_ACTION_UPDATE
}

/**
 * Specialized action document used only on the client side.
 *
 * Unlike the standard ActionDocument, this includes the synthetic
 * `DECLARATION_ACTION_UPDATE` type which does not exist on the server.
 * The client is responsible for interpreting this action and displaying
 * it in the event’s audit history UI.
 */
export type EventHistoryActionDocument = ActionDocument | UpdateActionDocument
export type EventHistoryDocument = Omit<EventDocument, 'actions'> & {
  actions: EventHistoryActionDocument[]
}

function getPreviousActions(arr: ActionDocument[], id: string) {
  const index = arr.findIndex((item) => item.id === id)
  return index === -1 ? arr : take(arr, index)
}
export function hasDeclarationChanged(
  actions: ActionDocument[],
  action: Extract<
    Action,
    { type: Exclude<DeclarationActionType, typeof ActionType.NOTIFY> }
  >
) {
  const previousActions = getPreviousActions(actions, action.id)
  const previousActionType = getPreviousDeclarationActionType(
    previousActions,
    action.type
  )

  const previousDeclarationAction = previousActionType
    ? actions.find((act) => act.type === previousActionType)
    : undefined

  const currentActionHasUpdates = Object.keys(action.declaration).length > 0
  const previousActionHasDeclaration = !!previousDeclarationAction?.declaration

  const hasUpdatedDeclarationValues = Object.entries(action.declaration).some(
    ([key, value]) => {
      const prevValue = previousDeclarationAction?.declaration[key]
      return !isEqual(prevValue, value)
    }
  )

  const hasUpdatedAnnotationValues =
    action.annotation &&
    Object.entries(action.annotation).some(([key, value]) => {
      const prevValue = previousDeclarationAction?.annotation?.[key]
      return !isEqual(prevValue, value)
    })

  const hasUpdatedValues =
    hasUpdatedDeclarationValues || hasUpdatedAnnotationValues

  return (
    currentActionHasUpdates && previousActionHasDeclaration && hasUpdatedValues
  )
}

/**
 * Enhances an event’s action history by injecting synthetic `UPDATE` actions
 * whenever a `DECLARE`, `VALIDATE`, or `REGISTER` action has a changed declaration.
 *
 * For each changed action:
 * - A synthetic `UPDATE` action is added (with `id` suffixed by `-update`).
 * - The original action is duplicated with an empty `declaration` to preserve ordering.
 *
 * All other actions are returned untouched.
 *
 * @param {ActionDocument[]} params.actions - The list of event actions to process.
 * @returns {EventHistoryActionDocument[]} A new list of actions, including injected `UPDATE` actions.
 *
 * @example
 * const result = appendUpdateAction(actions);
 * // → [ { ...original DECLARE }, { ...synthetic UPDATE }, { ...DECLARE with empty declaration }, ... ]
 */
export function expandWithUpdateActions(
  actions: ActionDocument[]
): EventHistoryActionDocument[] {
  return actions.flatMap<EventHistoryActionDocument>((action) => {
    if (
      action.type === ActionTypes.enum.VALIDATE ||
      action.type === ActionTypes.enum.REGISTER ||
      action.type === ActionTypes.enum.DECLARE
    ) {
      if (hasDeclarationChanged(actions, action)) {
        return [
          {
            ...action,
            // Cast suffixed id as UUID to ensure uniqueness for synthetic UPDATE actions.
            // We can't generate random UUIDs here, since components rely on stable IDs
            // to find actions across renders.
            id: `${action.id}-update` as UUID,
            type: DECLARATION_ACTION_UPDATE
          },
          {
            ...action,
            declaration: {}
          }
        ]
      }
      return [action]
    }
    return [action]
  })
}

export function useActionForHistory() {
  function getActionTypeForHistory(
    actions: ActionDocument[],
    action: EventHistoryActionDocument
  ) {
    if (action.type === ActionType.REQUEST_CORRECTION) {
      const approveAction = actions.find(
        (x) =>
          x.type === ActionType.APPROVE_CORRECTION &&
          (x.requestId === action.id ||
            x.requestId === action.originalActionId) &&
          x.annotation?.isImmediateCorrection &&
          x.createdBy === action.createdBy
      )
      if (approveAction) {
        return 'CORRECTED'
      }
    }

    return action.type
  }

  return { getActionTypeForHistory }
}
