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
import { defineWorkqueuesColumns, event } from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { emptyMessage, WORKQUEUE_OUTBOX } from '@client/v2-events/utils'
import { useEventConfigurations } from '../events/useEventConfiguration'
import { useEvents } from '../events/useEvents/useEvents'
import { SearchResultComponent } from '../events/Search/SearchResult'

export function Outbox() {
  const [searchParams] = useTypedSearchParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const eventConfigs = useEventConfigurations()
  const intl = useIntl()

  const { getOutbox } = useEvents()
  const outbox = getOutbox()

  const outboxColumns = defineWorkqueuesColumns([
    {
      label: {
        id: 'workqueues.dateOfEvent',
        defaultMessage: 'Date of Event',
        description: 'Label for workqueue column: dateOfEvent'
      },
      value: event.field('dateOfEvent')
    },
    {
      label: emptyMessage,
      value: event.field('outbox')
    }
  ])

  return (
    <SearchResultComponent
      allowRetry={true}
      columns={outboxColumns}
      eventConfigs={eventConfigs}
      queryData={outbox}
      title={intl.formatMessage(WORKQUEUE_OUTBOX.name)}
      totalResults={outbox.length}
      {...searchParams}
    />
  )
}
