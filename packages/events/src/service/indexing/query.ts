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
  SearchScopeAccessLevels
} from '@opencrvs/commons/events'
import {
  encodeFieldId,
  generateQueryForAddressField,
  getAlternateFieldMap
} from './utils'

/**
 * Generates an Elasticsearch query to search within `document.declaration`
 * using the provided search payload.
 */
function generateQuery(
  event: Record<
    string,
    | { type: 'exact' | 'fuzzy'; term: string }
    | { type: 'anyOf'; terms: string[] }
    | { type: 'range'; gte: string; lte: string }
  >,
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
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          alternateFieldMap[fieldId] &&
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

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

const EXACT_SEARCH_LOCATION_DISTANCE = '10km'

function buildClause(clause: QueryExpression, eventConfigs: EventConfig[]) {
  const must: estypes.QueryDslQueryContainer[] = []
  if (clause.id) {
    must.push({
      term: { id: clause.id }
    })
  }

  if (clause.eventType) {
    must.push({
      term: { type: clause.eventType }
    })
  }

  if (clause.status) {
    if (clause.status.type === 'anyOf') {
      must.push({ terms: { status: clause.status.terms } })
    } else {
      must.push({ term: { status: clause.status.term } })
    }
  }

  if (clause.trackingId) {
    must.push({
      term: { trackingId: clause.trackingId.term }
    })
  }

  if (clause.assignedTo) {
    must.push({
      term: { assignedTo: clause.assignedTo.term }
    })
  }

  if (clause.createdBy) {
    must.push({
      term: { createdBy: clause.createdBy.term }
    })
  }

  if (clause.createdByUserType) {
    must.push({
      term: { createdByUserType: clause.createdByUserType }
    })
  }

  if (clause.updatedBy) {
    must.push({
      term: { updatedBy: clause.updatedBy.term }
    })
  }

  if (clause['legalStatus.REGISTERED.createdAt']) {
    if (clause['legalStatus.REGISTERED.createdAt'].type === 'exact') {
      must.push({
        term: {
          'legalStatuses.REGISTERED.createdAt':
            clause['legalStatus.REGISTERED.createdAt'].term
        }
      })
    } else {
      must.push({
        range: {
          'legalStatuses.REGISTERED.createdAt': {
            gte: clause['legalStatus.REGISTERED.createdAt'].gte,
            lte: clause['legalStatus.REGISTERED.createdAt'].lte
          }
        }
      })
    }
  }
  if (clause['legalStatus.REGISTERED.createdAtLocation']) {
    if (clause['legalStatus.REGISTERED.createdAtLocation'].type === 'exact') {
      must.push({
        term: {
          'legalStatuses.REGISTERED.createdAtLocation':
            clause['legalStatus.REGISTERED.createdAtLocation'].term
        }
      })
    }
  }

  if (clause['legalStatus.REGISTERED.registrationNumber']) {
    must.push({
      term: {
        'legalStatuses.REGISTERED.registrationNumber':
          clause['legalStatus.REGISTERED.registrationNumber'].term
      }
    })
  }

  if (clause.createdAt) {
    if (clause.createdAt.type === 'exact') {
      must.push({ term: { createdAt: clause.createdAt.term } })
    } else {
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
    } else {
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

  if (clause.createdAtLocation) {
    if (clause.createdAtLocation.type === 'exact') {
      must.push({ term: { createdAtLocation: clause.createdAtLocation.term } })
    } else {
      must.push({
        geo_distance: {
          distance: EXACT_SEARCH_LOCATION_DISTANCE,
          location: clause.createdAtLocation.location
        }
      })
    }
  }

  if (clause.updatedAtLocation) {
    if (clause.updatedAtLocation.type === 'exact') {
      must.push({
        term: { updatedAtLocation: clause.updatedAtLocation.term }
      })
    } else {
      must.push({
        geo_distance: {
          distance: EXACT_SEARCH_LOCATION_DISTANCE,
          location: clause.updatedAtLocation.location
        }
      })
    }
  }

  if (clause.data) {
    const dataQuery = generateQuery(clause.data, eventConfigs)
    const innerMust = dataQuery.bool?.must

    if (Array.isArray(innerMust)) {
      must.push(...innerMust)
    } else if (innerMust) {
      must.push(innerMust)
    }
  }

  if (clause.flags) {
    if (clause.flags.anyOf) {
      must.push({ terms: { flags: clause.flags.anyOf } })
    }
    if (clause.flags.noneOf) {
      must.push({
        bool: {
          must_not: {
            terms: { flags: clause.flags.noneOf }
          },
          should: undefined
        }
      })
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
