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
import {
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

type BaseNameFieldValue = Exclude<NameFieldValue, undefined>
type AugmentedNameFieldValue = BaseNameFieldValue & {
  __fullname?: string
}

export const DEFAULT_SIZE = 10000

function augmentIndexedField(
  eventConfig: EventConfig,
  fieldId: string,
  value: FieldValue
) {
  const field = { config: getDeclarationFieldById(eventConfig, fieldId), value }

  if (isNameFieldType(field) && field.value) {
    return {
      ...field.value,
      __fullname: Object.values(field.value).join(' ')
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
        [encodeFieldId(key)]: augmentIndexedField(eventConfig, key, value)
      }),
      {}
    )
  }
}
function normaliseIndexedField(
  eventConfig: EventConfig,
  fieldId: string,
  value: FieldValue
) {
  const field = { config: getDeclarationFieldById(eventConfig, fieldId), value }
  if (isNameFieldType(field)) {
    if (!field.value) {
      return field.value
    }
    delete (field.value as AugmentedNameFieldValue).__fullname
    return field.value
  }
  return value
}

export function decodeEventIndex(
  eventConfigs: EventConfig[],
  event: EncodedEventIndex
): EventIndex {
  const eventConfig = eventConfigs.find((e) => e.id === event.type)
  if (!eventConfig) {
    throw new Error(`Missing event config for record with ID: ${event.id}`)
  }
  return {
    ...event,
    declaration: Object.entries(event.declaration).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [decodeFieldId(key)]: normaliseIndexedField(
          eventConfig,
          decodeFieldId(key),
          value
        )
      }),
      {}
    )
  }
}

export function declarationReference(fieldName: string) {
  return `declaration.${fieldName}`
}
