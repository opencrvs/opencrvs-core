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
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents'
import { EventSummary } from './components/EventSummary'
import { EventHistory } from './components/EventHistory'

import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { SummaryConfig } from '@opencrvs/commons'
import { ActionDocument, EventIndex } from '@events/schema'
import { useSelector } from 'react-redux'
// eslint-disable-next-line no-restricted-imports
import { getUserDetails } from '@client/profile/profileSelectors'
// eslint-disable-next-line no-restricted-imports
import { ProfileState } from '@client/profile/profileReducer'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/features/workqueues/utils'

/**
 * Based on packages/client/src/views/RecordAudit/RecordAudit.tsx
 */

export const EventOverviewIndex = () => {
  const params = useTypedParams(ROUTES.V2.EVENTS.EVENT)
  const { getEvents, getEventById } = useEvents()
  const user = useSelector(getUserDetails)

  const [config] = useEventConfigurations()

  const { data: fullEvent } = getEventById.useQuery(params.eventId)

  const { data: events } = getEvents.useQuery()
  const event = events?.find((event) => event.id === params.eventId)

  if (!event || !config || !fullEvent?.actions) {
    return null
  }

  return (
    <EventOverview
      event={event}
      summary={config.summary}
      history={fullEvent.actions}
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
  const actions: React.ReactElement[] = []
  const desktopActionsView: React.ReactElement[] = []

  desktopActionsView.push(actions[actions.length - 1])

  return (
    <Content
      title={intl.formatMessage(summary.title, event.data)}
      titleColor={event.id ? 'copy' : 'grey600'}
      size={ContentSize.LARGE}
      topActionButtons={desktopActionsView}
      icon={() => <IconWithName status={'orange'} name={''} />}
    >
      <EventSummary event={event} summary={summary} />
      <EventHistory history={history} user={user} />
    </Content>
  )
}
