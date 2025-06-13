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
import { useLocation } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { mandatoryColumns } from '@opencrvs/commons/client'
import { SearchResult } from '@client/v2-events/features/events/Search/SearchResult'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { buildQuickSearchQuery } from './utils'

export const QuickSearchIndex = () => {
  const intl = useIntl()
  const location = useLocation()
  const { searchEvent } = useEvents()
  const eventConfigurations = useEventConfigurations()

  const searchParams = parse(location.search, {
    arrayFormat: 'comma'
  }) as Record<string, string>

  const query = buildQuickSearchQuery(searchParams, eventConfigurations)
  const queryData = searchEvent.useSuspenseQuery(query)

  return (
    <SearchResult
      columns={mandatoryColumns}
      eventConfigs={eventConfigurations}
      queryData={queryData}
      // @todo add quick search title. see https://github.com/opencrvs/opencrvs-core/issues/8460
      title={intl.formatMessage({
        id: 'kdkdkd',
        description: '',
        defaultMessage: ''
      })}
    />
  )
}
