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
import { GQLResolver } from '@gateway/graphql/schema'

import { ApolloError } from 'apollo-server-hapi'
import { decode } from 'jsonwebtoken'
import { getUser } from '../user/utils'

export class RateLimitError extends ApolloError {
  constructor(message: string) {
    super(message, 'DAILY_QUOTA_EXCEEDED')
    Object.defineProperty(this, 'name', { value: 'DailyQuotaExceeded' })
  }
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
      { headers: authHeader }
    ) {
      const decoded = decode(
        authHeader.Authorization.replace('Bearer ', '')
      ) as { sub: string }
      const user = await getUser({ userId: decoded.sub }, authHeader)
      console.log(user)

      return {
        totalItems: 1,
        results: [
          /* @todo */
          {
            status: 'REGISTERED',
            id: '10a219cd-50a6-41b5-90b2-676949d3f192',
            type: 'divorce',
            createdAt: '2021-08-10T10:00:00Z',
            createdAtLocation: user.primaryOfficeId,
            modifiedAt: '2021-08-10T10:00:00Z',
            assignedTo: {
              practitionerId: user.practitionerId,
              firstName: 'Riku',
              lastName: 'Rouvila',
              officeName: 'Helsinki office',
              avatarURL:
                'https://gravatar.com/avatar/9ebd6a2a7bbad60d44806ab340fe5efd?s=400&d=robohash&r=x'
            }
          }
        ]
      }
    }
  }
}
