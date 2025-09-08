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
  EventConfig,
  EventIndex,
  FieldValue,
  getDeclarationFieldById,
  isNameFieldType,
  NameFieldValue
} from '@opencrvs/commons/events'

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
  value: AddressFieldValue
) {
  const { country, addressType } = value
  const mustMatches = []

  if (country) {
    mustMatches.push({ match: { [`${fieldId}.country`]: country } })
  }
  if (addressType === 'DOMESTIC') {
    if (value.administrativeArea) {
      mustMatches.push({
        match: { [`${fieldId}.administrativeArea`]: value.administrativeArea }
      })
    }
  }

  return {
    bool: {
      must: mustMatches,
      should: undefined
    }
  } satisfies estypes.QueryDslQueryContainer
}
