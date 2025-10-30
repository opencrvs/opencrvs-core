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
  dangerouslyGetCurrentEventStateWithDrafts,
  EventIndex,
  applyDraftToEventIndex,
  deepDropNulls,
  EventStatus,
  getOrThrow
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
  AssignmentStatus,
  getAssignmentStatus,
  flattenEventIndex,
  getUsersFullName
} from '@client/v2-events/utils'
import { useEventTitle } from '@client/v2-events/features/events/useEvents/useEventTitle'
import { DownloadButton } from '@client/v2-events/components/DownloadButton'
import { useAuthentication } from '@client/utils/userUtils'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useDrafts } from '../../drafts/useDrafts'
import { DuplicateWarning } from '../../events/actions/dedup/DuplicateWarning'
import { EventHistory, EventHistorySkeleton } from './components/EventHistory'
import { EventSummary } from './components/EventSummary'
import { ActionMenu } from './components/ActionMenu'
import { EventOverviewProvider } from './EventOverviewContext'

/**
 * Renders the event overview page, including the event summary and history.
 */
function EventOverviewFull({
  event,
  onAction
}: {
  event: EventDocument
  onAction: () => void
}) {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const eventIndex = getCurrentEventState(event, eventConfiguration)
  const validatorContext = useValidatorContext()
  const { status } = eventIndex
  const { getRemoteDraftByEventId } = useDrafts()
  const draft = getRemoteDraftByEventId(eventIndex.id, {
    refetchOnMount: 'always'
  })

  const eventWithDrafts = draft
    ? dangerouslyGetCurrentEventStateWithDrafts({
        event,
        draft,
        configuration: eventConfiguration
      })
    : getCurrentEventState(event, eventConfiguration)

  const { getUser } = useUsers()
  const intl = useIntl()

  const assignedToUser = getUser.useQuery(eventWithDrafts.assignedTo || '', {
    enabled: !!eventWithDrafts.assignedTo
  })

  const assignedTo = assignedToUser.data
    ? getUsersFullName(assignedToUser.data.name, intl.locale)
    : null

  const { flags, legalStatuses, potentialDuplicates, ...flattenedEventIndex } =
    {
      ...flattenEventIndex(eventWithDrafts),
      // drafts should not affect the status of the event
      // so the status and flags are taken from the eventIndex
      'event.status': status,
      'event.assignedTo': assignedTo,
      flags: eventIndex.flags
    }

  const { getEventTitle } = useEventTitle()
  const { title } = getEventTitle(eventConfiguration, eventWithDrafts)

  return (
    <Content
      icon={() => <IconWithName flags={flags} name={''} status={status} />}
      size={ContentSize.LARGE}
      title={title}
      titleColor={event.id ? 'copy' : 'grey600'}
      topActionButtons={[
        <ActionMenu key={event.id} eventId={event.id} onAction={onAction} />,
        <DownloadButton
          key={`DownloadButton-${eventIndex.id}`}
          event={eventIndex}
          isDraft={eventIndex.status === EventStatus.enum.CREATED}
        />
      ]}
    >
      <EventSummary
        event={flattenedEventIndex}
        eventConfiguration={eventConfiguration}
        flags={flags}
      />
      <EventHistory
        eventConfiguration={eventConfiguration}
        fullEvent={event}
        validatorContext={validatorContext}
      />
    </Content>
  )
}

/**
 * Renders the protected event overview page with PII hidden in the event summary
 */
function EventOverviewProtected({
  eventIndex,
  onAction
}: {
  eventIndex: EventIndex
  onAction: () => void
}) {
  const { eventConfiguration } = useEventConfiguration(eventIndex.type)
  const { status } = eventIndex
  const { getRemoteDraftByEventId } = useDrafts()
  const draft = getRemoteDraftByEventId(eventIndex.id)

  const eventWithDrafts = draft
    ? deepDropNulls(
        applyDraftToEventIndex(eventIndex, draft, eventConfiguration)
      )
    : eventIndex

  const { getUser } = useUsers()
  const intl = useIntl()

  const assignedToUser = getUser.useQuery(eventWithDrafts.assignedTo || '', {
    enabled: !!eventWithDrafts.assignedTo
  })
  const assignedTo = assignedToUser.data
    ? getUsersFullName(assignedToUser.data.name, intl.locale)
    : null

  const { flags, legalStatuses, potentialDuplicates, ...flattenedEventIndex } =
    {
      ...flattenEventIndex(eventWithDrafts),
      // drafts should not affect the status of the event
      // so the status and flags are taken from the eventIndex
      'event.status': status,
      'event.assignedTo': assignedTo,
      flags: eventIndex.flags
    }

  const { getEventTitle } = useEventTitle()
  const { title } = getEventTitle(eventConfiguration, eventWithDrafts)

  return (
    <Content
      icon={() => <IconWithName flags={flags} name={''} status={status} />}
      size={ContentSize.LARGE}
      title={title}
      titleColor={eventIndex.id ? 'copy' : 'grey600'}
      topActionButtons={[
        <ActionMenu
          key={eventIndex.id}
          eventId={eventIndex.id}
          onAction={onAction}
        />,
        <DownloadButton
          key={`DownloadButton-${eventIndex.id}`}
          event={eventIndex}
          isDraft={eventIndex.status === EventStatus.enum.CREATED}
        />
      ]}
    >
      <EventSummary
        hideSecuredFields
        event={flattenedEventIndex}
        eventConfiguration={eventConfiguration}
        flags={flags}
      />
      <EventHistorySkeleton />
    </Content>
  )
}

function EventOverviewContainer() {
  const params = useTypedParams(ROUTES.V2.EVENTS.OVERVIEW)
  const { searchEventById } = useEvents()
  const { getEvent } = useEvents()
  const { getUser } = useUsers()
  const users = getUser.getAllCached()
  const maybeAuth = useAuthentication()
  const authentication = getOrThrow(
    maybeAuth,
    'Authentication is not available but is required'
  )

  const locations = useSelector(getLocations)

  // Suspense query is not used here because we want to refetch when an event action is performed
  const getEventQuery = searchEventById.useQuery(params.eventId)
  const eventIndex = getEventQuery.data?.results[0]
  const fullEvent = getEvent.findFromCache(params.eventId).data

  if (!eventIndex) {
    return
  }
  const assignmentStatus = getAssignmentStatus(eventIndex, authentication.sub)

  const shouldShowFullOverview =
    fullEvent && assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF

  return (
    <EventOverviewProvider locations={locations} users={users}>
      {eventIndex.potentialDuplicates.length > 0 && (
        <DuplicateWarning
          duplicateTrackingIds={eventIndex.potentialDuplicates.map(
            ({ trackingId }) => trackingId
          )}
        />
      )}
      {shouldShowFullOverview ? (
        <EventOverviewFull event={fullEvent} onAction={getEventQuery.refetch} />
      ) : (
        <EventOverviewProtected
          eventIndex={eventIndex}
          onAction={getEventQuery.refetch}
        />
      )}
    </EventOverviewProvider>
  )
}

export const EventOverviewIndex = withSuspense(EventOverviewContainer)
