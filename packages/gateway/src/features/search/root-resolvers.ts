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
import { getMetrics, postMetrics } from '@gateway/features/metrics/service'
import {
  getSystem,
  getTokenPayload,
  hasScope,
  inScope
} from '@gateway/features/user/utils'
import { GQLResolver } from '@gateway/graphql/schema'
import { Options } from '@hapi/boom'
import {
  transformSearchParams,
  ISearchCriteria,
  postAdvancedSearch
} from './utils'
import { fetchRegistrationForDownloading } from '@gateway/workflow/index'
import { SCOPES } from '@opencrvs/commons/authentication'
import { RateLimitError } from '@gateway/rate-limit'
import { resourceIdentifierToUUID } from '@opencrvs/commons/types'

type ApiResponse<T> = {
  body: T
  statusCode: number
}

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
      { headers: authHeader, dataSources }
    ) {
      if (
        !inScope(authHeader, [
          SCOPES.SEARCH_BIRTH,
          SCOPES.SEARCH_DEATH,
          SCOPES.SEARCH_MARRIAGE,
          SCOPES.SEARCH_BIRTH_MY_JURISDICTION,
          SCOPES.SEARCH_DEATH_MY_JURISDICTION,
          SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION,
          SCOPES.RECORDSEARCH
        ])
      )
        return {
          totalItems: 0,
          results: []
        }

      const userIdentifier = getTokenPayload(authHeader.Authorization).sub
      let user
      let system

      try {
        user = await dataSources.usersAPI.getUserById(userIdentifier!)
      } catch (error) {
        //user not found, attempting to find the system
        system = await getSystem({ systemId: userIdentifier }, authHeader)

        if (!system) {
          throw new Error('API client system not found')
        }
      }

      const office = user
        ? await dataSources.locationsAPI.getLocation(user.primaryOfficeId)
        : undefined
      const officeLocationId = office
        ? office.partOf?.reference &&
          resourceIdentifierToUUID(office.partOf.reference)
        : undefined

      if (user && !officeLocationId) {
        throw new Error('User office not found')
      }

      const transformedSearchParams = transformSearchParams(
        getTokenPayload(authHeader.Authorization).scope,
        advancedSearchParameters,
        ''
      )

      const searchCriteria: ISearchCriteria = {
        sort,
        parameters: transformedSearchParams
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

      const isExternalAPI = hasScope(authHeader, SCOPES.RECORDSEARCH)
      if (isExternalAPI && system) {
        const getTotalRequest = await getMetrics(
          '/advancedSearch',
          {},
          authHeader
        )
        if (getTotalRequest.total >= system.settings.dailyQuota) {
          throw new RateLimitError('Daily search quota exceeded')
        }

        const searchResult: ApiResponse<ISearchResponse<any>> =
          await postAdvancedSearch(authHeader, searchCriteria)

        if ((searchResult?.statusCode ?? 0) >= 400) {
          const errMsg = searchResult as Options<string>
          throw new Error(errMsg.message)
        }

        ;(searchResult.body.hits.hits || []).forEach(async (hit) => {
          await fetchRegistrationForDownloading(hit._id, authHeader)
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
          throw new Error('There is no param to search ')
        }

        searchCriteria.parameters = { ...transformedSearchParams }

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
      if (!inScope(authHeader, [SCOPES.PERFORMANCE_READ])) {
        throw new Error('User does not have enough scope')
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
