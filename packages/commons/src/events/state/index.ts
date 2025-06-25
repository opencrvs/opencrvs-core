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
  EventState
} from '../ActionDocument'
import { EventDocument } from '../EventDocument'
import { EventIndex } from '../EventIndex'
import { CustomFlags, EventStatus, Flag, ZodDate } from '../EventMetadata'
import { Draft } from '../Draft'
import { deepMerge, findActiveDrafts } from '../utils'
import { getActionUpdateMetadata, getLegalStatuses } from './utils'
import { EventConfig } from '../EventConfig'

export function getStatusFromActions(actions: Array<Action>) {
  // If the event has any rejected action, we consider the event to be rejected.
  const hasRejectedAction = actions.some(
    (a) => a.status === ActionStatus.Rejected
  )

  if (hasRejectedAction) {
    return EventStatus.enum.REJECTED
  }

  return actions.reduce<EventStatus>((status, action) => {
    switch (action.type) {
      case ActionType.CREATE:
        return EventStatus.enum.CREATED
      case ActionType.DECLARE:
        return EventStatus.enum.DECLARED
      case ActionType.VALIDATE:
        return EventStatus.enum.VALIDATED
      case ActionType.REGISTER:
        return EventStatus.enum.REGISTERED
      case ActionType.REJECT:
        return EventStatus.enum.REJECTED
      case ActionType.ARCHIVE:
        return EventStatus.enum.ARCHIVED
      case ActionType.NOTIFY:
        return EventStatus.enum.NOTIFIED
      case ActionType.PRINT_CERTIFICATE:
        return EventStatus.enum.CERTIFIED
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
  }, EventStatus.enum.CREATED)
}

function getFlagsFromActions(actions: Action[]): Flag[] {
  const sortedactions = actions.sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  )
  const actionStatus = sortedactions.reduce(
    (actionStatuses, { type, status }) => ({
      ...actionStatuses,
      [type]: status
    }),
    {} as Record<ActionType, ActionStatus>
  )

  const flags = Object.entries(actionStatus)
    .filter(([, status]) => status !== ActionStatus.Accepted)
    .map(([type, status]) => {
      const flag = `${type.toLowerCase()}:${status.toLowerCase()}`
      return flag satisfies Flag
    })

  const isCertificatePrinted = sortedactions.reduce<boolean>(
    (prev, { type }) => {
      if (type === ActionType.PRINT_CERTIFICATE) {
        return true
      }
      if (type === ActionType.APPROVE_CORRECTION) {
        return false
      }
      return prev
    },
    false
  )

  if (isCertificatePrinted) {
    flags.push(CustomFlags.CERTIFICATE_PRINTED)
  }

  return flags
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

export function getAssignedUserSignatureFromActions(
  actions: Array<ActionDocument>
) {
  return actions.reduce<null | string>((signature, action) => {
    if (action.type === ActionType.ASSIGN) {
      return action.createdBySignature || null
    }
    if (action.type === ActionType.UNASSIGN) {
      return null
    }

    return signature
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

  return actions.reduce((declaration, action) => {
    if (
      excludedActions.some((excludedAction) => excludedAction === action.type)
    ) {
      return declaration
    }

    /*
     * If the action encountered is "APPROVE_CORRECTION", we want to apply the changed
     * details in the correction. To do this, we find the original request that this
     * approval is for and merge its details with the current data of the record.
     */

    if (action.type === ActionType.APPROVE_CORRECTION) {
      const requestAction = actions.find(({ id }) => id === action.requestId)
      if (!requestAction) {
        return declaration
      }
      return deepMerge(declaration, requestAction.declaration)
    }

    return deepMerge(declaration, action.declaration)
  }, {})
}

type NonNullableDeep<T> = T extends [unknown, ...unknown[]] // <-- ✨ tiny change: handle tuples first
  ? { [K in keyof T]: NonNullableDeep<NonNullable<T[K]>> }
  : T extends (infer U)[]
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
  return status === EventStatus.enum.CREATED
}
export function getAcceptedActions(event: EventDocument): ActionDocument[] {
  return event.actions.filter(
    (a): a is ActionDocument => a.status === ActionStatus.Accepted
  )
}

export const DEFAULT_DATE_OF_EVENT_PROPERTY =
  'createdAt' satisfies keyof EventDocument

/**
 * @returns the current state of the event based on the actions taken.
 * @see EventIndex for the description of the returned object.
 */
export function getCurrentEventState(
  event: EventDocument,
  config: Partial<EventConfig>
): EventIndex {
  const creationAction = event.actions.find(
    (action) => action.type === ActionType.CREATE
  )

  if (!creationAction) {
    throw new Error(`Event ${event.id} has no creation action`)
  }

  const acceptedActions = getAcceptedActions(event).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  )

  // Includes the metadata of the last action. Whether it was a 'request' by user or 'accept' by user or 3rd party.
  const requestActionMetadata = getActionUpdateMetadata(event.actions)

  // Includes only accepted actions metadata. Sometimes (e.g. on updatedAt) we want to show the accepted timestamp rather than the request timestamp.
  const acceptedActionMetadata = getActionUpdateMetadata(acceptedActions)

  const declaration = aggregateActionDeclarations(acceptedActions)

  let dateOfEvent

  if (config.dateOfEvent) {
    const parsedDate = ZodDate.safeParse(
      declaration[config.dateOfEvent.$$field]
    )
    if (parsedDate.success) {
      dateOfEvent = parsedDate.data
    }
  } else {
    dateOfEvent = event[DEFAULT_DATE_OF_EVENT_PROPERTY].split('T')[0]
  }
  return deepDropNulls({
    id: event.id,
    type: event.type,
    status: getStatusFromActions(event.actions),
    legalStatuses: getLegalStatuses(event.actions),
    createdAt: creationAction.createdAt,
    createdBy: creationAction.createdBy,
    createdByUserType: creationAction.createdByUserType,
    createdAtLocation: creationAction.createdAtLocation,
    createdBySignature: creationAction.createdBySignature,
    updatedAt: acceptedActionMetadata.createdAt,
    assignedTo: getAssignedUserFromActions(acceptedActions),
    assignedToSignature: getAssignedUserSignatureFromActions(acceptedActions),
    updatedBy: requestActionMetadata.createdBy,
    updatedAtLocation: requestActionMetadata.createdAtLocation,
    declaration,
    trackingId: event.trackingId,
    updatedByUserRole: requestActionMetadata.createdByRole,
    dateOfEvent,
    flags: getFlagsFromActions(event.actions)
  })
}

/**
 * @returns the future state of the event with drafts applied
 */
export function getCurrentEventStateWithDrafts({
  event,
  drafts,
  configuration
}: {
  event: EventDocument
  drafts: Draft[]
  configuration: EventConfig
}): EventIndex {
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

  return getCurrentEventState(withDrafts, configuration)
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
