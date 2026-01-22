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
  FieldValue,
  FieldType,
  FieldConfigDefaultValue,
  isTemplateVariable,
  mapFieldTypeToZod,
  isFieldValueWithoutTemplates,
  compositeFieldTypes,
  SystemVariables,
  Scope,
  ActionScopes,
  ConfigurableActionScopes,
  parseConfigurableScope,
  WorkqueueConfigWithoutQuery,
  joinValues,
  UUID,
  SystemRole,
  Location,
  UserOrSystem,
  InteractiveFieldType,
  FieldConfig,
  TextField,
  AddressType,
  DefaultAddressFieldValue,
  AdministrativeArea
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

function isTextField(field: FieldConfig): field is TextField {
  return field.type === FieldType.TEXT
}

/**
 *
 * @param defaultValue: Configured default value from the country configuration for address field.
 * @param systemVariables: systemVariables fields such as '$user', '$event', and others.
 *
 * @returns Resolves administrativeArea reference in the default value
 */
export function handleDefaultValueForAddressField({
  defaultValue,
  systemVariables
}: {
  defaultValue?: DefaultAddressFieldValue
  systemVariables: SystemVariables
}) {
  if (!defaultValue) {
    return defaultValue
  }

  const { administrativeArea } = defaultValue

  // Check if administrativeArea is a dynamic reference to user's primary office
  const isDynamicReference =
    administrativeArea &&
    typeof administrativeArea === 'object' &&
    administrativeArea.$userField === 'primaryOfficeId' &&
    typeof administrativeArea.$location === 'string'

  if (isDynamicReference) {
    const locationKey =
      administrativeArea.$location as keyof typeof systemVariables.$user
    // Resolve administrativeArea from systemVariables.$user where
    // locationKey field (ex: 'district') is pre-populated from
    // user's primary office (see useCurrentUser hook)
    if (locationKey in systemVariables.$user) {
      return {
        ...defaultValue,
        administrativeArea: systemVariables.$user[locationKey]
      }
    }
  }

  return defaultValue
}

/**
 *
 * @param fieldType: The type of the field.
 * @param currentValue: The current value of the field.
 * @param defaultValue: Configured default value from the country configuration.
 * @param meta: Metadata fields such as '$user', '$event', and others.
 *
 * @returns Resolves template variables in the default value and returns the resolved value.
 */
export function replacePlaceholders({
  field,
  currentValue,
  defaultValue,
  systemVariables
}: {
  field: InteractiveFieldType
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
    const validator = mapFieldTypeToZod(field)

    const parsedValue = validator.safeParse(resolvedValue)

    if (parsedValue.success) {
      return parsedValue.data as FieldValue
    }

    throw new Error(`Could not resolve ${defaultValue}: ${parsedValue.error}`)
  }

  if (
    compositeFieldTypes.some((ft) => ft === field.type) &&
    typeof defaultValue === 'object'
  ) {
    /**
     * defaultValue is typically an ADDRESS, FILE, or FILE_WITH_OPTIONS.
     * Some STRING values within the defaultValue object may contain template variables (prefixed with $).
     */
    const result = { ...defaultValue }

    // @TODO: This resolves template variables in the first level of the object. In the future, we might need to extend it to arbitrary depth.
    for (const [key, val] of Object.entries(result)) {
      if (isTemplateVariable(val) && isTextField(field)) {
        const resolvedValue = get(systemVariables, val)
        // For now, we only support resolving template variables for text fields.
        const validator = mapFieldTypeToZod(field)
        const parsedValue = validator.safeParse(resolvedValue)
        if (parsedValue.success && parsedValue.data) {
          result[key] = resolvedValue
        } else {
          throw new Error(`Could not resolve ${key}: ${parsedValue.error}`)
        }
      }
    }

    const resultValidator = mapFieldTypeToZod(field)
    const parsedResult = resultValidator.safeParse(result)
    if (parsedResult.success) {
      return result as FieldValue
    }
    throw new Error(
      `Could not resolve ${field.type}: ${JSON.stringify(
        defaultValue
      )}. Error: ${parsedResult.error}`
    )
  }
  throw new Error(
    `Could not resolve ${field.type}: ${JSON.stringify(defaultValue)}`
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
  const hasLiteralActionScopes = scopes.some(
    (scope) => ActionScopes.safeParse(scope).success
  )
  const parsedScopes = scopes.map(parseConfigurableScope)
  const hasConfigurableActionScopes = parsedScopes.some(
    (scope) => ConfigurableActionScopes.safeParse(scope).success
  )
  return hasLiteralActionScopes || hasConfigurableActionScopes
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
    defaultMessage: 'Drafts',
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
