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
  ageToDate,
  AgeValue,
  DateValue,
  EventConfig,
  EventIndex,
  EventState,
  FieldValue,
  getDeclarationFieldById,
  isAgeFieldType,
  isNameFieldType,
  NameFieldValue,
  QueryInputType
} from '@opencrvs/commons/events'

export type EncodedEventIndex = EventIndex
export const FIELD_ID_SEPARATOR = '____'
export const NAME_QUERY_KEY = '__fullname'
export const AGE_DOB_QUERY_KEY = '__derived_dob'

export function encodeFieldId(fieldId: string) {
  return fieldId.replaceAll('.', FIELD_ID_SEPARATOR)
}

function decodeFieldId(fieldId: string) {
  return fieldId.replaceAll(FIELD_ID_SEPARATOR, '.')
}

export type IndexedNameFieldValue = NameFieldValue & {
  [NAME_QUERY_KEY]?: string
}

export type IndexedAgeFieldValue = AgeValue & {
  [AGE_DOB_QUERY_KEY]?: string
}

function addIndexFieldsToValue(
  eventConfig: EventConfig,
  fieldId: string,
  value: FieldValue,
  declaration: EventState
) {
  const field = { config: getDeclarationFieldById(eventConfig, fieldId), value }

  if (isNameFieldType(field)) {
    return {
      ...field.value,
      [NAME_QUERY_KEY]: Object.values(field.value).join(' ')
    } satisfies IndexedNameFieldValue
  }
  if (isAgeFieldType(field) && field.value) {
    const maybeAsOfDate = DateValue.safeParse(
      declaration[field.value.asOfDateRef]
    )
    if (maybeAsOfDate.success) {
      return {
        ...field.value,
        [AGE_DOB_QUERY_KEY]: ageToDate(field.value.age, maybeAsOfDate.data)
      } satisfies IndexedAgeFieldValue
    }
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
        [encodeFieldId(key)]: addIndexFieldsToValue(
          eventConfig,
          key,
          value,
          event.declaration
        )
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

function isIndexedAgeFieldValue(
  value: FieldValue
): value is IndexedAgeFieldValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    AGE_DOB_QUERY_KEY in value &&
    typeof value[AGE_DOB_QUERY_KEY] === 'string'
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
  if (isIndexedAgeFieldValue(field.value)) {
    return _.omit(field.value, [AGE_DOB_QUERY_KEY])
  }

  return value
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

export function ageQueryKey(fieldName: string) {
  return `${fieldName}.${AGE_DOB_QUERY_KEY}`
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
