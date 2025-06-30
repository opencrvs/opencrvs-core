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
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import { useIntl } from 'react-intl'
import { getTokenPayload, mandatoryColumns } from '@opencrvs/commons/client'
import { QueryType } from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { WORKQUEUE_DRAFT } from '@client/v2-events/utils'
import { getToken } from '@client/utils/authUtils'
import { useEventConfigurations } from '../events/useEventConfiguration'
import { SearchResultComponent } from '../events/Search/SearchResult'
import { useDrafts } from '../drafts/useDrafts'
import { useEvents } from '../events/useEvents/useEvents'

export function Draft() {
  const { sub: userId } = getTokenPayload(getToken())

  const [searchParams] = useTypedSearchParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const eventConfigs = useEventConfigurations()
  const intl = useIntl()

  const { getAllRemoteDrafts } = useDrafts()
  const draftIds = getAllRemoteDrafts().map(({ eventId }) => eventId)

  const AssignedToMeQuery: QueryType = {
    type: 'and',
    clauses: [{ assignedTo: { type: 'exact', term: userId } }]
  }

  const { searchEvent } = useEvents()
  const eventsWithDrafts = searchEvent
    .useSuspenseQuery(AssignedToMeQuery)
    .filter(({ id }) => draftIds.includes(id))

  return (
    <SearchResultComponent
      actions={['DEFAULT']}
      columns={mandatoryColumns}
      eventConfigs={eventConfigs}
      queryData={eventsWithDrafts}
      title={intl.formatMessage(WORKQUEUE_DRAFT.name)}
      {...searchParams}
    />
  )
}
