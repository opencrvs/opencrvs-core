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
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { noop } from '@client/v2-events'
import { FormHeader } from './FormHeader'

type AllowedRoute =
  | typeof ROUTES.V2.EVENTS.REGISTER
  | typeof ROUTES.V2.EVENTS.DECLARE
  | typeof ROUTES.V2.EVENTS.REQUEST_CORRECTION

/**
 * Layout for form and review pages.
 *
 */
export function FormLayout({
  route,
  children,
  onSaveAndExit,
  canSaveAndExit
}: {
  route: AllowedRoute
  children: React.ReactNode
  onSaveAndExit?: () => void
  canSaveAndExit?: boolean
}) {
  const { eventId } = useTypedParams(route)
  const events = useEvents()

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  return (
    <Frame
      header={
        <FormHeader
          canSaveAndExit={canSaveAndExit}
          label={configuration.label}
          onSaveAndExit={onSaveAndExit || noop}
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
