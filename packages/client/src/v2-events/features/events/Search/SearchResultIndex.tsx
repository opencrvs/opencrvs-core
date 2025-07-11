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
import React, { useMemo } from 'react'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { useIntl } from 'react-intl'
import { useLocation } from 'react-router-dom'
import { SearchQueryParams, mandatoryColumns } from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { SearchCriteriaPanel } from '@client/v2-events/features/events/Search/SearchCriteriaPanel'
import { SearchResultComponent } from './SearchResult'
import {
  buildSearchQuery,
  toAdvancedSearchQueryType,
  parseFieldSearchParams,
  deserializeSearchParams
} from './utils'

export const SearchResultIndex = () => {
  const intl = useIntl()
  const [typedSearchParams] = useTypedSearchParams(ROUTES.V2.SEARCH_RESULT)
  const { searchEvent } = useEvents()
  const { eventType } = useTypedParams(ROUTES.V2.SEARCH_RESULT)
  const location = useLocation()
  const { eventConfiguration: eventConfig } = useEventConfiguration(eventType)

  /*
   * SelectDateRangeValue's are converted to DateTime values which would
   * return a new value on every render, hence we need to memoize.
   */
  const searchParams = useMemo(
    () => SearchQueryParams.parse(deserializeSearchParams(location.search)),
    [location.search]
  )
  const searchQuery = useMemo(() => {
    const validSearchParams = parseFieldSearchParams(eventConfig, searchParams)
    return buildSearchQuery(validSearchParams, eventConfig)
  }, [searchParams, eventConfig])

  /*
   * useSuspenseQuery unmounts the component causing the searchQuery to be
   * re-evaluated, which leads to an infinite loop.
   */
  const queryData =
    searchEvent.useQuery(toAdvancedSearchQueryType(searchQuery, eventType))
      .data ?? []

  return (
    <SearchResultComponent
      actions={['DEFAULT']}
      columns={mandatoryColumns}
      eventConfigs={[eventConfig]}
      queryData={queryData}
      tabBarContent={
        <SearchCriteriaPanel
          eventConfig={eventConfig}
          searchParams={searchParams}
        />
      }
      title={intl.formatMessage(
        {
          id: 'v2.search.advancedSearch.result.title',
          description: 'Advanced search result title',
          defaultMessage: 'Search results ({count})'
        },
        {
          count: queryData.length
        }
      )}
      {...typedSearchParams}
    />
  )
}
