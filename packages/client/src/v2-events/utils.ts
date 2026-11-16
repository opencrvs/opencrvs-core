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
  EventConfig,
  EventIndex,
  EventState,
  WorkqueueConfigWithoutQuery,
  isFieldReference,
  joinValues,
  LocationVersion,
  PlainDate,
  toPlainDate,
  UUID,
  UserOrSystem,
  ClientAdministrativeArea,
  ActionType,
  flattenEntries,
  EventMetadataDateFieldId,
  getAcceptedScopesByType,
  decodeScope,
  RecordScopeTypeV2,
  EncodedScope,
  getAdministrativeAreaHierarchy,
  resolveVersion,
  ZodDate
} from '@opencrvs/commons/client'
import {
  findSelectedVersion,
  parseVersionedLocation,
  toNamedVersions,
  VersionedEntity
} from '@client/v2-events/VersionedLocation'

export function getUsersFullName(name: UserOrSystem['name']) {
  if (typeof name === 'string') {
    return name
  }

  return joinValues([name.firstname, name.surname])
}
export interface LocationOption {
  value: string
  label: string
}

/**
 * Builds advanced-search filter options: one row per distinct name a location or
 * administrative area has ever carried, each pinned to the version that carried
 * it (@see VersionedLocation). Both selectors call this.
 *
 * Ordinary forms list a single current-name option instead of calling this.
 */
export function buildHistoricalLocationNameOptions<T extends VersionedEntity>(
  items: T[]
): LocationOption[] {
  return items.flatMap((item) =>
    toNamedVersions(item).map(({ name, selection }) => ({
      value: selection,
      label: name
    }))
  )
}

/**
 * Narrows a value to the plain id every non-display surface expects
 */
export function toLocationId(value: string): string
export function toLocationId(value: unknown): string | undefined
export function toLocationId(value: unknown): string | undefined {
  const parsed = parseVersionedLocation(value)

  if (parsed) {
    return parsed.locationId
  }

  return typeof value === 'string' ? value : undefined
}

/**
 * The option a location or administrative-area field value is currently on.
 * A pinned value identifies its row by version.
 */
export function findLocationOption(
  options: LocationOption[],
  value: string | null | undefined
): LocationOption | null {
  if (!value) {
    return null
  }

  const locationId = toLocationId(value)

  return (
    options.find((option) => option.value === value) ??
    options.find((option) => toLocationId(option.value) === locationId) ??
    null
  )
}

/**
 * The entity a location or administrative-area field value names, and the
 * version to display for it:
 * the pinned one for a search value, the one in effect at `anchor` for a
 * declaration's bare id. Undefined when the value names neither.
 */
export function resolveLocationValue<T extends VersionedEntity>(
  value: unknown,
  entities: Map<UUID, T>,
  anchor: PlainDate
): { entity: T; version: LocationVersion } | undefined {
  const pinned = findSelectedVersion(value, entities)

  if (pinned) {
    return pinned
  }

  const id = UUID.safeParse(toLocationId(value)).data
  const entity = id && entities.get(id)

  return entity
    ? { entity, version: resolveVersion(entity.versions, anchor) }
    : undefined
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

/**
 * The record anchor — the date at which a record's declaration fields resolve
 * their locations: its date of event, falling back to the record's creation
 * date. `dateOfEvent` is already the plain-date result of `resolveDateOfEvent`;
 * `createdAt` is a datetime, so its date portion is taken.
 */
export function recordAnchorDate(eventState: {
  dateOfEvent?: string | null
  createdAt: string
}): PlainDate {
  return toPlainDate(eventState.dateOfEvent ?? eventState.createdAt)
}

/**
 * Same anchor as {@link recordAnchorDate}, computed while a declaration is
 * still being filled in: the event's date-of-event field read off the
 * in-progress form values (there is no persisted record yet to resolve it
 * from), falling back to the record's creation date when that field is
 * empty or not yet configured.
 */
export function liveAnchorDate({
  dateOfEvent,
  form,
  createdAt
}: {
  dateOfEvent?: EventConfig['dateOfEvent']
  form: EventState
  createdAt: string
}): PlainDate {
  const fieldValue =
    dateOfEvent && isFieldReference(dateOfEvent)
      ? form[dateOfEvent.$$field]
      : undefined

  const parsedDate = ZodDate.safeParse(fieldValue)

  return recordAnchorDate({
    dateOfEvent: parsedDate.success ? parsedDate.data : undefined,
    createdAt
  })
}

/**
 * The name a cached location or administrative area carried at `anchor`,
 * resolved from its version history — or an empty string when the entity is
 * absent. Centralises the missing-entity guard so present-tense surfaces
 * don't each hand-roll their own.
 */
export function resolveLocationName(
  entity: { versions: LocationVersion[] } | undefined,
  anchor: PlainDate
): string {
  return entity ? resolveVersion(entity.versions, anchor).name : ''
}

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

/*
  Function to traverse the administrative level hierarchy from an arbitrary / leaf point, returning ids.
*/
export function getAdminLevelHierarchy(
  administrativeAreaId: string | undefined | null,
  administrativeAreas: Map<UUID, ClientAdministrativeArea>,
  adminStructure: string[],
  outputMode?: 'withIds'
): Partial<Record<string, string>>
/*
  Same traversal, but returning each level's name as resolved at `anchor`.
  A separate overload (rather than an optional param) so a `withNames` call
  cannot compile without stating its anchor.
*/
export function getAdminLevelHierarchy(
  administrativeAreaId: string | undefined | null,
  administrativeAreas: Map<UUID, ClientAdministrativeArea>,
  adminStructure: string[],
  outputMode: 'withNames',
  anchor: PlainDate
): Partial<Record<string, string>>
export function getAdminLevelHierarchy(
  administrativeAreaId: string | undefined | null,
  administrativeAreas: Map<UUID, ClientAdministrativeArea>,
  adminStructure: string[],
  outputMode: 'withIds' | 'withNames' = 'withIds',
  anchor?: PlainDate
): Partial<Record<string, string>> {
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
        ? resolveVersion(collectedLocations[i].versions, anchor as PlainDate)
            .name
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
