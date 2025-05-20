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
import { getOrCreateClient } from '@search/elasticsearch/client'
import { ISearchCriteria, SortOrder } from '@search/features/search/types'
import { advancedQueryBuilder } from '@search/features/search/utils'
import { logger } from '@opencrvs/commons'
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types'

export const DEFAULT_SIZE = 10

export async function formatSearchParams(
  searchPayload: ISearchCriteria,
  isExternalSearch: boolean
) {
  const {
    createdBy = '',
    from = 0,
    size = DEFAULT_SIZE,
    sortColumn,
    sortBy,
    parameters
  } = searchPayload

  const sort = []

  if (sortBy) {
    sort.push(...sortBy)
  } else if (sortColumn) {
    sort.push({
      [sortColumn === 'name' ? 'name.keyword' : sortColumn]: {
        order: searchPayload.sort ?? SortOrder.ASC,
        unmapped_type: 'keyword'
      }
    })
  }
  const query = await advancedQueryBuilder(
    parameters,
    createdBy,
    isExternalSearch
  )

  return {
    index: OPENCRVS_INDEX_NAME,
    from,
    size,
    query,
    sort
  } satisfies SearchRequest
}

export const advancedSearch = async (
  isExternalSearch: boolean,
  payload: ISearchCriteria
) => {
  const formattedParams = await formatSearchParams(payload, isExternalSearch)
  const client = getOrCreateClient()
  try {
    return await client.search(formattedParams, {
      ignore: !isExternalSearch ? [404] : undefined,
      meta: true
    })
  } catch (error) {
    if (error.statusCode === 400) {
      logger.error(`ElasticSearch: bad request. Error: ${error.message}`)
    } else {
      logger.error('Search error: ', error)
    }
    return
  }
}
