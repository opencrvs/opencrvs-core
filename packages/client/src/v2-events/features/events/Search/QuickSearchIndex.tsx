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
import { useLocation } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import { mandatoryColumns } from '@opencrvs/commons/client'
import { SearchResultComponent } from '@client/v2-events/features/events/Search/SearchResult'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { ROUTES } from '@client/v2-events/routes'
import { buildQuickSearchQuery, deserializeSearchParams } from './utils'

function QuickSearch() {
  const intl = useIntl()
  const [typedSearchParams] = useTypedSearchParams(ROUTES.V2.SEARCH)
  const location = useLocation()
  const { searchEvent } = useEvents()
  const eventConfigurations = useEventConfigurations()

  const searchParams = deserializeSearchParams(location.search) as Record<
    string,
    string
  >

  const query = buildQuickSearchQuery(searchParams, eventConfigurations)
  const queryData = searchEvent.useSuspenseQuery(query)

  return (
    <SearchResultComponent
      actions={['DEFAULT']}
      columns={mandatoryColumns}
      eventConfigs={eventConfigurations}
      queryData={queryData}
      title={intl.formatMessage(
        {
          id: 'v2.search.quickSearch.result.title',
          description: 'Title for search result page',
          defaultMessage: 'Search result for “{searchTerm}”'
        },
        {
          searchTerm: searchParams.keys
        }
      )}
      {...typedSearchParams}
    />
  )
}

export const QuickSearchIndex = withSuspense(QuickSearch)
