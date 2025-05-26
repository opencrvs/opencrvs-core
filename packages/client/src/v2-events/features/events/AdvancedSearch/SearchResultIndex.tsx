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

import React from 'react'
import { parse } from 'query-string'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { SearchQueryParams, workqueues } from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { SearchResult } from './SearchResult'
import {
  ADVANCED_SEARCH_KEY,
  buildDataCondition,
  parseFieldSearchParams
} from './utils'

export const SearchResultIndex = () => {
  const { searchEvent } = useEvents()
  const { eventType } = useTypedParams(ROUTES.V2.SEARCH_RESULT)
  const { eventConfiguration: eventConfig } = useEventConfiguration(eventType)

  const searchParams = SearchQueryParams.safeParse(
    parse(window.location.search)
  )

  if (searchParams.error) {
    throw new Error('Invalid search params')
  }

  const filteredSearchParams = parseFieldSearchParams(
    eventConfig,
    searchParams.data
  )

  const formattedSearchParams = buildDataCondition(
    filteredSearchParams,
    eventConfig
  )

  const queryData = searchEvent.useSuspenseQuery(
    eventType,
    formattedSearchParams,
    ADVANCED_SEARCH_KEY
  )

  const workqueueId = 'all'
  const workqueueConfig =
    workqueueId in workqueues
      ? workqueues[workqueueId as keyof typeof workqueues]
      : null

  if (!workqueueConfig) {
    return null
  }

  return (
    <SearchResult
      eventConfig={eventConfig}
      queryData={queryData}
      searchParams={searchParams.data}
      workqueueConfig={workqueueConfig}
    />
  )
}
