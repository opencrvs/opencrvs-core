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
import * as Hapi from '@hapi/hapi'
import { logger } from '@search/logger'
import { badRequest, internal } from '@hapi/boom'
import { DEFAULT_SIZE, advancedSearch } from '@search/features/search/service'
import { ISearchCriteria } from '@search/features/search/types'
import { client } from '@search/elasticsearch/client'
import {
  ICompositionBody,
  EVENT,
  IBirthCompositionBody,
  IDeathCompositionBody,
  findDuplicateIds
} from '@search/elasticsearch/utils'
import { searchByCompositionId } from '@search/elasticsearch/dbhelper'
import { capitalize } from '@search/features/search/utils'
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { getTokenPayload } from '@search/utils/authUtils'
import { RouteScope } from '@search/config/routes'
import {
  searchForDeathDuplicates,
  searchForBirthDuplicates
} from '@search/features/registration/deduplicate/service'

type IAssignmentPayload = {
  compositionId: string
}

export async function searchAssignment(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IAssignmentPayload
  try {
    const results = await searchByCompositionId(payload.compositionId, client)

    const result = results?.body?.hits?.hits[0]?._source as
      | ICompositionBody
      | undefined
    return h.response({ userId: result?.assignment?.userId }).code(200)
  } catch (error) {
    logger.error(`Search/searchAssginment: ${error}`)
    return internal(error)
  }
}

export async function getAllDocumentsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    // Before retrieving all documents, we need to check the total count to make sure that the query will no tbe too large
    // By performing the search, requesting only the first 10 in DEFAULT_SIZE we can get the total count
    const allDocumentsCountCheck = await client.search(
      {
        index: OPENCRVS_INDEX_NAME,
        body: {
          query: { match_all: {} },
          sort: [{ dateOfDeclaration: 'asc' }],
          size: DEFAULT_SIZE
        }
      },
      {
        ignore: [404]
      }
    )
    const count: number = allDocumentsCountCheck.body.hits.total.value
    if (count > 5000) {
      return internal(
        'Elastic contains over 5000 results.  It is risky to return all without pagination.'
      )
    }
    // If total count is less than 5000, then proceed.
    const allDocuments = await client.search(
      {
        index: OPENCRVS_INDEX_NAME,
        body: {
          query: { match_all: {} },
          sort: [{ dateOfDeclaration: 'asc' }],
          size: count
        }
      },
      {
        ignore: [404]
      }
    )
    return h.response(allDocuments).code(200)
  } catch (err) {
    return internal(err)
  }
}

interface ICountQueryParam {
  declarationJurisdictionId: string
  status: string[]
  event?: string
}

export async function getStatusWiseRegistrationCountHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const payload = request.payload as ICountQueryParam
    const matchRules: Record<string, any>[] = [
      {
        match: {
          event: capitalize(payload.event || EVENT.BIRTH)
        }
      },
      {
        terms: {
          'type.keyword': payload.status
        }
      }
    ]
    if (payload.declarationJurisdictionId) {
      matchRules.push({
        match: {
          declarationJurisdictionIds: payload.declarationJurisdictionId
        }
      })
    }

    const response = await client.search<{
      aggregations?: {
        statusCounts: {
          buckets: Array<{
            key: string
            doc_count: number
          }>
        }
      }
    }>({
      body: {
        size: 0,
        query: {
          bool: {
            must: matchRules
          }
        },
        aggs: {
          statusCounts: {
            terms: {
              field: 'type.keyword'
            }
          }
        }
      }
    })

    if (!response.body.aggregations) {
      return payload.status.map((status) => ({
        status,
        count: 0
      }))
    }

    const countResult = response.body.aggregations.statusCounts.buckets.map(
      ({ key, doc_count }) => ({ status: key, count: doc_count })
    )

    const data = payload.status.map((status) => ({
      status,
      count: countResult.find(({ status: s }) => s === status)?.count || 0
    }))

    return h.response(data).code(200)
  } catch (err) {
    return internal(err)
  }
}

export async function advancedRecordSearch(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    let isExternalSearch = false
    const tokenPayload = getTokenPayload(request.headers.authorization)
    if (tokenPayload.scope.includes(RouteScope.RECORD_SEARCH)) {
      isExternalSearch = true
    }
    const result = await advancedSearch(
      isExternalSearch,
      request.payload as ISearchCriteria
    )
    if (!result) {
      return h.response({}).code(404)
    }

    return h.response(result).code(200)
  } catch (err) {
    logger.error(`Search/searchDeclarationHandler: error: ${err}`)
    return badRequest(err.message)
  }
}

export async function searchForBirthDeDuplication(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const result = await searchForBirthDuplicates(
      request.payload as IBirthCompositionBody,
      client
    )
    const duplicateIds = findDuplicateIds(result)
    return h.response(duplicateIds).code(200)
  } catch (error) {
    logger.error(`Search/searchForDuplicates: error: ${error}`)
    return internal(error)
  }
}

export async function searchForDeathDeDuplication(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const result = await searchForDeathDuplicates(
      request.payload as IDeathCompositionBody,
      client
    )
    const duplicateIds = findDuplicateIds(result)
    return h.response(duplicateIds).code(200)
  } catch (err) {
    logger.error(`Search for death duplications : error : ${err}`)
    return internal(err)
  }
}
