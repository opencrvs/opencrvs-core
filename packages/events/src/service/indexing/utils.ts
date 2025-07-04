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

export function encodeFieldId(fieldId: string) {
  return fieldId.replaceAll('.', FIELD_ID_SEPARATOR)
}

function decodeFieldId(fieldId: string) {
  return fieldId.replaceAll(FIELD_ID_SEPARATOR, '.')
}

type IndexedNameFieldValue = BaseNameFieldValue & {
  __fullname?: string
}

type BaseNameFieldValue = Exclude<NameFieldValue, undefined>

export const DEFAULT_SIZE = 10000

function addIndexFieldsToValue(
  eventConfig: EventConfig,
  fieldId: string,
  value: FieldValue
) {
  const field = { config: getDeclarationFieldById(eventConfig, fieldId), value }

  if (isNameFieldType(field)) {
    return {
      ...field.value,
      __fullname: Object.values(field.value).join(' ')
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
    '__fullname' in value &&
    typeof (value as IndexedNameFieldValue).__fullname === 'string'
  )
}

function stripIndexFieldsFromValue(
  eventConfig: EventConfig,
  fieldId: string,
  value: FieldValue
) {
  const field = { config: getDeclarationFieldById(eventConfig, fieldId), value }

  if (isIndexedNameFieldValue(field.value)) {
    return _.omit(field.value, ['__fullname'])
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

// Build map of fieldId -> alternateFieldIds[]
export function getAlternateFieldMap(
  eventConfigs: EventConfig[]
): Record<string, string[]> {
  const alternateFieldMap: Record<string, string[]> = {}
  eventConfigs.forEach((eventConfig) => {
    eventConfig.advancedSearch.forEach((section) => {
      section.fields.forEach((field) => {
        if (
          'alternateFieldIds' in field &&
          Array.isArray(field.alternateFieldIds) &&
          field.alternateFieldIds.length > 0
        ) {
          alternateFieldMap[field.fieldId] = field.alternateFieldIds
        }
      })
    })
  })
  return alternateFieldMap
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
    if (value.province) {
      mustMatches.push({
        match: { [`${fieldId}.province`]: value.province }
      })
    }
    if (value.district) {
      mustMatches.push({
        match: { [`${fieldId}.district`]: value.district }
      })
    }
  } else {
    if (value.state) {
      mustMatches.push({
        match: { [`${fieldId}.state`]: value.state }
      })
    }
    if (value.district2) {
      mustMatches.push({
        match: { [`${fieldId}.district2`]: value.district2 }
      })
    }
  }

  return {
    bool: {
      must: mustMatches
    }
  } as estypes.QueryDslQueryContainer
}
