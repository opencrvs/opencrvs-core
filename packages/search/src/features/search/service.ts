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
import { client, ISearchResponse } from '@search/elasticsearch/client'
import { ApiResponse } from '@elastic/elasticsearch'
import { ISearchCriteria, SortOrder } from '@search/features/search/types'
import { advancedQueryBuilder } from '@search/features/search/utils'
import { logger } from '@search/logger'
import { OPENCRVS_INDEX_NAME } from '@search/constants'

export const DEFAULT_SIZE = 10
const DEFAULT_SEARCH_TYPE = 'compositions'

export function formatSearchParams(
  searchPayload: ISearchCriteria,
  isExternalSearch: boolean
) {
  const {
    createdBy = '',
    from = 0,
    size = DEFAULT_SIZE,
    sortColumn = 'dateOfDeclaration',
    sortBy,
    parameters
  } = searchPayload

  const sort = sortBy ?? [{ [sortColumn]: searchPayload.sort ?? SortOrder.ASC }]

  return {
    index: OPENCRVS_INDEX_NAME,
    type: DEFAULT_SEARCH_TYPE,
    from,
    size,
    body: {
      query: advancedQueryBuilder(parameters, createdBy, isExternalSearch),
      sort
    }
  }
}

export const advancedSearch = async (
  isExternalSearch: boolean,
  payload: ISearchCriteria
) => {
  const formattedParams = formatSearchParams(payload, isExternalSearch)
  let response: ApiResponse<ISearchResponse<any>>
  try {
    response = await client.search(formattedParams, {
      ignore: !isExternalSearch ? [404] : undefined
    })
  } catch (error) {
    if (error.statusCode === 400) {
      logger.error('Search: bad request')
    } else {
      logger.error('Search error: ', error)
    }
    return undefined
  }

  return response
}
