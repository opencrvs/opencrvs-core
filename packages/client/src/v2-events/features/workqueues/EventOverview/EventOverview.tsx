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
  SummaryConfig,
  FieldValue,
  getCurrentEventStateWithDrafts,
  EventDocument,
  Draft,
  getCurrentEventState,
  getDeclarationFields,
  getAcceptedActions
} from '@opencrvs/commons/client'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { ROUTES } from '@client/v2-events/routes'

import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { getLocations } from '@client/offline/selectors'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import {
  flattenEventIndex,
  getUserIdsFromActions
} from '@client/v2-events/utils'
import { useFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { RecursiveStringRecord } from '@client/v2-events/hooks/useSimpleFieldStringifier'
import { EventHistory } from './components/EventHistory'
import { EventSummary } from './components/EventSummary'

import { ActionMenu } from './components/ActionMenu'
import { EventOverviewProvider } from './EventOverviewContext'

/**
 * File is based on packages/client/src/views/RecordAudit/RecordAudit.tsx
 */

/**
 * Renders the event overview page, including the event summary and history.
 */
function EventOverview({
  event,
  drafts,
  summary
}: {
  drafts: Draft[]
  event: EventDocument
  summary: SummaryConfig
}) {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const allFields = getDeclarationFields(eventConfiguration)
  const intl = useIntlFormatMessageWithFlattenedParams()

  const eventWithDrafts = getCurrentEventStateWithDrafts(event, drafts)
  const eventIndex = getCurrentEventState(event)
  const { trackingId, status, registrationNumber } = eventIndex

  const stringifyFormData = useFormDataStringifier()
  const eventWithDefaults = stringifyFormData(
    allFields,
    eventWithDrafts.declaration
  )

  const flattenedEventIndex: Record<
    string,
    FieldValue | null | RecursiveStringRecord
  > = {
    ...flattenEventIndex({ ...eventIndex, declaration: eventWithDefaults }),
    // @TODO: Ask why these are defined outside of flatten index?
    'event.trackingId': trackingId,
    'event.status': status,
    'event.registrationNumber': registrationNumber
  }

  const title = intl.formatMessage(summary.title.label, flattenedEventIndex)
  const fallbackTitle = summary.title.emptyValueMessage
    ? intl.formatMessage(summary.title.emptyValueMessage)
    : ''

  const actions = getAcceptedActions(event)

  return (
    <Content
      icon={() => <IconWithName name={''} status={status} />}
      size={ContentSize.LARGE}
      title={title || fallbackTitle}
      titleColor={event.id ? 'copy' : 'grey600'}
      topActionButtons={[<ActionMenu key={event.id} eventId={event.id} />]}
    >
      <EventSummary
        event={flattenedEventIndex}
        eventLabel={eventConfiguration.label}
        summary={summary}
      />
      <EventHistory history={actions} />
    </Content>
  )
}

function EventOverviewContainer() {
  const params = useTypedParams(ROUTES.V2.EVENTS.OVERVIEW)
  const { getEvent } = useEvents()
  const { getRemoteDrafts } = useDrafts()
  const { getUsers } = useUsers()

  const [fullEvent] = getEvent.useSuspenseQuery(params.eventId)
  const drafts = getRemoteDrafts()
  const { eventConfiguration: config } = useEventConfiguration(fullEvent.type)

  const activeActions = getAcceptedActions(fullEvent)
  const userIds = getUserIdsFromActions(activeActions)
  const [users] = getUsers.useSuspenseQuery(userIds)
  const locations = useSelector(getLocations)

  return (
    <EventOverviewProvider locations={locations} users={users}>
      <EventOverview
        drafts={drafts}
        event={fullEvent}
        summary={config.summary}
      />
    </EventOverviewProvider>
  )
}

export const EventOverviewIndex = withSuspense(EventOverviewContainer)
