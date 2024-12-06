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
import { useNavigate } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { History } from '@client/utils/gateway'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents'
import { EventSummary } from './components/EventSummary'
import { EventHistory } from './components/EventHistory'
import { EventConfig } from '@opencrvs/commons/client'

/**
 * Based on packages/client/src/views/RecordAudit/RecordAudit.tsx
 *
 */

export const EventOverviewIndex = () => {
  const params = useTypedParams(ROUTES.V2.EVENTS.EVENT)
  const foo = useEvents()

  const { data } = foo.getEvents.useQuery()

  const event = data?.find((event) => event.id === params.eventId)

  if (!event) {
    return null
  }

  return <EventOverview event={event} />
}

/**
 * Renders the event overview page, including the event summary and history.
 */
function EventOverview({ event }: { event: any }) {
  const actions: React.ReactElement[] = []
  const desktopActionsView: React.ReactElement[] = []

  desktopActionsView.push(actions[actions.length - 1])

  return (
    <Content
      title={event.id || 'no name'}
      titleColor={event.name ? 'copy' : 'grey600'}
      size={ContentSize.LARGE}
      topActionButtons={desktopActionsView}
      icon={() => <IconWithName status={'orange'} name={event.event} />}
    >
      <EventSummary event={event} />
      <EventHistory event={event} />
    </Content>
  )
}
