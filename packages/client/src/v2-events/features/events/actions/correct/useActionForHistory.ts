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
  ActionDocument,
  ActionType,
  DeclarationActionType,
  EventConfig,
  EventDocument,
  getAcceptedActions,
  getCurrentEventState,
  UUID,
  ValidatorContext,
  DeclarationActions,
  ActionStatus,
  getCompleteActionDeclaration,
  getCompleteActionAnnotation
} from '@opencrvs/commons/client'
import { hasAnnotationChanged, getDeclarationComparison } from './utils'

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

function hasDeclarationChanged(
  fullEvent: EventDocument,
  action: Extract<Action, { type: DeclarationActionType }>,
  validatorContext: ValidatorContext,
  eventConfiguration: EventConfig
) {
  const hasUpdatedDeclarationValues = getDeclarationComparison(
    fullEvent,
    action,
    validatorContext,
    eventConfiguration
  ).valueHasChanged

  const hasUpdatedAnnotationValues = hasAnnotationChanged(
    fullEvent,
    action,
    validatorContext,
    eventConfiguration
  )

  const hasUpdatedValues =
    hasUpdatedDeclarationValues || hasUpdatedAnnotationValues

  return hasUpdatedValues
}

function isDeclarationAction(
  action: Action
): action is Extract<Action, { type: DeclarationActionType }> {
  return DeclarationActions.safeParse(action.type).success
}

/**
 * Includes a request action, if the corresponding accepted action has different transactionId
 * Merges declarations and annotations from the corresponding request action for an accepted action
 * @param fullEvent - The full EventDocument containing an actions array to filter.
 * @returns An array of actionDocument considered part of the event history.
 */
export function extractHistoryActions(
  fullEvent: EventDocument
): ActionDocument[] {
  function isHistoryAction(a: Action): a is ActionDocument {
    if (a.status === ActionStatus.Accepted) {
      return true
    }

    if (a.status === ActionStatus.Requested) {
      const immediatelyAcceptedAction = fullEvent.actions.find(
        ({ originalActionId, transactionId }) =>
          originalActionId === a.id && transactionId === a.transactionId
      )
      if (!immediatelyAcceptedAction) {
        return true
      }
    }

    return false
  }

  return fullEvent.actions.filter(isHistoryAction).map((action) => ({
    ...action,
    declaration: getCompleteActionDeclaration({}, fullEvent, action),
    annotation: getCompleteActionAnnotation({}, fullEvent, action)
  }))
}

/**
 * Enhances an event’s action history by injecting synthetic `UPDATE` actions
 * whenever a `NOTIFY`, `DECLARE`, `VALIDATE`, or `REGISTER` action has a changed declaration.
 *
 * For each changed action:
 * - A synthetic `UPDATE` action is added (with `id` suffixed by `-update`).
 * - The original action is duplicated to preserve ordering.
 *
 * All other actions are returned untouched.
 *
 * @param {ActionDocument[]} params.actions - The list of event actions to process.
 * @returns {EventHistoryActionDocument[]} A new list of actions, including injected `UPDATE` actions.
 *
 * @example
 * const result = appendUpdateAction(actions);
 * // → [ { ...actions }, { ...synthetic UPDATE for a DECLARE action}, { ...original DECLARE action }, ... ]
 */
export function expandWithClientSpecificActions(
  fullEvent: EventDocument,
  validatorContext: ValidatorContext,
  eventConfiguration: EventConfig
): EventHistoryActionDocument[] {
  return extractHistoryActions(fullEvent).flatMap<EventHistoryActionDocument>(
    (action) => {
      if (isDeclarationAction(action)) {
        if (
          !hasDeclarationChanged(
            fullEvent,
            action,
            validatorContext,
            eventConfiguration
          )
        ) {
          return [action]
        }

        return [
          {
            ...action,
            // Cast suffixed id as UUID to ensure uniqueness for synthetic UPDATE actions.
            // We can't generate random UUIDs here, since components rely on stable IDs
            // to find actions across renders.
            id: `${action.id}-update` as UUID,
            type: DECLARATION_ACTION_UPDATE
          },
          // Preserve the original action’s declaration.
          // This is required so that when the synthetic UPDATE action is later stripped out,
          // declaration changes can still be detected correctly in getCurrentEventState.
          action
        ]
      }

      return [action]
    }
  )
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

function toEventDocument(event: EventHistoryDocument): EventDocument {
  return {
    ...event,
    actions: event.actions.filter(
      (a): a is ActionDocument => a.type !== DECLARATION_ACTION_UPDATE
    )
  }
}

/**
 * UI-safe wrapper around getCurrentEventState.
 *
 * Accepts EventHistoryDocument (with client-only UPDATE actions)
 * but strips them out before delegating to the real implementation.
 */
export function getCurrentEventStateSafe(
  event: EventHistoryDocument,
  config: EventConfig
) {
  return getCurrentEventState(toEventDocument(event), config)
}
