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
import _ from 'lodash'
import { estypes } from '@elastic/elasticsearch'
import {
  AddressFieldValue,
  AddressType,
  EventConfig,
  EventIndex,
  FieldType,
  FieldValue,
  getDeclarationFieldById,
  isNameFieldType,
  NameFieldValue,
  QueryInputType,
  UUID
} from '@opencrvs/commons/events'
import { getLocationHierarchyRaw } from '@events/storage/postgres/events/locations'

export type EncodedEventIndex = EventIndex
export const FIELD_ID_SEPARATOR = '____'
export const NAME_QUERY_KEY = '__fullname'

export function encodeFieldId(fieldId: string) {
  return fieldId.replaceAll('.', FIELD_ID_SEPARATOR)
}

function decodeFieldId(fieldId: string) {
  return fieldId.replaceAll(FIELD_ID_SEPARATOR, '.')
}

type IndexedNameFieldValue = NameFieldValue & {
  [NAME_QUERY_KEY]?: string
}

function addIndexFieldsToValue(
  eventConfig: EventConfig,
  fieldId: string,
  value: FieldValue
) {
  const field = { config: getDeclarationFieldById(eventConfig, fieldId), value }

  if (isNameFieldType(field)) {
    return {
      ...field.value,
      [NAME_QUERY_KEY]: Object.values(field.value).join(' ')
    } satisfies IndexedNameFieldValue
  }

  return value
}

export function encodeEventIndex(
  event: EventIndex,
  eventConfig: EventConfig
): EncodedEventIndex {
  return {
    ...event,
    declaration: Object.entries(event.declaration).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [encodeFieldId(key)]: addIndexFieldsToValue(eventConfig, key, value)
      }),
      {}
    )
  }
}

function isIndexedNameFieldValue(
  value: FieldValue
): value is IndexedNameFieldValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    NAME_QUERY_KEY in value &&
    typeof value[NAME_QUERY_KEY] === 'string'
  )
}

function stripIndexFieldsFromValue(
  eventConfig: EventConfig,
  fieldId: string,
  value: FieldValue
) {
  const field = { config: getDeclarationFieldById(eventConfig, fieldId), value }

  if (isIndexedNameFieldValue(field.value)) {
    return _.omit(field.value, [NAME_QUERY_KEY])
  }

  return value
}

const LocationFieldTypes: FieldType[] = [
  FieldType.ADDRESS,
  FieldType.LOCATION,
  FieldType.ADMINISTRATIVE_AREA,
  FieldType.FACILITY,
  FieldType.OFFICE
]

export function getEventIndexWithoutLocationHierarchy(
  eventConfig: EventConfig,
  event: EventIndex
) {
  const takeLast = (v: unknown) => (Array.isArray(v) ? v[v.length - 1] : v)

  // Normalize top-level locations
  event.createdAtLocation = takeLast(event.createdAtLocation)
  event.updatedAtLocation = takeLast(event.updatedAtLocation)

  if (event.legalStatuses.DECLARED) {
    event.legalStatuses.DECLARED.createdAtLocation = takeLast(
      event.legalStatuses.DECLARED.createdAtLocation
    )
  }

  if (event.legalStatuses.REGISTERED) {
    event.legalStatuses.REGISTERED.createdAtLocation = takeLast(
      event.legalStatuses.REGISTERED.createdAtLocation
    )
  }

  const fieldConfigs = Object.fromEntries(
    eventConfig.declaration.pages.flatMap((p) => p.fields).map((f) => [f.id, f])
  )

  // Process declaration fields
  for (const [key, value] of Object.entries(event.declaration)) {
    const fieldConfig = fieldConfigs[key]
    if (!LocationFieldTypes.includes(fieldConfig.type)) {
      continue
    }

    if (fieldConfig.type === FieldType.ADDRESS) {
      const address = value as AddressFieldValue
      if (address.addressType === AddressType.DOMESTIC) {
        address.administrativeArea = takeLast(address.administrativeArea)
        event.declaration[key] = address
        continue
      }
    }

    // All other types just take the last value
    event.declaration[key] = takeLast(value)
  }

  return event
}

const locationHierarchyCache = new Map<string, string[]>()
export async function getEventIndexWithLocationHierarchy(
  eventConfig: EventConfig,
  event: EventIndex
) {
  const buildFullLocationHierarchy = async (
    locationId?: UUID | null | string
  ): Promise<string[]> => {
    if (!locationId) {
      return []
    }
    if (locationHierarchyCache.has(locationId)) {
      return locationHierarchyCache.get(locationId) || [locationId]
    }
    const hierarchyRows = await getLocationHierarchyRaw(locationId)
    locationHierarchyCache.set(
      locationId,
      hierarchyRows.map((row) => row.id)
    )
    return locationHierarchyCache.get(locationId) || [locationId]
  }
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const tempEvent = { ...event, declaration: { ...event.declaration } } as any
  // Normalize top-level locations
  tempEvent.createdAtLocation = await buildFullLocationHierarchy(
    event.createdAtLocation
  )
  tempEvent.updatedAtLocation = await buildFullLocationHierarchy(
    event.updatedAtLocation
  )

  if (event.legalStatuses.DECLARED) {
    tempEvent.legalStatuses.DECLARED.createdAtLocation =
      await buildFullLocationHierarchy(
        event.legalStatuses.DECLARED.createdAtLocation
      )
  }

  if (event.legalStatuses.REGISTERED) {
    tempEvent.legalStatuses.REGISTERED.createdAtLocation =
      await buildFullLocationHierarchy(
        event.legalStatuses.REGISTERED.createdAtLocation
      )
  }

  const fieldConfigs = Object.fromEntries(
    eventConfig.declaration.pages.flatMap((p) => p.fields).map((f) => [f.id, f])
  )

  // Process declaration fields
  for (const [k, value] of Object.entries(event.declaration)) {
    const key = decodeFieldId(k)
    const fieldConfig = fieldConfigs[key]
    if (!LocationFieldTypes.includes(fieldConfig.type)) {
      continue
    }

    if (fieldConfig.type === FieldType.ADDRESS) {
      const parsed = AddressFieldValue.safeParse(value)
      if (parsed.success && parsed.data.addressType === AddressType.DOMESTIC) {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const address: Record<string, any> = parsed.data
        address.administrativeArea = await buildFullLocationHierarchy(
          address.administrativeArea
        )
        tempEvent.declaration[k] = address
        continue
      }
    }

    // All other location types are assigned to location hierarchy
    const uuid = UUID.safeParse(value)

    if (uuid.success) {
      tempEvent.declaration[k] = await buildFullLocationHierarchy(uuid.data)
    }
  }

  return tempEvent
}

export function decodeEventIndex(
  eventConfig: EventConfig,
  event: EncodedEventIndex
): EventIndex {
  return {
    ...event,
    declaration: Object.entries(event.declaration).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [decodeFieldId(key)]: stripIndexFieldsFromValue(
          eventConfig,
          decodeFieldId(key),
          value
        )
      }),
      {}
    )
  }
}

export function removeSecuredFields(
  eventConfig: EventConfig,
  event: EventIndex
): EventIndex {
  return {
    ...event,
    declaration: Object.fromEntries(
      Object.entries(event.declaration).filter(
        ([fieldId]) =>
          getDeclarationFieldById(eventConfig, fieldId).secured !== true
      )
    )
  }
}

export function declarationReference(fieldName: string) {
  return `declaration.${fieldName}`
}

export function nameQueryKey(fieldName: string) {
  return `${fieldName}.${NAME_QUERY_KEY}`
}

export function generateQueryForAddressField(
  fieldId: string,
  search: QueryInputType
) {
  if (!(search.type === 'exact' || search.type === 'fuzzy')) {
    return { bool: { must: [] } }
  }

  const address = AddressFieldValue.safeParse(JSON.parse(search.term))
  if (address.error) {
    return { bool: { must: [] } }
  }

  const { country, addressType, streetLevelDetails } = address.data
  const mustMatches = []

  const declarationKey = declarationReference(encodeFieldId(fieldId))
  if (country) {
    mustMatches.push({
      term: { [`${declarationKey}.country`]: country }
    })
  }
  if (addressType === AddressType.DOMESTIC) {
    const administrativeArea = address.data.administrativeArea
    if (administrativeArea) {
      mustMatches.push({
        term: {
          [`${declarationKey}.administrativeArea`]: administrativeArea
        }
      })
    }
  }
  if (streetLevelDetails && Object.keys(streetLevelDetails).length) {
    Object.entries(streetLevelDetails).forEach(([key, value]) => {
      mustMatches.push({
        match: { [`${declarationKey}.streetLevelDetails.${key}`]: value }
      })
    })
  }
  return {
    bool: {
      must: mustMatches,
      should: undefined
    }
  } satisfies estypes.QueryDslQueryContainer
}
