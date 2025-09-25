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
import { uniq, isString, get, uniqBy, mergeWith } from 'lodash'
import { v4 as uuid } from 'uuid'
import {
  User,
  ActionDocument,
  EventConfig,
  EventIndex,
  FieldValue,
  FieldType,
  FieldConfigDefaultValue,
  isTemplateVariable,
  mapFieldTypeToZod,
  isFieldValueWithoutTemplates,
  compositeFieldTypes,
  getDeclarationFields,
  SystemVariables,
  Scope,
  ActionScopes,
  WorkqueueConfigWithoutQuery,
  joinValues,
  UUID,
  SystemRole,
  Location,
  UserOrSystem
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

export const getAllUniqueFields = (eventConfig: EventConfig) => {
  return uniqBy(getDeclarationFields(eventConfig), (field) => field.id)
}

export function flattenEventIndex(event: EventIndex) {
  const { declaration, trackingId, status, ...rest } = event
  return {
    ...rest,
    ...declaration,
    'event.trackingId': trackingId,
    'event.status': status,
    'event.registrationNumber':
      rest.legalStatuses.REGISTERED?.registrationNumber,
    'event.registeredAt': rest.legalStatuses.REGISTERED?.createdAtLocation,
    'event.registeredBy': rest.legalStatuses.REGISTERED?.createdBy
  }
}

export type RequireKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export function isTemporaryId(id: string) {
  return id.startsWith('tmp-')
}

export function createTemporaryId() {
  return `tmp-${uuid()}` as UUID
}

/**
 *
 * @param fieldType: The type of the field.
 * @param currentValue: The current value of the field.
 * @param defaultValue: Configured default value from the country configuration.
 * @param meta: Metadata fields such as '$user', '$event', and others.
 *
 * @returns Resolves template variables in the default value and returns the resolved value.
 *
 */
export function replacePlaceholders({
  fieldType,
  currentValue,
  defaultValue,
  systemVariables
}: {
  fieldType: FieldType
  currentValue?: FieldValue
  defaultValue?: FieldConfigDefaultValue
  systemVariables: SystemVariables
}): FieldValue | undefined {
  if (currentValue) {
    return currentValue
  }

  if (!defaultValue) {
    return undefined
  }

  if (isFieldValueWithoutTemplates(defaultValue)) {
    return defaultValue
  }

  if (isTemplateVariable(defaultValue)) {
    const resolvedValue = get(systemVariables, defaultValue)
    const validator = mapFieldTypeToZod(fieldType)

    const parsedValue = validator.safeParse(resolvedValue)

    if (parsedValue.success) {
      return parsedValue.data as FieldValue
    }

    throw new Error(`Could not resolve ${defaultValue}: ${parsedValue.error}`)
  }

  if (
    compositeFieldTypes.some((ft) => ft === fieldType) &&
    typeof defaultValue === 'object'
  ) {
    /**
     * defaultValue is typically an ADDRESS, FILE, or FILE_WITH_OPTIONS.
     * Some STRING values within the defaultValue object may contain template variables (prefixed with $).
     */
    const result = { ...defaultValue }

    // @TODO: This resolves template variables in the first level of the object. In the future, we might need to extend it to arbitrary depth.
    for (const [key, val] of Object.entries(result)) {
      if (isTemplateVariable(val)) {
        const resolvedValue = get(systemVariables, val)
        // For now, we only support resolving template variables for text fields.
        const validator = mapFieldTypeToZod(FieldType.TEXT)
        const parsedValue = validator.safeParse(resolvedValue)
        if (parsedValue.success && parsedValue.data) {
          result[key] = resolvedValue
        } else {
          throw new Error(`Could not resolve ${key}: ${parsedValue.error}`)
        }
      }
    }

    const resultValidator = mapFieldTypeToZod(fieldType)
    const parsedResult = resultValidator.safeParse(result)
    if (parsedResult.success) {
      return result as FieldValue
    }
    throw new Error(
      `Could not resolve ${fieldType}: ${JSON.stringify(
        defaultValue
      )}. Error: ${parsedResult.error}`
    )
  }
  throw new Error(
    `Could not resolve ${fieldType}: ${JSON.stringify(defaultValue)}`
  )
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
