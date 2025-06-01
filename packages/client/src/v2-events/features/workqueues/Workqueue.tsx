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

import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { useIntl } from 'react-intl'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'

import { ROUTES } from '@client/v2-events/routes'
import { useWorkqueue } from '@client/v2-events/hooks/useWorkqueue'
import { SearchResultComponent } from '../events/AdvancedSearch/SearchResult'
import { useWorkqueueConfigurations } from '../events/useWorkqueueConfiguration'

export function WorkqueueContainer() {
  const { slug: workqueueSlug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const [searchParams] = useTypedSearchParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const eventConfigs = useEventConfigurations()
  const workqueues = useWorkqueueConfigurations()

  const { getResult } = useWorkqueue(workqueueSlug)
  const events = getResult().useSuspenseQuery()

  const intl = useIntl()
  const workqueueConfig = workqueues.find(({ slug }) => slug === workqueueSlug)

  if (!workqueueConfig) {
    throw new Error('Workqueue configuration not found for' + workqueueSlug)
  }

  return (
    <SearchResultComponent
      columns={workqueueConfig.columns}
      eventConfigs={eventConfigs}
      queryData={events}
      title={intl.formatMessage(workqueueConfig.name)}
      {...searchParams}
      showPlusButton
    />
  )
}
