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
import { useIntl } from 'react-intl'
import {
  EventDocument,
  getCurrentEventState,
  getAcceptedActions,
  getCurrentEventStateWithDrafts
} from '@opencrvs/commons/client'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { ROUTES } from '@client/v2-events/routes'

import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { getLocations } from '@client/offline/selectors'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import {
  flattenEventIndex,
  getUserIdsFromActions,
  getUsersFullName
} from '@client/v2-events/utils'
import { useEventTitle } from '@client/v2-events/features/events/useEvents/useEventTitle'
import { useDrafts } from '../../drafts/useDrafts'
import { EventHistory } from './components/EventHistory'
import { EventSummary } from './components/EventSummary'

import { ActionMenu } from './components/ActionMenu'
import {
  EventOverviewProvider,
  useEventOverviewContext
} from './EventOverviewContext'

/**
 * File is based on packages/client/src/views/RecordAudit/RecordAudit.tsx
 */

/**
 * Renders the event overview page, including the event summary and history.
 */
function EventOverview({
  event,
  onAction
}: {
  event: EventDocument
  onAction: () => void
}) {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const eventIndex = getCurrentEventState(event, eventConfiguration)
  const { trackingId, status } = eventIndex
  const { getRemoteDrafts } = useDrafts()
  const drafts = getRemoteDrafts()
  const eventWithDrafts = getCurrentEventStateWithDrafts({
    event,
    drafts,
    configuration: eventConfiguration
  })
  const { getUser } = useEventOverviewContext()
  const intl = useIntl()

  const assignedTo = eventIndex.assignedTo
    ? getUsersFullName(getUser(eventIndex.assignedTo).name, intl.locale)
    : null

  const { flags, legalStatuses, ...flattenedEventIndex } = {
    ...flattenEventIndex(eventWithDrafts),
    // @TODO: Ask why these are defined outside of flatten index?
    'event.trackingId': trackingId,
    'event.status': status,
    // @TODO: Go through different interfaces and ensure this is unified. (e.g. does print certificate and event overview use the same interface?)
    'event.registrationNumber':
      eventIndex.legalStatuses.REGISTERED?.registrationNumber, // This should never be overridden by the draft.
    'event.assignedTo': assignedTo
  }

  const { getEventTitle } = useEventTitle()
  const { title } = getEventTitle(eventConfiguration, eventWithDrafts)

  const actions = getAcceptedActions(event)

  return (
    <Content
      icon={() => <IconWithName name={''} status={status} />}
      size={ContentSize.LARGE}
      title={title}
      titleColor={event.id ? 'copy' : 'grey600'}
      topActionButtons={[
        <ActionMenu key={event.id} eventId={event.id} onAction={onAction} />
      ]}
    >
      <EventSummary
        event={flattenedEventIndex}
        eventConfiguration={eventConfiguration}
      />
      <EventHistory history={actions} />
    </Content>
  )
}

function EventOverviewContainer() {
  const params = useTypedParams(ROUTES.V2.EVENTS.OVERVIEW)
  const { getEvent } = useEvents()
  const { getUsers } = useUsers()

  // Suspense query is not used here because we want to refetch when an event action is performed
  const getEventQuery = getEvent.useQuery(params.eventId)
  const fullEvent = getEventQuery.data

  if (!fullEvent) {
    return
  }

  const activeActions = getAcceptedActions(fullEvent)
  const userIds = getUserIdsFromActions(activeActions)
  const [users] = getUsers.useSuspenseQuery(userIds)
  const locations = useSelector(getLocations)

  return (
    <EventOverviewProvider locations={locations} users={users}>
      <EventOverview event={fullEvent} onAction={getEventQuery.refetch} />
    </EventOverviewProvider>
  )
}

export const EventOverviewIndex = withSuspense(EventOverviewContainer)
