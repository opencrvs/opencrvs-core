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

import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { defaultThirdColumn, findScope } from '@opencrvs/commons/client'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'

import { ROUTES } from '@client/v2-events/routes'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { getScope } from '@client/profile/profileSelectors'
import { useWorkqueueConfigurations } from '../events/useWorkqueueConfiguration'
import {
  SearchResultComponent,
  searchResultMessages
} from '../events/AdvancedSearch/SearchResult'

export function WorkqueueContainer() {
  const { slug: workqueueSlug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const eventConfigs = useEventConfigurations()
  const workqueues = useWorkqueueConfigurations()
  const { searchEvent, getEvents } = useEvents()
  const scopes = useSelector(getScope)

  const workqueueConfig = workqueues.find(({ slug }) => slug === workqueueSlug)

  const intl = useIntl()

  const [events2] = getEvents.useSuspenseQuery()

  if (!workqueueConfig) {
    throw new Error('Workqueue configuration not found for' + workqueueSlug)
  }
  const availableWorkqueues =
    findScope(scopes ?? [], 'workqueue')?.options.id ?? []

  if (!availableWorkqueues.includes(workqueueSlug)) {
    throw new Error(`Workqueue ${workqueueSlug} is not available for this user`)
  }

  const query = workqueueConfig.query
  const events = searchEvent.useSuspenseQuery(query).concat(events2) // to fix

  return (
    <WQContentWrapper
      isMobileSize={false}
      noContent={events.length === 0}
      noResultText={intl.formatMessage(searchResultMessages.noResult)}
      title={intl.formatMessage(workqueueConfig.name)}
    >
      <SearchResultComponent
        columns={defaultThirdColumn}
        eventConfigs={eventConfigs}
        queryData={events}
      />
    </WQContentWrapper>
  )
}
