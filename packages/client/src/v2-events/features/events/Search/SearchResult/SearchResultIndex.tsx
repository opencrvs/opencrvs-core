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
import {
  EventState,
  mandatoryColumns,
  ActionType
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { SearchCriteriaPanel } from '@client/v2-events/features/events/Search/SearchCriteriaPanel'
import { useAdminStructure } from '@client/v2-events/hooks/useAdminStructure'
import {
  buildSearchQuery,
  toAdvancedSearchQueryType,
  deserializeSearchParams,
  resolveAdvancedSearchConfig
} from '../utils'
import { SearchResultComponent } from './SearchResult'

export const SearchResultIndex = () => {
  const intl = useIntl()
  const [typedSearchParams] = useTypedSearchParams(ROUTES.V2.SEARCH_RESULT)
  const { searchEvent } = useEvents()
  const { eventType } = useTypedParams(ROUTES.V2.SEARCH_RESULT)
  const location = useLocation()
  const { eventConfiguration: eventConfig } = useEventConfiguration(eventType)
  const adminStructure = useAdminStructure()

  const fields = useMemo(() => {
    const sections = resolveAdvancedSearchConfig(eventConfig, adminStructure)
    return sections.flatMap((section) => section.fields)
  }, [eventConfig, adminStructure])

  /*
   * SelectDateRangeValue's are converted to DateTime values which would
   * return a new value on every render, hence we need to memoize.
   */
  const formValues = useMemo(() => {
    /*
     * Deliberately not parsed with `SearchQueryParams`. Its catchall is a plain
     * union of every field-value shape, and some members are objects whose keys
     * are all optional. Those match any object and strip it to `{}`. An address
     * filter is held as a FIELD_GROUP value, so it would not survive.
     *
     * Safe to skip: the filter below drops any key that is not a known field,
     * and every value that reaches a query is checked by the branch that
     * consumes it.
     */
    const searchParams = deserializeSearchParams(location.search)

    return Object.fromEntries(
      Object.entries(searchParams).filter(([key]) =>
        fields.some((field) => field.id === key)
      )
    ) as EventState
  }, [location.search, fields])

  const searchQuery = useMemo(
    () =>
      buildSearchQuery(
        formValues,
        fields,
        eventConfig.advancedSearch.flatMap((section) => section.fields),
        eventConfig
      ),
    [formValues, eventConfig, fields]
  )

  /*
   * useSuspenseQuery unmounts the component causing the searchQuery to be
   * re-evaluated, which leads to an infinite loop.
   */
  const queryData = searchEvent.useQuery({
    query: toAdvancedSearchQueryType(
      searchQuery,
      eventConfig.advancedSearch.flatMap((section) => section.fields),
      eventType
    ),
    ...typedSearchParams
  }).data ?? {
    results: [],
    total: 0
  }

  return (
    <SearchResultComponent
      action={{ type: ActionType.READ }}
      columns={mandatoryColumns}
      eventConfigs={[eventConfig]}
      queryData={queryData.results}
      tabBarContent={
        <SearchCriteriaPanel
          eventConfig={eventConfig}
          formValues={formValues}
        />
      }
      title={intl.formatMessage(
        {
          id: 'search.advancedSearch.result.title',
          description: 'Advanced search result title',
          defaultMessage: 'Search results ({count})'
        },
        {
          count: queryData.total
        }
      )}
      totalResults={queryData.total}
      {...typedSearchParams}
    />
  )
}
