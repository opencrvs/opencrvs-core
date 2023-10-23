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
import { ApiResponse } from '@elastic/elasticsearch'
import { getMetrics, postMetrics } from '@gateway/features/fhir/utils'
import { markRecordAsDownloadedBySystem } from '@gateway/features/registration/root-resolvers'
import {
  getSystem,
  getTokenPayload,
  hasScope,
  inScope
} from '@gateway/features/user/utils'
import { GQLResolver } from '@gateway/graphql/schema'
import { Options } from '@hapi/boom'
import { ISearchCriteria, postAdvancedSearch } from './utils'

// Complete definition of the Search response
interface IShardsResponse {
  total: number
  successful: number
  failed: number
  skipped: number
}

interface IExplanation {
  value: number
  description: string
  details: IExplanation[]
}

export interface ISearchResponse<T> {
  took: number
  timed_out: boolean
  _scroll_id?: string
  _shards: IShardsResponse
  hits: {
    total: { value: number; eq: string }
    max_score: number
    hits: Array<{
      _index: string
      _type: string
      _id: string
      _score: number
      _source: T
      _version?: number
      _explanation?: IExplanation
      fields?: any
      highlight?: any
      inner_hits?: any
      matched_queries?: string[]
      sort?: string[]
    }>
  }
  aggregations?: any
}

export const resolvers: GQLResolver = {
  Query: {
    async searchEvents(
      _,
      {
        userId,
        advancedSearchParameters,
        count,
        skip,
        sortColumn,
        sort = 'desc',
        sortBy
      },
      { headers: authHeader }
    ) {
      const searchCriteria: ISearchCriteria = {
        sort,
        parameters: advancedSearchParameters
      }
      // Only registrar, registration agent & field agent should be able to search user
      if (
        !inScope(authHeader, [
          'register',
          'validate',
          'certify',
          'declare',
          'recordsearch'
        ])
      ) {
        return await Promise.reject(
          new Error(
            'Advanced search is only allowed for registrar, registration agent & field agent'
          )
        )
      }

      const isExternalAPI = hasScope(authHeader, 'recordsearch')
      if (isExternalAPI) {
        const payload = getTokenPayload(authHeader.Authorization)
        const system = await getSystem({ systemId: payload.sub }, authHeader)

        const getTotalRequest = await getMetrics(
          '/advancedSearch',
          {},
          authHeader
        )
        if (getTotalRequest.total >= system.settings.dailyQuota) {
          return await Promise.reject(new Error('Daily search quota exceeded'))
        }

        const searchResult: ApiResponse<ISearchResponse<any>> =
          await postAdvancedSearch(authHeader, searchCriteria)

        if ((searchResult?.statusCode ?? 0) >= 400) {
          const errMsg = searchResult as Options<string>
          return await Promise.reject(new Error(errMsg.message))
        }

        ;(searchResult.body.hits.hits || []).forEach(async (hit) => {
          await markRecordAsDownloadedBySystem(hit._id, system, authHeader)
        })

        if (searchResult.body.hits.total.value) {
          await postMetrics('/advancedSearch', {}, authHeader)
        }

        return {
          totalItems:
            (searchResult &&
              searchResult.body.hits &&
              searchResult.body.hits.total.value) ||
            0,
          results:
            (searchResult &&
              searchResult.body.hits &&
              searchResult.body.hits.hits) ||
            []
        }
      } else {
        const hasAtLeastOneParam = Object.values(advancedSearchParameters).some(
          (param) => Boolean(param)
        )

        if (!hasAtLeastOneParam) {
          return await Promise.reject(new Error('There is no param to search '))
        }

        if (count) {
          searchCriteria.size = count
        }
        if (skip) {
          searchCriteria.from = skip
        }
        if (userId) {
          searchCriteria.createdBy = userId
        }
        if (sortColumn) {
          searchCriteria.sortColumn = sortColumn
        }
        if (sortBy) {
          searchCriteria.sortBy = sortBy.map((sort) => ({
            [sort.column]: sort.order
          }))
        }

        searchCriteria.parameters = { ...advancedSearchParameters }

        const searchResult: ApiResponse<ISearchResponse<any>> =
          await postAdvancedSearch(authHeader, searchCriteria)
        return {
          totalItems: searchResult?.body?.hits?.total?.value ?? 0,
          results: searchResult?.body?.hits?.hits ?? []
        }
      }
    },
    async getEventsWithProgress(
      _,
      {
        declarationJurisdictionId,
        registrationStatuses,
        compositionType,
        count,
        skip,
        sort = 'desc'
      },
      { headers: authHeader }
    ) {
      if (!inScope(authHeader, ['sysadmin', 'register', 'validate'])) {
        return await Promise.reject(
          new Error(
            'User does not have a sysadmin or register or validate scope'
          )
        )
      }

      const searchCriteria: ISearchCriteria = {
        sort,
        parameters: {
          declarationJurisdictionId: declarationJurisdictionId,
          registrationStatuses: registrationStatuses,
          compositionType: compositionType
        }
      }

      if (count) {
        searchCriteria.size = count
      }
      if (skip) {
        searchCriteria.from = skip
      }

      const searchResult: ApiResponse<ISearchResponse<any>> =
        await postAdvancedSearch(authHeader, searchCriteria)
      return {
        totalItems: searchResult?.body?.hits?.total?.value || 0,
        results: searchResult?.body?.hits?.hits || []
      }
    }
  }
}
