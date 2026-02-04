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
import { useTheme } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { EventConfig, EventIndex } from '@opencrvs/commons/client'
import { useWindowSize } from '@opencrvs/components/src/hooks'
import { Link as TextButton } from '@opencrvs/components'
import { IconWithName } from '@client/v2-events/components/IconWithName'
import { IconWithNameEvent } from '@client/v2-events/components/IconWithNameEvent'
import { ROUTES } from '@client/v2-events/routes'
import { useEventTitle } from '../../useEvents/useEventTitle'
import { ExtendedEventStatuses } from './utils'

export function SearchResultItemTitle({
  event,
  localEventStatus,
  eventConfig,
  redirectParam
}: {
  event: EventIndex
  localEventStatus: EventIndex['status'] | keyof typeof ExtendedEventStatuses
  eventConfig: EventConfig
  redirectParam?: string
}) {
  const theme = useTheme()
  const { width } = useWindowSize()
  const navigate = useNavigate()
  const { getEventTitle } = useEventTitle()
  const { title, useFallbackTitle } = getEventTitle(
    eventConfig,
    event as EventIndex
  )

  const isWideScreen = width > theme.grid.breakpoints.lg
  const renderIconWithName = () =>
    isWideScreen ? (
      <IconWithName flags={event.flags} name={title} status={event.status} />
    ) : (
      <IconWithNameEvent
        event={event.type}
        flags={event.flags}
        name={title}
        status={event.status}
      />
    )

  if (
    localEventStatus === ExtendedEventStatuses.OUTBOX ||
    localEventStatus === ExtendedEventStatuses.DRAFT
  ) {
    return renderIconWithName()
  }

  return (
    <TextButton
      color={useFallbackTitle ? 'red' : 'primary'}
      onClick={() => {
        navigate(
          ROUTES.V2.EVENTS.EVENT.buildPath(
            { eventId: event.id },
            { workqueue: redirectParam }
          )
        )
      }}
    >
      {renderIconWithName()}
    </TextButton>
  )
}
