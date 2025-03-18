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
  getAllFields,
  SummaryConfig,
  FieldValue,
  getCurrentEventStateWithDrafts,
  EventDocument,
  Draft,
  getCurrentEventState,
  EventStatus
} from '@opencrvs/commons/client'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { ROUTES } from '@client/v2-events/routes'

import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { setEmptyValuesForFields } from '@client/v2-events/components/forms/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { useUsers } from '@client/v2-events/hooks/useUsers'
// eslint-disable-next-line no-restricted-imports
import { getLocations } from '@client/offline/selectors'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { getUserIdsFromActions } from '@client/v2-events/utils'
import {
  RecursiveStringRecord,
  useFormDataStringifier
} from '@client/v2-events/hooks/useFormDataStringifier'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { EventHistory } from './components/EventHistory'
import { EventSummary } from './components/EventSummary'

import { ActionMenu } from './components/ActionMenu'
import { EventOverviewProvider } from './EventOverviewContext'

/**
 * Based on packages/client/src/views/RecordAudit/RecordAudit.tsx
 */

function EventOverviewContainer() {
  const params = useTypedParams(ROUTES.V2.EVENTS.OVERVIEW)
  const { getEvent } = useEvents()
  const { getRemoteDrafts } = useDrafts()
  const { getUsers } = useUsers()

  const [fullEvent] = getEvent.useSuspenseQuery(params.eventId)
  const drafts = getRemoteDrafts()
  const { eventConfiguration: config } = useEventConfiguration(fullEvent.type)

  const userIds = getUserIdsFromActions(fullEvent.actions)
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

function getDefaultFieldValues(trackingId: string, status: EventStatus) {
  return {
    'event.trackingId': trackingId,
    'event.status': status
  }
}

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
  const allFields = getAllFields(eventConfiguration)
  const intl = useIntlFormatMessageWithFlattenedParams()

  const eventWithDrafts = getCurrentEventStateWithDrafts(event, drafts)
  const eventIndex = getCurrentEventState(event)
  const { trackingId, status } = eventIndex

  const stringifyFormData = useFormDataStringifier()
  const emptyEvent = setEmptyValuesForFields(getAllFields(eventConfiguration))
  const eventWithDefaults = stringifyFormData(allFields, {
    ...emptyEvent,
    ...eventWithDrafts.data
  })

  const flattenedEventIndex: Record<
    string,
    FieldValue | null | RecursiveStringRecord
  > = {
    ...emptyEvent,
    ...eventWithDefaults,
    ...getDefaultFieldValues(trackingId, status)
  }

  const title = intl.formatMessage(summary.title.label, flattenedEventIndex)
  const fallbackTitle = summary.title.emptyValueMessage
    ? intl.formatMessage(summary.title.emptyValueMessage)
    : ''
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
      <EventHistory history={event.actions} />
    </Content>
  )
}

export const EventOverviewIndex = withSuspense(EventOverviewContainer)
