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
  EventIndex,
  ActionDocument,
  SummaryConfig
} from '@opencrvs/commons/client'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { ROUTES } from '@client/v2-events/routes'

import {
  getAllFields,
  useEventConfiguration,
  useEventConfigurations
} from '@client/v2-events/features/events/useEventConfiguration'
import { getInitialValues } from '@client/v2-events/components/forms/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/features/workqueues/utils'
import { useUsers } from '@client/v2-events/hooks/useUsers'
// eslint-disable-next-line no-restricted-imports
import { getLocations } from '@client/offline/selectors'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { getUserIdsFromActions } from '@client/v2-events/utils'
import { EventHistory } from './components/EventHistory'
import { EventSummary } from './components/EventSummary'

import { ActionMenu } from './components/ActionMenu'
import { EventOverviewProvider } from './EventOverviewContext'

/**
 * Based on packages/client/src/views/RecordAudit/RecordAudit.tsx
 */

function EventOverviewContainer() {
  const params = useTypedParams(ROUTES.V2.EVENTS.OVERVIEW)
  const { getEvents, getEvent } = useEvents()
  const { getUsers } = useUsers()

  const [config] = useEventConfigurations()

  const [fullEvent] = getEvent.useSuspenseQuery(params.eventId)
  const [events] = getEvents.useSuspenseQuery()
  const event = events.find((e) => e.id === params.eventId)

  const userIds = getUserIdsFromActions(fullEvent.actions)
  const [users] = getUsers.useSuspenseQuery(userIds)
  const locations = useSelector(getLocations)

  if (!event) {
    return null
  }

  return (
    <EventOverviewProvider locations={locations} users={users}>
      <EventOverview
        event={event}
        history={fullEvent.actions.filter((action) => !action.draft)}
        summary={config.summary}
      />
    </EventOverviewProvider>
  )
}

/**
 * Renders the event overview page, including the event summary and history.
 */
function EventOverview({
  event,
  summary,
  history
}: {
  event: EventIndex
  summary: SummaryConfig
  history: ActionDocument[]
}) {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const intl = useIntlFormatMessageWithFlattenedParams()
  const initialValues = getInitialValues(getAllFields(eventConfiguration))
  return (
    <Content
      icon={() => <IconWithName name={''} status={'orange'} />}
      size={ContentSize.LARGE}
      title={intl.formatMessage(summary.title, {
        ...initialValues,
        ...event.data
      })}
      titleColor={event.id ? 'copy' : 'grey600'}
      topActionButtons={[<ActionMenu key={event.id} eventId={event.id} />]}
    >
      <EventSummary event={event} summary={summary} />
      <EventHistory history={history} />
    </Content>
  )
}

export const EventOverviewIndex = withSuspense(EventOverviewContainer)
