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
import {
  EventSearchIndex,
  EventIndex,
  QueryType
} from '@opencrvs/commons/events'

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

export function buildElasticQueryFromSearchPayload(input: QueryType) {
  const buildClause = (clause: any) => {
    const must: any[] = []

    if (clause.status) {
      if (clause.status.type === 'anyOf') {
        must.push({ terms: { status: clause.status.terms } })
      } else if (clause.status.type === 'exact') {
        must.push({ term: { status: clause.status.term } })
      }
    }

    if (clause.createdAt) {
      if (clause.createdAt.type === 'exact') {
        must.push({ term: { createdAt: clause.createdAt.term } })
      } else if (clause.createdAt.type === 'range') {
        must.push({
          range: {
            createdAt: {
              gte: clause.createdAt.gte,
              lte: clause.createdAt.lte
            }
          }
        })
      }
    }

    if (clause.updatedAt) {
      if (clause.updatedAt.type === 'exact') {
        must.push({ term: { updatedAt: clause.updatedAt.term } })
      } else if (clause.updatedAt.type === 'range') {
        must.push({
          range: {
            updatedAt: {
              gte: clause.updatedAt.gte,
              lte: clause.updatedAt.lte
            }
          }
        })
      }
    }

    if (clause.createAtLocation) {
      if (clause.createAtLocation.type === 'exact') {
        must.push({ term: { createdAtLocation: clause.createAtLocation.term } })
      } else if (clause.createAtLocation.type === 'within') {
        must.push({
          geo_distance: {
            distance: '10km',
            location: clause.createAtLocation.location
          }
        })
      }
    }

    if (clause.updatedAtLocation) {
      if (clause.updatedAtLocation.type === 'exact') {
        must.push({
          term: { updatedAtLocation: clause.updatedAtLocation.term }
        })
      } else if (clause.updatedAtLocation.type === 'within') {
        must.push({
          geo_distance: {
            distance: '10km',
            location: clause.updatedAtLocation.location
          }
        })
      }
    }

    const exactFields = ['createdBy', 'updatedBy', 'trackingId']
    for (const field of exactFields) {
      const fieldValue = clause[field]
      if (fieldValue && fieldValue.type === 'exact') {
        must.push({ term: { [field]: fieldValue.term } })
      }
    }

    const simpleFields = ['eventType', 'searchType']
    for (const field of simpleFields) {
      if (clause[field]) {
        must.push({ match: { [field]: clause[field] } })
      }
    }

    if (clause.data) {
      const dataQuery = generateQuery(clause.data)
      if (dataQuery && 'bool' in dataQuery) {
        const innerMust = dataQuery.bool?.must
        if (Array.isArray(innerMust)) {
          must.push(...innerMust)
        } else if (innerMust) {
          must.push(innerMust)
        }
      }
    }

    return { bool: { must } }
  }

  if (input.type === 'and') {
    return buildClause(input)
  }

  if (input.type === 'or') {
    const should = input.clauses.map((clause) => buildClause(clause))
    return {
      bool: {
        should,
        minimum_should_match: 1
      }
    }
  }

  // default fallback (shouldn't happen if input is validated correctly)
  return { match_all: {} }
}
