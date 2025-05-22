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
  const { getUsers } = useUsers()
  const scopes = useSelector(getScope)
  const legacyUser = useSelector(getUserDetails)
  const [[user]] = getUsers.useSuspenseQuery(legacyUser ? [legacyUser.id] : [])

  const intl = useIntl()

  const availableWorkqueues =
    findScope(scopes ?? [], 'workqueue')?.options.id ?? []

  const userHasAccessToWorkqueue = availableWorkqueues.includes(workqueueSlug)

  const workqueueConfig =
    userHasAccessToWorkqueue &&
    workqueues.find(({ slug }) => slug === workqueueSlug)

  const deSerializedQuery =
    (workqueueConfig &&
      legacyUser &&
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      user &&
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      deserializeQuery(workqueueConfig.query, {
        ...user,
        primaryOfficeId: legacyUser.primaryOffice.id
      })) ||
    {}

  const events = searchEvent.useSuspenseQuery(deSerializedQuery)

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!user) {
    throw new Error('User data not found for')
  }

  if (!userHasAccessToWorkqueue) {
    throw new Error(`Workqueue ${workqueueSlug} is not available for this user`)
  }

  if (!workqueueConfig) {
    throw new Error('Workqueue configuration not found for' + workqueueSlug)
  }

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
