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

import { ActionType } from '../ActionType'
import {
  Action,
  ActionDocument,
  ActionStatus,
  ActionUpdate,
  EventState,
  RegisterAction
} from '../ActionDocument'
import { EventDocument } from '../EventDocument'
import { EventIndex } from '../EventIndex'
import { EventStatus, ZodDate } from '../EventMetadata'
import { Draft } from '../Draft'
import * as _ from 'lodash'
import { deepMerge, findActiveDrafts, isWriteAction } from '../utils'

function getStatusFromActions(actions: Array<Action>) {
  // If the event has any rejected action, we consider the event to be rejected.
  const hasRejectedAction = actions.some(
    (a) => a.status === ActionStatus.Rejected
  )

  if (hasRejectedAction) {
    return EventStatus.REJECTED
  }

  return actions.reduce<EventStatus>((status, action) => {
    switch (action.type) {
      case ActionType.CREATE:
        return EventStatus.CREATED
      case ActionType.DECLARE:
        return EventStatus.DECLARED
      case ActionType.VALIDATE:
        return EventStatus.VALIDATED
      case ActionType.REGISTER:
        return EventStatus.REGISTERED
      case ActionType.REJECT:
        return EventStatus.REJECTED
      case ActionType.ARCHIVE:
        return EventStatus.ARCHIVED
      case ActionType.NOTIFY:
        return EventStatus.NOTIFIED
      case ActionType.PRINT_CERTIFICATE:
        return EventStatus.CERTIFIED
      case ActionType.ASSIGN:
      case ActionType.UNASSIGN:
      case ActionType.REQUEST_CORRECTION:
      case ActionType.APPROVE_CORRECTION:
      case ActionType.MARKED_AS_DUPLICATE:
      case ActionType.REJECT_CORRECTION:
      case ActionType.READ:
      default:
        return status
    }
  }, EventStatus.CREATED)
}

function getLastUpdatedByUserRoleFromActions(actions: Array<Action>) {
  const actionsWithRoles = actions
    .filter(
      (action) =>
        !isWriteAction(action.type) && action.status !== ActionStatus.Rejected
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const lastAction = actionsWithRoles.at(-1)

  if (!lastAction) {
    throw new Error(
      'Should never happen, at least CREATE action should be present'
    )
  }

  return ActionDocument.parse(lastAction).createdByRole
}

export function getAssignedUserFromActions(actions: Array<ActionDocument>) {
  return actions.reduce<null | string>((user, action) => {
    if (action.type === ActionType.ASSIGN) {
      return action.assignedTo
    }
    if (action.type === ActionType.UNASSIGN) {
      return null
    }

    return user
  }, null)
}

function aggregateActionDeclarations(
  actions: Array<ActionDocument>
): ActionUpdate {
  /** Types that are not taken into the aggregate values (e.g. while printing certificate)
   * stop auto filling collector form with previous print action data)
   */

  const excludedActions = [
    ActionType.REQUEST_CORRECTION,
    ActionType.PRINT_CERTIFICATE
  ]

  return actions.reduce((status, action) => {
    if (
      excludedActions.some((excludedAction) => excludedAction === action.type)
    ) {
      return status
    }

    /*
     * If the action encountered is "APPROVE_CORRECTION", we want to apply the changed
     * details in the correction. To do this, we find the original request that this
     * approval is for and merge its details with the current data of the record.
     */

    if (action.type === ActionType.APPROVE_CORRECTION) {
      const requestAction = actions.find(({ id }) => id === action.requestId)
      if (!requestAction) {
        return status
      }
      return deepMerge(status, requestAction.declaration)
    }

    return deepMerge(status, action.declaration)
  }, {})
}

type NonNullableDeep<T> = T extends (infer U)[]
  ? NonNullableDeep<U>[]
  : T extends object
    ? { [K in keyof T]: NonNullableDeep<NonNullable<T[K]>> }
    : NonNullable<T>

/**
 * @returns Given arbitrary object, recursively remove all keys with null values
 *
 * @example
 * deepDropNulls({ a: null, b: { c: null, d: 'foo' } }) // { b: { d: 'foo' } }
 *
 */
export function deepDropNulls<T>(obj: T): NonNullableDeep<T> {
  if (Array.isArray(obj)) {
    return obj.map(deepDropNulls) as NonNullableDeep<T>
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const cleanedValue = deepDropNulls(value)
      if (cleanedValue !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(acc as any)[key] = cleanedValue
      }
      return acc
    }, {} as NonNullableDeep<T>)
  }

  return obj as NonNullableDeep<T>
}

export function isUndeclaredDraft(status: EventStatus): boolean {
  return status === EventStatus.CREATED
}
export function getAcceptedActions(event: EventDocument): ActionDocument[] {
  return event.actions.filter(
    (a): a is ActionDocument => a.status === ActionStatus.Accepted
  )
}
export function getCurrentEventState(event: EventDocument): EventIndex {
  const creationAction = event.actions.find(
    (action) => action.type === ActionType.CREATE
  )

  if (!creationAction) {
    throw new Error(`Event ${event.id} has no creation action`)
  }

  const activeActions = getAcceptedActions(event)
  const latestAction = activeActions[activeActions.length - 1]

  const registrationAction = activeActions.find(
    (a): a is RegisterAction =>
      a.type === ActionType.REGISTER && a.status === ActionStatus.Accepted
  )

  const registrationNumber = registrationAction?.registrationNumber ?? null

  const declaration = aggregateActionDeclarations(activeActions)

  let dateOfEvent: string | null = event.createdAt.split('T')[0]

  if (event.dateOfEvent) {
    const parsedDate = ZodDate.safeParse(declaration[event.dateOfEvent.fieldId])
    dateOfEvent = parsedDate.success ? parsedDate.data : null
  }

  return deepDropNulls({
    id: event.id,
    type: event.type,
    status: getStatusFromActions(event.actions),
    createdAt: event.createdAt,
    createdBy: creationAction.createdBy,
    createdAtLocation: creationAction.createdAtLocation ?? '', // @todo remove using empty string
    updatedAt: latestAction.createdAt,
    assignedTo: getAssignedUserFromActions(activeActions),
    updatedBy: latestAction.createdBy,
    updatedAtLocation: event.updatedAtLocation,
    declaration,
    trackingId: event.trackingId,
    registrationNumber,
    updatedByUserRole: getLastUpdatedByUserRoleFromActions(event.actions),
    dateOfEvent
  })
}

/**
 * @returns the future state of the event with drafts applied
 */
export function getCurrentEventStateWithDrafts(
  event: EventDocument,
  drafts: Draft[]
): EventIndex {
  const actions = event.actions
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const activeDrafts = findActiveDrafts(event, drafts)
    .map((draft) => draft.action)
    .flatMap((action) => {
      /*
       * If the action encountered is "REQUEST_CORRECTION", we want to pretend like it was approved
       * so previews etc are shown correctly
       */
      if (action.type === ActionType.REQUEST_CORRECTION) {
        return [
          action,
          {
            ...action,
            type: ActionType.APPROVE_CORRECTION
          }
        ] as ActionDocument[]
      }
      return [action] as ActionDocument[]
    })

  const actionWithDrafts = [...actions, ...activeDrafts].sort()
  const withDrafts: EventDocument = {
    ...event,
    actions: actionWithDrafts
  }

  return getCurrentEventState(withDrafts)
}

export function applyDraftsToEventIndex(
  eventIndex: EventIndex,
  drafts: Draft[]
) {
  const indexedAt = eventIndex.updatedAt

  const activeDrafts = drafts
    .filter(({ createdAt }) => new Date(createdAt) > new Date(indexedAt))
    .map((draft) => draft.action)
    .sort()

  if (activeDrafts.length === 0) {
    return eventIndex
  }

  return {
    ...eventIndex,
    declaration: {
      ...eventIndex.declaration,
      ...activeDrafts[activeDrafts.length - 1].declaration
    }
  }
}

/**
 * Annotation is always specific to the action. when action with annotation is triggered multiple times,
 * previous annotations should have no effect on the new action annotation. (e.g. printing once should not pre-select print form fields)
 *
 * @returns annotation generated from drafts
 */
export function getAnnotationFromDrafts(drafts: Draft[]) {
  const actions = drafts.map((draft) => draft.action)

  const annotation = actions.reduce((ann, action) => {
    return deepMerge(ann, action.annotation ?? {})
  }, {})

  return deepDropNulls(annotation)
}

export function getActionAnnotation({
  event,
  actionType,
  drafts = []
}: {
  event: EventDocument
  actionType: ActionType
  drafts?: Draft[]
}): EventState {
  const activeActions = getAcceptedActions(event)
  const action = activeActions.find(
    (activeAction) => actionType === activeAction.type
  )

  const eventDrafts = drafts.filter((draft) => draft.eventId === event.id)

  const sorted = [
    ...(action ? [action] : []),
    ...eventDrafts.map((draft) => draft.action)
  ].sort()

  const annotation = sorted.reduce((ann, sortedAction) => {
    return deepMerge(ann, sortedAction.annotation ?? {})
  }, {})

  return deepDropNulls(annotation)
}
