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
  Action,
  ActionType,
  DeclarationUpdateActionType,
  Draft,
  UUID
} from '@opencrvs/commons/client'

export function getEventDrafts(
  eventId: UUID,
  localDraft: Draft,
  drafts: Draft[]
) {
  return drafts
    .filter((d) => d.eventId === eventId)
    .concat({
      ...localDraft,
      /*
       * Force the local draft always to be the latest
       * This is to prevent a situation where the local draft gets created,
       * then a CREATE action request finishes in the background and is stored with a later
       * timestamp
       */
      createdAt: new Date().toISOString(),
      /*
       * If params.eventId changes (from tmp id to concrete id) then change the local draft id
       */
      eventId,
      action: {
        ...localDraft.action,
        createdAt: new Date().toISOString()
      }
    })
}

export type AvailableActionTypes = Extract<
  ActionType,
  | 'NOTIFY'
  | 'DECLARE'
  | 'VALIDATE'
  | 'REGISTER'
  | 'REQUEST_CORRECTION'
  | 'APPROVE_CORRECTION'
  | 'REJECT_CORRECTION'
  | 'DUPLICATE_DETECTED'
>

/**
 * Business requirement states that annotation must be prefilled from previous action.
 * From architechtual perspective, each action has separate annotation of its own.
 *
 * @returns the previous declaration action type based on the current action type.
 */
export function getPreviousDeclarationActionType(
  actions: Action[],
  currentActionType: AvailableActionTypes
): DeclarationUpdateActionType | typeof ActionType.NOTIFY | undefined {
  /** NOTE: If event is rejected before registration, there might be previous action of the same type present.
   * Action arrays are intentionally ordered to get the latest prefilled annotation.
   * */
  let actionTypes: (DeclarationUpdateActionType | typeof ActionType.NOTIFY)[]

  switch (currentActionType) {
    case ActionType.NOTIFY: {
      actionTypes = [ActionType.NOTIFY]
      break
    }
    case ActionType.DECLARE: {
      actionTypes = [
        ActionType.DUPLICATE_DETECTED,
        ActionType.DECLARE,
        ActionType.NOTIFY
      ]
      break
    }
    case ActionType.VALIDATE: {
      actionTypes = [
        ActionType.DUPLICATE_DETECTED,
        ActionType.VALIDATE,
        ActionType.DECLARE
      ]
      break
    }
    case ActionType.REGISTER: {
      actionTypes = [ActionType.VALIDATE, ActionType.DUPLICATE_DETECTED]
      break
    }
    case ActionType.REQUEST_CORRECTION: {
      actionTypes = [ActionType.REGISTER]
      break
    }
    case ActionType.APPROVE_CORRECTION:
    case ActionType.REJECT_CORRECTION: {
      actionTypes = [ActionType.REQUEST_CORRECTION]
      break
    }
    case ActionType.DUPLICATE_DETECTED: {
      actionTypes = [ActionType.DUPLICATE_DETECTED]
      break
    }
    default: {
      const _check: never = currentActionType
      actionTypes = []
    }
  }

  for (const type of actionTypes) {
    const foundAction = actions.find((a) => a.type === type)
    if (foundAction) {
      const actionTransactionId = foundAction.transactionId
      const actionsWithSameTransactionId = actions.filter(
        (a) => a.transactionId === actionTransactionId && a.type === type
      )

      if (actionsWithSameTransactionId.length > 0) {
        const declarationAction = actionsWithSameTransactionId.find(
          (a) => 'declaration' in a && Object.keys(a.declaration).length > 0
        )

        if (
          declarationAction &&
          actionTypes.includes(
            declarationAction.type as
              | DeclarationUpdateActionType
              | typeof ActionType.NOTIFY
          )
        ) {
          return declarationAction.type as
            | DeclarationUpdateActionType
            | typeof ActionType.NOTIFY
        } else {
          continue
        }
      }

      return type
    }
  }

  return
}
