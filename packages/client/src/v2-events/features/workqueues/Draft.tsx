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
import { EventDocument, mandatoryColumns } from '@opencrvs/commons/client'
import { getCurrentEventState } from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { CoreWorkqueues, WORKQUEUE_DRAFT } from '@client/v2-events/utils'
import { useEventConfigurations } from '../events/useEventConfiguration'
import { SearchResultComponent } from '../events/Search/SearchResult'
import { useDrafts } from '../drafts/useDrafts'
import { useOutbox } from '../events/useEvents/outbox'
import { findLocalEventDocument } from '../events/useEvents/api'

export function Draft() {
  const [searchParams] = useTypedSearchParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)

  const eventConfigs = useEventConfigurations()
  const intl = useIntl()

  const outboxIds = useOutbox().map(({ id }) => id)

  const { getAllRemoteDrafts } = useDrafts()

  const drafts = getAllRemoteDrafts()

  const eventsWithDrafts = drafts
    .map(({ eventId }) => findLocalEventDocument(eventId))
    .filter((event): event is EventDocument => !!event)
    .map((event) =>
      getCurrentEventState(
        event,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        eventConfigs.find(({ id }) => id === event.type)!
      )
    )

  return (
    <SearchResultComponent
      key={`${CoreWorkqueues.DRAFT}-${outboxIds.length}`}
      actions={['DEFAULT']}
      columns={mandatoryColumns}
      eventConfigs={eventConfigs}
      queryData={eventsWithDrafts}
      title={intl.formatMessage(WORKQUEUE_DRAFT.name)}
      {...searchParams}
    />
  )
}
