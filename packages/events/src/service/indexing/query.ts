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
import { QueryExpression, QueryType } from '@opencrvs/commons/events'
import { encodeFieldId } from './utils'

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
  >
): estypes.QueryDslQueryContainer {
  const must = Object.entries(event).map(([key, value]) => {
    const field = `declaration.${encodeFieldId(key)}`

    if (value.type === 'exact') {
      return {
        match: {
          [field]: value.term
        }
      }
    }

    if (value.type === 'fuzzy') {
      return {
        fuzzy: {
          [field]: {
            value: value.term
          }
        }
      }
    }

    if (value.type === 'anyOf') {
      return {
        terms: {
          [field]: value.terms
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (value.type === 'range') {
      return {
        range: {
          [field]: {
            gte: value.gte,
            lte: value.lte
          }
        }
      }
    }

    throw new Error(`Unsupported query type: ${value.type}`)
  }) satisfies estypes.QueryDslQueryContainer[]

  return { bool: { must } } as estypes.QueryDslQueryContainer
}

function buildClause(clause: QueryExpression) {
  const must: estypes.QueryDslQueryContainer[] = []

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
          distance: '10km',
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
          distance: '10km',
          location: clause.updatedAtLocation.location
        }
      })
    }
  }

  if (clause.data) {
    const dataQuery = generateQuery(clause.data)
    const innerMust = dataQuery.bool?.must

    if (Array.isArray(innerMust)) {
      must.push(...innerMust)
    } else if (innerMust) {
      must.push(innerMust)
    }
  }

  return must
}

export function buildElasticQueryFromSearchPayload(
  input: QueryType
): estypes.QueryDslQueryContainer {
  const must = input.clauses.flatMap((clause) => buildClause(clause))
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
          must: buildClause(clause)
        }
      }))
      return {
        bool: {
          should
        }
      } as estypes.QueryDslQueryContainer
    }
    // default fallback (shouldn't happen if input is validated correctly)
    default:
      return {
        bool: { must_not: { match_all: {} }, should: undefined }
      }
  }
}
