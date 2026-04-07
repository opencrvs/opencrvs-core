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
  EventDocument,
  EventState,
  getActionAnnotation
} from '@opencrvs/commons/client'

export type AvailableActionTypes = Extract<
  ActionType,
  | 'NOTIFY'
  | 'DECLARE'
  | 'REGISTER'
  | 'REQUEST_CORRECTION'
  | 'APPROVE_CORRECTION'
  | 'REJECT_CORRECTION'
  | 'EDIT'
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
      actionTypes = [ActionType.DECLARE, ActionType.NOTIFY]
      break
    }
    case ActionType.EDIT: {
      actionTypes = [ActionType.DECLARE, ActionType.NOTIFY]
      break
    }
    case ActionType.REGISTER: {
      actionTypes = [ActionType.DECLARE]
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
    default: {
      const _check: never = currentActionType
      actionTypes = []
    }
  }

  for (const type of actionTypes) {
    if (actions.find((a) => a.type === type)) {
      return type
    }
  }

  return
}

/**
 * Returns the annotation for a given action type from an event.
 *
 * NOTIFY shares the DECLARE action config, so when resolving DECLARE annotation
 * both DECLARE and NOTIFY annotations are merged together.
 * For all other action types, if no annotation exists the NOTIFY annotation is
 * returned as a fallback (NOTIFY is the earliest action that can capture annotation).
 */
export function getAnnotationForActionType({
  event,
  actionType,
  draft
}: {
  event: EventDocument
  actionType: ActionType
  draft?: Draft
}): EventState {
  const annotation = getActionAnnotation({ event, actionType, draft })

  if (actionType === ActionType.DECLARE) {
    // NOTIFY shares the DECLARE action config — merge both
    const notifyAnnotation = getActionAnnotation({
      event,
      actionType: ActionType.NOTIFY,
      draft
    })
    return { ...annotation, ...notifyAnnotation }
  }

  if (Object.keys(annotation).length === 0) {
    // Fall back to NOTIFY as the earliest annotation source
    return getActionAnnotation({ event, actionType: ActionType.NOTIFY, draft })
  }

  return annotation
}
