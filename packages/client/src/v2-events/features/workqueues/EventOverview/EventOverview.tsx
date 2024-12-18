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
import { useSelector } from 'react-redux'
import {
  ActionDocument,
  EventIndex,
  SummaryConfig
} from '@opencrvs/commons/client'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { ROUTES } from '@client/v2-events/routes'

import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
// eslint-disable-next-line no-restricted-imports
import { getUserDetails } from '@client/profile/profileSelectors'
// eslint-disable-next-line no-restricted-imports
import { ProfileState } from '@client/profile/profileReducer'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/features/workqueues/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { EventHistory } from './components/EventHistory'
import { EventSummary } from './components/EventSummary'

import { ActionMenu } from './components/ActionMenu'

/**
 * Based on packages/client/src/views/RecordAudit/RecordAudit.tsx
 */

export function EventOverviewIndex() {
  const params = useTypedParams(ROUTES.V2.EVENTS.EVENT)
  const { getEvents, getEventById } = useEvents()
  const user = useSelector(getUserDetails)

  // @TODO: double check whether this indeed returns always non falsy value
  const [config] = useEventConfigurations()

  const { data: fullEvent } = getEventById.useQuery(params.eventId)

  const { data: events } = getEvents.useQuery()
  const event = events?.find((e) => e.id === params.eventId)

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!event || !config || !fullEvent?.actions) {
    return null
  }

  return (
    <EventOverview
      event={event}
      history={fullEvent.actions}
      summary={config.summary}
      user={user}
    />
  )
}

/**
 * Renders the event overview page, including the event summary and history.
 */
function EventOverview({
  event,
  summary,
  history,
  user
}: {
  event: EventIndex
  summary: SummaryConfig
  history: ActionDocument[]
  user: ProfileState['userDetails']
}) {
  const intl = useIntlFormatMessageWithFlattenedParams()

  return (
    <Content
      icon={() => <IconWithName name={''} status={'orange'} />}
      size={ContentSize.LARGE}
      title={intl.formatMessage(summary.title, event.data)}
      titleColor={event.id ? 'copy' : 'grey600'}
      topActionButtons={[<ActionMenu key={event.id} eventId={event.id} />]}
    >
      <EventSummary event={event} summary={summary} />
      <EventHistory history={history} user={user} />
    </Content>
  )
}
