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
  WorkqueueConfigWithoutQuery,
  joinValues,
  UUID,
  UserOrSystem,
  AdministrativeArea,
  ActionType,
  flattenEntries,
  EventMetadataDateFieldId,
  getAcceptedScopesByType,
  decodeScope,
  RecordScopeTypeV2,
  EncodedScope,
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
 * Used for fetching user data in bulk.
 * @returns unique ids of users which are referenced in the ActionDocument array.
 */
export const getUserIdsFromActions = (actions: ActionDocument[]) => {
  const userIdFields = [
    'createdBy',
    'assignedTo'
  ] satisfies AllKeys<ActionDocument>[]

  const userIds = actions.flatMap((action) =>
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

export function hasOutboxWorkqueue(scopes: EncodedScope[]) {
  const hasRecordScope = scopes.some((s) => {
    const scope = decodeScope(s)
    return (
      scope &&
      RecordScopeTypeV2.options.includes(scope.type as RecordScopeTypeV2)
    )
  })

  return hasRecordScope
}

export function hasDraftWorkqueue(scopes: EncodedScope[]) {
  return (
    getAcceptedScopesByType({
      acceptedScopes: ['record.create'],
      scopes
    }).length > 0
  )
}

export const WORKQUEUE_OUTBOX: WorkqueueConfigWithoutQuery = {
  name: {
    id: 'workqueues.outbox.title',
    defaultMessage: 'Outbox',
    description: 'Title of outbox workqueue'
  },
  slug: CoreWorkqueues.OUTBOX,
  icon: 'PaperPlaneTilt'
}

export const WORKQUEUE_DRAFT: WorkqueueConfigWithoutQuery = {
  name: {
    id: 'workqueues.draft.title',
    defaultMessage: 'Drafts',
    description: 'Title of draft workqueue'
  },
  action: { type: ActionType.DECLARE },
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

// Given an administrative area id, return the full hierarchy from root to leaf.
export function getAdministrativeAreaHierarchy(
  administrativeAreaId: string | undefined | null,
  administrativeAreas: Map<UUID, AdministrativeArea>
) {
  // Collect location objects from leaf to root
  const collectedLocations: AdministrativeArea[] = []

  const parsedAdministrativeAreaId =
    administrativeAreaId && UUID.safeParse(administrativeAreaId).data

  let current = parsedAdministrativeAreaId
    ? administrativeAreas.get(parsedAdministrativeAreaId)
    : null

  while (current) {
    collectedLocations.push(current)
    if (!current.parentId) {
      break
    }
    const parentId = current.parentId
    current = administrativeAreas.get(parentId)
  }

  return collectedLocations
}

/*
  Function to traverse the administrative level hierarchy from an arbitrary / leaf point
*/
export function getAdminLevelHierarchy(
  administrativeAreaId: string | undefined | null,
  administrativeAreas: Map<UUID, AdministrativeArea>,
  adminStructure: string[],
  outputMode: OutputMode = 'withIds'
) {
  // Reverse so root is first, leaf is last
  const collectedLocations = getAdministrativeAreaHierarchy(
    administrativeAreaId,
    administrativeAreas
  ).reverse()

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
