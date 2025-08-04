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
  AddressFieldValue,
  EventConfig,
  FieldType,
  getAllUniqueFields,
  Inferred,
  QueryExpression,
  QueryType,
  DateCondition,
  QueryInputType,
  SearchScopeAccessLevels,
  timePeriodToDateRange
} from '@opencrvs/commons/events'
import { getChildLocations } from '../locations/locations'
import {
  encodeFieldId,
  generateQueryForAddressField,
  getAlternateFieldMap
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
  const allEventFields = eventConfigs.reduce<Inferred[]>((acc, eventConfig) => {
    const fields = getAllUniqueFields(eventConfig)
    return acc.concat(fields)
  }, [])

  const nameFieldIds = allEventFields
    .filter((field) => field.type === FieldType.NAME)
    .map((f) => f.id)

  const addressFieldIds = allEventFields
    .filter((field) => field.type === FieldType.ADDRESS)
    .map((f) => f.id)

  const alternateFieldMap = getAlternateFieldMap(eventConfigs)

  const must = Object.entries(event)
    // Exclude fields from Search query that are meant to
    .filter(([fieldId]) => {
      const fieldSearchConfig = eventConfigs
        .flatMap((x) => x.advancedSearch)
        .flatMap((s) => s.fields)
        .find((f) => f.fieldId === fieldId)
      if (
        fieldSearchConfig?.fieldType === 'field' &&
        fieldSearchConfig.excludeInSearchQuery
      ) {
        return false
      }
      return true
    })
    .map(([fieldId, search]) => {
      const field = `declaration.${encodeFieldId(fieldId)}`

      if (search.type === 'exact') {
        const allIds = [fieldId, ...(alternateFieldMap[fieldId] ?? [])]

        if (
          fieldId in alternateFieldMap &&
          alternateFieldMap[fieldId].length > 0
        ) {
          const queries: estypes.QueryDslQueryContainer[] = allIds.map((id) => {
            if (addressFieldIds.includes(id)) {
              const parsed = AddressFieldValue.safeParse(
                JSON.parse(search.term)
              )
              if (parsed.success) {
                return generateQueryForAddressField(
                  `declaration.${encodeFieldId(id)}`,
                  parsed.data
                )
              }
            }

            // For non-address or failed parse, return simple match
            return {
              match: {
                [`declaration.${encodeFieldId(id)}`]: search.term
              }
            }
          })

          return {
            bool: { should: queries, minimum_should_match: 1 }
          }
        }

        // default exact match
        return {
          match: {
            [field]: search.term
          }
        }
      }

      // Step 3: Fuzzy
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
    })

  return {
    bool: { must, should: undefined }
  } satisfies estypes.QueryDslQueryContainer
}

function typedKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

async function buildClause(
  clause: QueryExpression,
  eventConfigs: EventConfig[]
) {
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
      case 'legalStatuses.REGISTERED.createdAtLocation': {
        const value = clause[key]

        if (value.type === 'exact') {
          must.push({ term: { [key]: value.term } })
        } else {
          const childLocations = await getChildLocations(value.location)
          const locationIds = [
            value.location,
            ...childLocations.map((location) => location.id)
          ]

          must.push({
            bool: {
              should: locationIds.map((id) => ({ term: { [key]: id } })),
              minimum_should_match: 1
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
        break
      }
      default:
        throw new Error(`Unsupported query field: ${key}`)
    }
  }

  return must
}

export async function buildElasticQueryFromSearchPayload(
  input: QueryType,
  eventConfigs: EventConfig[]
): Promise<estypes.QueryDslQueryContainer> {
  const mustResults = await Promise.all(
    input.clauses.map(async (clause) => buildClause(clause, eventConfigs))
  )

  const must = mustResults.flat()

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
      const should = await Promise.all(
        input.clauses.map(async (clause) => ({
          bool: {
            must: await buildClause(clause, eventConfigs),
            // Explicitly setting `should` to `undefined` to satisfy QueryDslBoolQuery type requirements
            // when no `should` clauses are provided.
            should: undefined
          }
        }))
      )

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

/**
 * Adds jurisdiction filters to the query based on user office ID and options.
 * @param query The original query to modify.
 * @param options The options indicating which event jurisdictions to include.
 * @param userOfficeId The ID of the user's office.
 * @returns The modified query with jurisdiction filters.
 */
export function withJurisdictionFilters(
  query: estypes.QueryDslQueryContainer,
  options: Record<string, SearchScopeAccessLevels>,
  userOfficeId: string | undefined
): estypes.QueryDslQueryContainer {
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
