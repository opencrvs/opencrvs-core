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

import { Frame, Spinner } from '@opencrvs/components'
import { ActionType } from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { FormHeader } from './FormHeader'
import { AllowedRouteWithEventId } from './utils'

/**
 * Layout for form and review pages.
 *
 */
export function FormLayout({
  action,
  route,
  children,
  onSaveAndExit
}: {
  action: ActionType
  route: AllowedRouteWithEventId
  children: React.ReactNode
  onSaveAndExit?: () => void
}) {
  const { eventId } = useTypedParams(route)
  const events = useEvents()
  const [event] = events.getEvent.useSuspenseQuery(eventId)
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const page = configuration.actions.find((x) => x.type === action)
  if (!page) {
    throw new Error('Form page not found')
  }

  return (
    <Frame
      header={
        <FormHeader
          action={action}
          label={configuration.label}
          route={route}
          onSaveAndExit={onSaveAndExit}
        />
      }
      skipToContentText="Skip to form"
    >
      <React.Suspense fallback={<Spinner id="event-form-spinner" />}>
        {children}
      </React.Suspense>
    </Frame>
  )
}
