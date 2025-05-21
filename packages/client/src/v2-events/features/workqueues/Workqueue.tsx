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
import {
  defaultThirdColumn,
  findScope,
  deserializeQuery
} from '@opencrvs/commons/client'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'

import { ROUTES } from '@client/v2-events/routes'
import { WQContentWrapper } from '@client/views/OfficeHome/WQContentWrapper'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { useWorkqueueConfigurations } from '../events/useWorkqueueConfiguration'
import {
  SearchResultComponent,
  searchResultMessages
} from '../events/AdvancedSearch/SearchResult'

export function WorkqueueContainer() {
  const { slug: workqueueSlug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const eventConfigs = useEventConfigurations()
  const workqueues = useWorkqueueConfigurations()
  const { searchEvent } = useEvents()
  const scopes = useSelector(getScope)
  const legacyUser = useSelector(getUserDetails)

  const workqueueConfig = workqueues.find(({ slug }) => slug === workqueueSlug)

  const intl = useIntl()

  if (!workqueueConfig) {
    throw new Error('Workqueue configuration not found for' + workqueueSlug)
  }
  if (!legacyUser) {
    throw new Error('Old user data not found')
  }

  const { getUsers } = useUsers()
  const [[user]] = getUsers.useSuspenseQuery([legacyUser.id])

  if (!user) {
    throw new Error('User data not found for' + legacyUser.id)
  }

  const availableWorkqueues =
    findScope(scopes ?? [], 'workqueue')?.options.id ?? []

  if (!availableWorkqueues.includes(workqueueSlug)) {
    throw new Error(`Workqueue ${workqueueSlug} is not available for this user`)
  }

  const deSerializedQuery = deserializeQuery(workqueueConfig.query, user)

  const events = searchEvent.useSuspenseQuery(deSerializedQuery)

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
