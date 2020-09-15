/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { client, ISearchResponse } from '@search/elasticsearch/client'
import { ApiResponse } from '@elastic/elasticsearch'
import { ISearchQuery, SortOrder } from '@search/features/search/types'
import { queryBuilder, EMPTY_STRING } from '@search/features/search/utils'
import { logger } from '@search/logger'

export const DEFAULT_SIZE = 10
const DEFAULT_SEARCH_TYPE = 'compositions'

export const searchComposition = async (params: ISearchQuery) => {
  const formattedParams = formatSearchParams(params)
  let response: ApiResponse<ISearchResponse<any>>
  try {
    // NOTE: we are using the destructuring assignment
    response = await client.search(formattedParams, {
      ignore: [404]
    })
  } catch (err) {
    if (err.statusCode === 400) {
      logger.error('Search: bad request')
    } else {
      logger.error('Search error: ', err)
    }
    return undefined
  }
  return response
}

export function formatSearchParams(params: ISearchQuery) {
  const {
    query = EMPTY_STRING,
    trackingId = EMPTY_STRING,
    contactNumber = EMPTY_STRING,
    registrationNumber = EMPTY_STRING,
    event = EMPTY_STRING,
    status,
    type,
    applicationLocationId = EMPTY_STRING,
    applicationLocationHirarchyId = EMPTY_STRING,
    eventLocationId = EMPTY_STRING,
    gender = EMPTY_STRING,
    name = EMPTY_STRING,
    nameCombinations = [],
    createdBy = EMPTY_STRING,
    from = 0,
    size = DEFAULT_SIZE,
    sort = SortOrder.ASC,
    sortColumn = 'dateOfApplication'
  } = params

  if (nameCombinations.length === 0 && name !== EMPTY_STRING) {
    nameCombinations.push({
      name,
      fields: 'ALL'
    })
  }

  return {
    index: 'ocrvs',
    type: DEFAULT_SEARCH_TYPE,
    from,
    size,
    body: {
      query: queryBuilder(
        query,
        trackingId,
        contactNumber,
        registrationNumber,
        eventLocationId,
        gender,
        nameCombinations,
        applicationLocationId,
        applicationLocationHirarchyId,
        createdBy,
        { event, status, type }
      ),
      sort: [{ [sortColumn]: sort }]
    }
  }
}
