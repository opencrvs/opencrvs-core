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
import { estypes } from '@elastic/elasticsearch'
import { EventSearchIndex, EventIndex } from '@opencrvs/commons/events'

export type EncodedEventIndex = EventIndex
export const FIELD_ID_SEPARATOR = '____'

export function encodeFieldId(fieldId: string) {
  return fieldId.replaceAll('.', FIELD_ID_SEPARATOR)
}

function decodeFieldId(fieldId: string) {
  return fieldId.replaceAll(FIELD_ID_SEPARATOR, '.')
}

export const DEFAULT_SIZE = 10

export function encodeEventIndex(event: EventIndex): EncodedEventIndex {
  return {
    ...event,
    declaration: Object.entries(event.declaration).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [encodeFieldId(key)]: value
      }),
      {}
    )
  }
}

export function decodeEventIndex(event: EncodedEventIndex): EventIndex {
  return {
    ...event,
    declaration: Object.entries(event.declaration).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [decodeFieldId(key)]: value
      }),
      {}
    )
  }
}

export function declarationReference(fieldName: string) {
  return `declaration.${fieldName}`
}

/**
 * Generates an Elasticsearch query to search within `document.declaration`
 * using the provided search payload.
 */
export function generateQuery(event: Omit<EventSearchIndex, 'type'>) {
  const must: estypes.QueryDslQueryContainer[] = Object.entries(event).map(
    ([key, value]) => ({
      match: {
        [declarationReference(encodeFieldId(key))]: value
      }
    })
  )

  return {
    bool: {
      must
    }
  } as estypes.SearchRequest['query']
}
