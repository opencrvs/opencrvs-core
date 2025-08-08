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
import { orderBy, findLast } from 'lodash'
import {
  Action,
  ActionDocument,
  ActionStatus,
  ActionUpdate,
  EventState
} from '../ActionDocument'
import { EventDocument } from '../EventDocument'
import { EventIndex } from '../EventIndex'
import { EventStatus, ZodDate } from '../EventMetadata'
import { Draft } from '../Draft'
import { deepMerge } from '../utils'
import { getActionUpdateMetadata, getLegalStatuses } from './utils'
import { EventConfig } from '../EventConfig'
import { getFlagsFromActions } from './flags'
import { getUUID, UUID } from '../../uuid'
import {
  DocumentPath,
  FullDocumentPath,
  FullDocumentUrl
} from '../../documents'

export function getStatusFromActions(actions: Array<Action>) {
  return actions
    .filter(({ status }) => status === ActionStatus.Accepted)
    .reduce<EventStatus>((status, action) => {
      switch (action.type) {
        case ActionType.CREATE:
          return EventStatus.enum.CREATED
        case ActionType.DECLARE:
          return EventStatus.enum.DECLARED
        case ActionType.VALIDATE:
          return EventStatus.enum.VALIDATED
        case ActionType.REGISTER:
          return EventStatus.enum.REGISTERED
        case ActionType.ARCHIVE:
          return EventStatus.enum.ARCHIVED
        case ActionType.NOTIFY:
          return EventStatus.enum.NOTIFIED
        case ActionType.PRINT_CERTIFICATE:
        case ActionType.ASSIGN:
        case ActionType.UNASSIGN:
        case ActionType.REJECT:
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
): EventState {
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
  : T extends UUID
    ? T
    : T extends FullDocumentPath
      ? T
      : T extends DocumentPath
        ? T
        : T extends FullDocumentUrl
          ? T
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

export function resolveDateOfEvent(
  eventMetadata: { createdAt: string },
  declaration: EventState,
  config: EventConfig
) {
  if (!config.dateOfEvent) {
    return eventMetadata[DEFAULT_DATE_OF_EVENT_PROPERTY].split('T')[0]
  }
  const parsedDate = ZodDate.safeParse(declaration[config.dateOfEvent.$$field])
  return parsedDate.success ? parsedDate.data : undefined
}

/**
 * @returns the current state of the event based on the actions taken.
 * @see EventIndex for the description of the returned object.
 */
export function getCurrentEventState(
  event: EventDocument,
  config: EventConfig
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
    dateOfEvent: resolveDateOfEvent(event, declaration, config),
    flags: getFlagsFromActions(event.actions)
  })
}

/**
 * @returns the future state of the event with drafts applied to all fields.
 *
 * NOTE: We treat the draft as a new action that is applied to the event. This means that even the status of the is changed as if draft has been accepted.
 * @see applyDraftToEventIndex to apply the draft to the event without changing the status.
 *
 */
export function dangerouslyGetCurrentEventStateWithDrafts({
  event,
  draft,
  configuration
}: {
  event: EventDocument
  draft: Draft
  configuration: EventConfig
}): EventIndex {
  const actions = event.actions
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const draftAction =
    draft.action.type === ActionType.REQUEST_CORRECTION
      ? /*
         * If the action encountered is "REQUEST_CORRECTION", we want to pretend like it was approved
         * so previews etc are shown correctly
         */
        ({
          id: getUUID(),
          ...draft.action,
          type: ActionType.APPROVE_CORRECTION
        } as ActionDocument)
      : ({ ...draft.action, id: getUUID() } as ActionDocument)

  const actionsWithDraft = orderBy(
    [...actions, draftAction],
    ['createdAt'],
    'asc'
  )

  const eventWithDraft: EventDocument = {
    ...event,
    actions: actionsWithDraft
  }

  return getCurrentEventState(eventWithDraft, configuration)
}

export function applyDeclarationToEventIndex(
  eventIndex: EventIndex,
  declaration: EventState | ActionUpdate,
  eventConfiguration: EventConfig
): EventIndex {
  const updatedDeclaration = deepMerge(eventIndex.declaration, declaration)
  return {
    ...eventIndex,
    dateOfEvent: resolveDateOfEvent(
      eventIndex,
      updatedDeclaration,
      eventConfiguration
    ),
    declaration: updatedDeclaration
  }
}

/**
 * Applies draft to the event index following internal business rules.
 *
 * Ensures only necessary fields are updated based on the draft (declaration, updatedAt, flags).
 * NOTE: When naively applying draft, it leads to incorrect event state, since drafts are 'Accepted' by default.
 *
 */
export function applyDraftToEventIndex(
  eventIndex: EventIndex,
  draft: Draft | undefined,
  eventConfiguration: EventConfig
) {
  const indexedAt = eventIndex.updatedAt

  const activeDraft = draft && draft.createdAt >= indexedAt ? draft : undefined

  if (!activeDraft) {
    return eventIndex
  }

  return applyDeclarationToEventIndex(
    {
      ...eventIndex,
      updatedAt: activeDraft.createdAt
    },
    activeDraft.action.declaration,
    eventConfiguration
  )
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
  draft
}: {
  event: EventDocument
  actionType: ActionType
  draft?: Draft
}): EventState {
  const activeActions = getAcceptedActions(event)

  const action = findLast(activeActions, (a) => a.type === actionType)
  const matchingDraft = draft?.action.type === actionType ? draft : undefined

  const sortedActions = orderBy(
    [action, matchingDraft?.action].filter((a) => a !== undefined),
    'createdAt',
    'asc'
  )

  const annotation = sortedActions.reduce((ann, sortedAction) => {
    return deepMerge(ann, sortedAction.annotation ?? {})
  }, {})

  return deepDropNulls(annotation)
}
