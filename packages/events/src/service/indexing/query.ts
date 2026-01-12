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
import { type estypes } from '@elastic/elasticsearch'
import {
  EventConfig,
  FieldType,
  getAllUniqueFields,
  FieldConfig,
  QueryExpression,
  QueryType,
  DateCondition,
  QueryInputType,
  SearchScopeAccessLevels,
  timePeriodToDateRange
} from '@opencrvs/commons/events'
import { getOrThrow, ResolvedRecordScopeV2 } from '@opencrvs/commons'
import {
  encodeFieldId,
  generateQueryForAddressField,
  nameQueryKey
} from './utils'

/** Convert API date clause format to elastic syntax */
function dateClauseToElasticQuery(
  clause: DateCondition,
  propertyName: string
): estypes.QueryDslQueryContainer {
  if (clause.type === 'exact') {
    return { term: { [propertyName]: clause.term } }
  } else if (clause.type === 'range') {
    // @todo supply timezone from here
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, ...rest } = clause
    return {
      range: {
        [propertyName]: {
          time_zone: 'Asia/Dhaka',
          ...rest
        }
      }
    }
  } else {
    const { startDate, endDate } = timePeriodToDateRange(clause.term)
    return {
      range: {
        [propertyName]: {
          gte: startDate,
          lte: endDate
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
  const allEventFields = eventConfigs.reduce<FieldConfig[]>(
    (acc, eventConfig) => {
      const fields = getAllUniqueFields(eventConfig)
      return acc.concat(fields)
    },
    []
  )

  const must = Object.entries(event).map(([fieldId, search]) => {
    const esFieldName = `declaration.${encodeFieldId(fieldId)}`
    const field = getOrThrow(
      allEventFields.find((f) => f.id === fieldId),
      `Tried to search with a field id ${fieldId} but it is not found in event configuration`
    )

    if (field.type === FieldType.ADDRESS) {
      return generateQueryForAddressField(fieldId, search)
    }

    if (field.type === FieldType.NAME) {
      if (search.type === 'fuzzy') {
        return {
          match: {
            [nameQueryKey(esFieldName)]: {
              query: search.term,
              fuzziness: 'AUTO'
            }
          }
        }
      }
      return {
        match: {
          [nameQueryKey(esFieldName)]: search.term
        }
      }
    }

    if (search.type === 'exact') {
      return {
        match: {
          [esFieldName]: search.term
        }
      }
    }

    if (search.type === 'fuzzy') {
      return {
        match: {
          [esFieldName]: {
            query: search.term,
            fuzziness: 'AUTO'
          }
        }
      }
    }

    if (search.type === 'anyOf') {
      return {
        terms: {
          [esFieldName]: search.terms
        }
      }
    }

    if (search.type === 'range') {
      return {
        range: {
          [esFieldName]: {
            gte: search.gte,
            lte: search.lte
          }
        }
      }
    }

    throw new Error(`Unsupported query type: ${search.type}`)
  })

  return {
    bool: { must, should: undefined }
  } satisfies estypes.QueryDslQueryContainer
}

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
      case 'createdByUserType':
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
      case 'legalStatuses.DECLARED.createdAtLocation':
      case 'legalStatuses.REGISTERED.createdAtLocation': {
        must.push({ term: { [key]: clause[key].location } })
        break
      }

      case 'data': {
        // @todo: The type for this comes out as "any"
        const value = clause[key]
        const dataQuery = generateQuery(value as QueryInputType, eventConfigs)
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
        break
      }
      default:
        throw new Error(`Unsupported query field: ${key}`)
    }
  }

  return must
}

async function buildClauseOrQuery(
  clause: QueryExpression | QueryType,
  eventConfigs: EventConfig[]
): Promise<estypes.QueryDslQueryContainer> {
  // Check if query is nested
  if ('clauses' in clause) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return buildElasticQueryFromSearchPayload(clause, eventConfigs)
  } else {
    const must = buildClause(clause, eventConfigs)
    return {
      bool: {
        must,
        should: undefined
      }
    }
  }
}

export async function buildElasticQueryFromSearchPayload(
  input: QueryType,
  eventConfigs: EventConfig[]
): Promise<estypes.QueryDslQueryContainer> {
  switch (input.type) {
    case 'and': {
      const mustResults = await Promise.all(
        input.clauses.map(async (clause: QueryExpression | QueryType) =>
          buildClauseOrQuery(clause, eventConfigs)
        )
      )

      return {
        bool: {
          must: mustResults,
          // Explicitly setting `should` to `undefined` to satisfy QueryDslBoolQuery type requirements
          // when no `should` clauses are provided.
          should: undefined
        }
      }
    }
    case 'or': {
      const shouldResults = await Promise.all(
        input.clauses.map(async (clause: QueryExpression | QueryType) =>
          buildClauseOrQuery(clause, eventConfigs)
        )
      )

      return {
        bool: {
          should: shouldResults,
          minimum_should_match: 1
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

/**
 * Adds jurisdiction filters to the query based on user office ID and options.
 * @param query The original query to modify.
 * @param options The options indicating which event jurisdictions to include.
 * @param userOfficeId The ID of the user's office.
 * @returns The modified query with jurisdiction filters.
 */
export function withJurisdictionFilters({
  query,
  options,
  userOfficeId,
  scopesV2
}: {
  query: estypes.QueryDslQueryContainer
  options?: Record<string, SearchScopeAccessLevels>
  userOfficeId: string | undefined
  scopesV2?: ResolvedRecordScopeV2[]
}): estypes.QueryDslQueryContainer {
  // Scopes v2 take precedence over v1 options
  if (scopesV2) {
    const scopeQueries = scopesV2
      .map((scope) => {
        const must: estypes.QueryDslQueryContainer[] = []

        for (const [filterProperty, value] of Object.entries(scope.options)) {
          if (!value) {
            continue
          }

          switch (filterProperty) {
            case 'event':
              must.push({
                terms: {
                  // @TODO: Clarify why V1 had 1-tuple.
                  type: Array.isArray(value) ? value : [value]
                }
              })
              break

            case 'eventLocation':
              // @TODO: Once event location specification is completed, update to include the configurable place of event.
              must.push({
                term: { createdAtLocation: value }
              })
              break
            case 'declaredIn':
              must.push({
                term: {
                  'legalStatuses.DECLARED.createdAtLocation': value
                }
              })
              break

            case 'registeredIn':
              must.push({
                term: {
                  'legalStatuses.REGISTERED.createdAtLocation': value
                }
              })
              break

            case 'declaredBy':
              must.push({
                term: { 'legalStatuses.DECLARED.createdBy': value }
              })
              break

            case 'registeredBy':
              must.push({
                term: {
                  'legalStatuses.REGISTERED.createdBy': value
                }
              })
              break

            default:
              throw new Error(`Unsupported filter property: ${filterProperty}`)
          }
        }

        // If this scope had no active filters, ignore it
        if (!must.length) {
          return null
        }

        return {
          bool: {
            must
          }
        }
      })
      .filter((q) => q !== null)

    if (!scopeQueries.length) {
      return {
        bool: {
          must: [query],
          should: undefined
        }
      }
    }

    return {
      bool: {
        must: [query],
        filter: {
          bool: {
            should: scopeQueries,
            minimum_should_match: 1
          }
        }
      }
    } as estypes.QueryDslQueryContainer
  }

  // This is transient check that will be removed once we have replaced all v1 scopes with v2.
  if (!options) {
    throw new Error('Either options or scopesV2 must be provided for filtering')
  }

  const filteredQueries = Object.entries(options).map(
    ([eventType, accessLevel]) => {
      const must: estypes.QueryDslQueryContainer[] = [
        { term: { type: eventType } }
      ]

      if (
        accessLevel === SearchScopeAccessLevels.MY_JURISDICTION &&
        userOfficeId
      ) {
        must.push({ term: { updatedAtLocation: userOfficeId } })
      }

      return {
        bool: {
          must,
          should: undefined
        }
      }
    }
  )

  if (filteredQueries.length === 0) {
    throw new Error('Proper scope access levels are required for filtering')
  }

  return {
    bool: {
      must: [query],
      should: undefined,
      filter: {
        bool: {
          should: filteredQueries,
          minimum_should_match: 1
        }
      }
    }
  }
}
