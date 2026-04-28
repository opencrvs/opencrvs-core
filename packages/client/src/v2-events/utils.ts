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
import { uniq, isString, get, mergeWith } from 'lodash'
import { v4 as uuid } from 'uuid'
import {
  ActionDocument,
  EventIndex,
  Scope,
  ActionScopes,
  WorkqueueConfigWithoutQuery,
  joinValues,
  UUID,
  SystemRole,
  Location,
  UserOrSystem,
  flattenEntries,
  EventMetadataDateFieldId
} from '@opencrvs/commons/client'

export function getUsersFullName(name: UserOrSystem['name'], language: string) {
  if (typeof name === 'string') {
    return name
  }

  const match = name.find((n) => n.use === language) ?? name[0]

  return joinValues([...match.given, match.family])
}

/** Utility to get all keys from union */
type AllKeys<T> = T extends T ? keyof T : never

/**
 * @returns unique ids of users are referenced in the ActionDocument array.
 * Used for fetching user data in bulk.
 */
export const getUserIdsFromActions = (
  actions: ActionDocument[],
  ignoreRoles?: SystemRole[]
) => {
  const userIdFields = [
    'createdBy',
    'assignedTo'
  ] satisfies AllKeys<ActionDocument>[]

  const userIds = actions
    .filter(
      ({ createdByRole }) =>
        !ignoreRoles?.some((role) => role === createdByRole)
    )
    .flatMap((action) =>
      userIdFields.map((fieldName) => get(action, fieldName)).filter(isString)
    )

  return uniq(userIds)
}

function eventMetadataObjectFromEntries(entries: [string, unknown][]) {
  const result: Record<string, unknown> = {}
  for (const [key, value] of entries) {
    result[`event.${key}`] = value
  }
  return result
}

export function flattenEventIndex(event: EventIndex) {
  const { declaration, trackingId, status, ...rest } = event
  return {
    ...declaration,
    ...eventMetadataObjectFromEntries(
      flattenEntries({ trackingId, status, ...rest })
    ),
    'event.registrationNumber':
      rest.legalStatuses.REGISTERED?.registrationNumber,
    'event.registeredAt': rest.legalStatuses.REGISTERED?.createdAtLocation,
    'event.registeredBy': rest.legalStatuses.REGISTERED?.createdBy
  }
}

export function convertDateFieldsToUnixTimestamps(
  eventIndex: Record<string, unknown>
) {
  return Object.fromEntries(
    Object.entries(eventIndex).map(([key, value]) => {
      if (
        EventMetadataDateFieldId.options.includes(
          key as EventMetadataDateFieldId
        ) &&
        typeof value === 'string'
      ) {
        return [key, new Date(value).getTime()]
      }
      return [key, value]
    })
  )
}

export type RequireKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export function isTemporaryId(id: string) {
  return id.startsWith('tmp-')
}

export function createTemporaryId() {
  return `tmp-${uuid()}` as UUID
}

export const AssignmentStatus = {
  ASSIGNED_TO_SELF: 'ASSIGNED_TO_SELF',
  ASSIGNED_TO_OTHERS: 'ASSIGNED_TO_OTHERS',
  UNASSIGNED: 'UNASSIGNED'
} as const

type AssignmentStatus = (typeof AssignmentStatus)[keyof typeof AssignmentStatus]

export function getAssignmentStatus(
  eventState: EventIndex,
  userId: string
): AssignmentStatus {
  if (!eventState.assignedTo) {
    return AssignmentStatus.UNASSIGNED
  }

  return eventState.assignedTo == userId
    ? AssignmentStatus.ASSIGNED_TO_SELF
    : AssignmentStatus.ASSIGNED_TO_OTHERS
}

export function filterEmptyValues(
  obj: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) =>
        v !== '' &&
        v !== null &&
        v !== undefined &&
        !(typeof v === 'number' && isNaN(v))
    )
  )
}

export interface Option<T = string> {
  value: T
  label: string
}

export enum CoreWorkqueues {
  OUTBOX = 'outbox',
  DRAFT = 'draft'
}

export function hasOutboxWorkqueue(scopes: Scope[]) {
  return scopes.some((scope) => ActionScopes.safeParse(scope).success)
}

export function hasDraftWorkqueue(scopes: Scope[]) {
  return scopes.some((scope) => scope.startsWith('record.declare'))
}

export const WORKQUEUE_OUTBOX: WorkqueueConfigWithoutQuery = {
  name: {
    id: 'workqueues.outbox.title',
    defaultMessage: 'Outbox',
    description: 'Title of outbox workqueue'
  },
  actions: [],
  slug: CoreWorkqueues.OUTBOX,
  icon: 'PaperPlaneTilt'
}

export const WORKQUEUE_DRAFT: WorkqueueConfigWithoutQuery = {
  name: {
    id: 'workqueues.draft.title',
    defaultMessage: 'My drafts',
    description: 'Title of draft workqueue'
  },
  actions: [],
  slug: CoreWorkqueues.DRAFT,
  icon: 'FileDotted'
}

export const emptyMessage = {
  defaultMessage: '',
  description: 'empty string',
  id: 'messages.emptyString'
}

export function mergeWithoutNullsOrUndefined<T>(
  object: T,
  source: Partial<T>
): T {
  return mergeWith({}, object, source, (objValue, srcValue) => {
    if (srcValue === undefined || srcValue === null) {
      return objValue
    }
    return undefined
  })
}

type OutputMode = 'withIds' | 'withNames'
/*
Function to traverse the administrative level hierarchy from an arbitrary / leaf point
*/
export function getAdminLevelHierarchy(
  locationId: string | undefined,
  locations: Location[],
  adminStructure: string[],
  outputMode: OutputMode = 'withIds'
) {
  // Collect location objects from leaf to root
  const collectedLocations: Location[] = []

  let current = locationId
    ? locations.find((l) => l.id === locationId.toString())
    : null

  while (current) {
    collectedLocations.push(current)
    if (!current.parentId) {
      break
    }
    const parentId = current.parentId
    current = locations.find((l) => l.id === parentId)
  }

  // Reverse so root is first, leaf is last
  collectedLocations.reverse()

  // Map collected locations to the provided admin structure
  const hierarchy: Partial<Record<string, string>> = {}
  for (
    let i = 0;
    i < adminStructure.length && i < collectedLocations.length;
    i++
  ) {
    hierarchy[adminStructure[i]] =
      outputMode === 'withNames'
        ? collectedLocations[i].name
        : collectedLocations[i].id
  }

  return hierarchy
}

export function hasStringFilename(
  field: unknown
): field is { filename: string } {
  return (
    !!field &&
    typeof field === 'object' &&
    'filename' in field &&
    typeof field.filename === 'string'
  )
}

export function padZero(num: number) {
  return num.toString().padStart(2, '0')
}
