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
  EventConfig,
  FieldType,
  getAllUniqueFields,
  Inferred,
  QueryExpression,
  QueryType,
  DateCondition,
  QueryInputType
} from '@opencrvs/commons/events'
import { encodeFieldId } from './utils'

/** Convert API date clause format to elastic syntax */
function dateClauseToElasticQuery(clause: DateCondition, propertyName: string) {
  if (clause.type === 'exact') {
    return { term: { [propertyName]: clause.term } }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { timezone, type, ...rest } = clause
    return {
      range: {
        [propertyName]: {
          ...rest,
          time_zone: timezone
        }
      }
    }
  }
}

/**
 * Generates an Elasticsearch query to search within `document.declaration`
 * using the provided search payload.
 */
function generateQuery(
  event: QueryInputType,
  eventConfigs: EventConfig[]
): estypes.QueryDslQueryContainer {
  const allEventFields = eventConfigs.reduce<Inferred[]>((acc, eventConfig) => {
    const fields = getAllUniqueFields(eventConfig)
    return acc.concat(fields)
  }, [])

  const nameFieldIds = allEventFields
    .filter((field) => field.type === FieldType.NAME)
    .map((f) => f.id)

  const must = Object.entries(event).map(([fieldId, search]) => {
    const field = `declaration.${encodeFieldId(fieldId)}`

    if (search.type === 'exact') {
      return {
        match: {
          [field]: search.term
        }
      }
    }

    if (search.type === 'fuzzy') {
      /**
       * If the current field is a NAME-type field (determined by checking its ID against known name field IDs),
       * return a match query on the `${field}.__fullname` subfield. This allows Elasticsearch to perform
       * a fuzzy search on the full name, improving matching for name-related fields (e.g., handling typos or variations).
       */
      if (nameFieldIds.includes(fieldId)) {
        return {
          match: {
            [`${field}.__fullname`]: {
              query: search.term,
              fuzziness: 'AUTO'
            }
          }
        }
      }

      return {
        match: {
          [field]: {
            query: search.term,
            fuzziness: 'AUTO'
          }
        }
      }
    }

    if (search.type === 'anyOf') {
      return {
        terms: {
          [field]: search.terms
        }
      }
    }

    if (search.type === 'range') {
      return {
        range: {
          [field]: {
            gte: search.gte,
            lte: search.lte
          }
        }
      }
    }

    throw new Error(`Unsupported query type: ${search.type}`)
  }) satisfies estypes.QueryDslQueryContainer[]

  return { bool: { must } } as estypes.QueryDslQueryContainer
}

const EXACT_SEARCH_LOCATION_DISTANCE = '10km'

function typedKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

function buildClause(clause: QueryExpression, eventConfigs: EventConfig[]) {
  const must: estypes.QueryDslQueryContainer[] = []

  for (const key of typedKeys(clause)) {
    if (!clause[key]) {
      continue
    }
    switch (key) {
      case 'id': {
        must.push({
          term: { id: clause.id }
        })
        break
      }

      case 'eventType': {
        const value = clause[key]
        must.push({ term: { type: value } })
        break
      }

      case 'status': {
        const value = clause[key]
        if (value.type === 'anyOf') {
          must.push({ terms: { status: value.terms } })
        } else {
          must.push({ term: { status: value.term } })
        }
        break
      }

      case 'trackingId':
      case 'assignedTo':
      case 'createdBy':
      case 'updatedBy':
      case 'legalStatuses.REGISTERED.registrationNumber': {
        const value = clause[key]
        must.push({ term: { [key]: value.term } })
        break
      }

      case 'createdAt':
      case 'updatedAt':
      case 'legalStatuses.REGISTERED.acceptedAt': {
        const value = clause[key]
        must.push(dateClauseToElasticQuery(value, key))
        break
      }

      case 'createdAtLocation':
      case 'updatedAtLocation':
      case 'legalStatuses.REGISTERED.createdAtLocation': {
        const value = clause[key]
        if (value.type === 'exact') {
          must.push({ term: { [key]: value.term } })
        } else {
          must.push({
            geo_distance: {
              distance: EXACT_SEARCH_LOCATION_DISTANCE,
              location: value.location
            }
          })
        }
        break
      }

      case 'data': {
        // @todo: The type for this comes out as "any"
        const value = clause[key]
        const dataQuery = generateQuery(value, eventConfigs)
        const innerMust = dataQuery.bool?.must
        if (Array.isArray(innerMust)) {
          must.push(...innerMust)
        } else if (innerMust) {
          must.push(innerMust)
        }
        break
      }

      case 'flags': {
        const value = clause[key]
        if (value.anyOf) {
          must.push({ terms: { flags: value.anyOf } })
        }
        if (value.noneOf) {
          must.push({
            bool: {
              must_not: {
                terms: { flags: value.noneOf }
              },
              should: undefined
            }
          })
        }
      }
      case 'createdByUserType':
      default:
        console.warn('Unsupported query field:', key)
        break
    }
  }

  return must
}

export function buildElasticQueryFromSearchPayload(
  input: QueryType,
  eventConfigs: EventConfig[]
): estypes.QueryDslQueryContainer {
  const must = input.clauses.flatMap((clause) =>
    buildClause(clause, eventConfigs)
  )
  switch (input.type) {
    case 'and': {
      return {
        bool: {
          must,
          // Explicitly setting `should` to `undefined` to satisfy QueryDslBoolQuery type requirements
          // when no `should` clauses are provided.
          should: undefined
        }
      }
    }
    case 'or': {
      const should = input.clauses.flatMap((clause) => ({
        bool: {
          must: buildClause(clause, eventConfigs),
          // Explicitly setting `should` to `undefined` to satisfy QueryDslBoolQuery type requirements
          // when no `should` clauses are provided.
          should: undefined
        }
      }))

      return {
        bool: {
          should
        }
      }
    }
    // default fallback (shouldn't happen if input is validated correctly)
    default:
      return {
        bool: { must_not: { match_all: {} }, should: undefined }
      }
  }
}
