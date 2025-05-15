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
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useWorkqueueConfigurations } from '../useWorkqueueConfiguration'
import { SearchResult } from './SearchResult'
import { ADVANCED_SEARCH_KEY, buildDataCondition } from './utils'

export const SearchResultIndex = () => {
  const { slug: workqueueSlug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const { searchEvent } = useEvents()
  const { eventType } = useTypedParams(ROUTES.V2.SEARCH_RESULT)
  const { eventConfiguration: eventConfig } = useEventConfiguration(eventType)
  const workqueues = useWorkqueueConfigurations()

  const searchParams = parse(window.location.search, {
    arrayFormat: 'comma'
  }) as Record<string, string>

  const formattedSearchParams = buildDataCondition(searchParams, eventConfig)

  const queryData = searchEvent.useSuspenseQuery(
    eventType,
    formattedSearchParams,
    ADVANCED_SEARCH_KEY
  )

  const workqueueConfig = workqueues.find(({ slug }) => slug === workqueueSlug)
  if (!workqueueConfig) {
    return null
  }

  return (
    <SearchResult
      eventConfig={eventConfig}
      queryData={queryData}
      searchParams={searchParams}
      workqueueConfig={workqueueConfig}
    />
  )
}
