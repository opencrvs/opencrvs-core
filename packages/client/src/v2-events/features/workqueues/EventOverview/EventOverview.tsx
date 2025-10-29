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
import {
  EventDocument,
  getCurrentEventState,
  dangerouslyGetCurrentEventStateWithDrafts,
  EventIndex,
  applyDraftToEventIndex,
  deepDropNulls,
  getOrThrow
} from '@opencrvs/commons/client'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { ROUTES } from '@client/v2-events/routes'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import {
  AssignmentStatus,
  getAssignmentStatus,
  flattenEventIndex,
  getUsersFullName
} from '@client/v2-events/utils'
import { useEventTitle } from '@client/v2-events/features/events/useEvents/useEventTitle'
import { useAuthentication } from '@client/utils/userUtils'
import { useDrafts } from '../../drafts/useDrafts'
import { DuplicateWarning } from '../../events/actions/dedup/DuplicateWarning'
import { EventSummary } from './components/EventSummary'

/**
 * Renders the event overview page which shows a summary of the event.
 */
function EventOverviewFull({ event }: { event: EventDocument }) {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const eventIndex = getCurrentEventState(event, eventConfiguration)
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
    >
      <EventSummary
        event={flattenedEventIndex}
        eventConfiguration={eventConfiguration}
        flags={flags}
      />
    </Content>
  )
}

/**
 * Renders the protected event overview page with PII hidden in the event summary
 */
function EventOverviewProtected({ eventIndex }: { eventIndex: EventIndex }) {
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
    >
      <EventSummary
        hideSecuredFields
        event={flattenedEventIndex}
        eventConfiguration={eventConfiguration}
        flags={flags}
      />
    </Content>
  )
}

function EventOverviewContainer() {
  const params = useTypedParams(ROUTES.V2.EVENTS.OVERVIEW)
  const { searchEventById } = useEvents()
  const { getEvent } = useEvents()
  const maybeAuth = useAuthentication()
  const authentication = getOrThrow(
    maybeAuth,
    'Authentication is not available but is required'
  )

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
    <>
      {eventIndex.potentialDuplicates.length > 0 && (
        <DuplicateWarning
          duplicateTrackingIds={eventIndex.potentialDuplicates.map(
            ({ trackingId }) => trackingId
          )}
        />
      )}
      {shouldShowFullOverview ? (
        <EventOverviewFull event={fullEvent} />
      ) : (
        <EventOverviewProtected
          eventIndex={eventIndex}
          // TODO CIHAN: do we need this in new one?
          // onAction={getEventQuery.refetch}
        />
      )}
    </>
  )
}

export const EventOverviewIndex = withSuspense(EventOverviewContainer)
