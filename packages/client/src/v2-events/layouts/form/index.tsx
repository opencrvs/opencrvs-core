import React from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'

import { Frame, Spinner } from '@opencrvs/components'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { FormHeader } from './FormHeader'

type AllowedRoute =
  | typeof ROUTES.V2.EVENTS.REGISTER
  | typeof ROUTES.V2.EVENTS.DECLARE

/**
 * Layout for form and review pages.
 *
 */
export function FormLayout({
  route,
  children
}: {
  route: AllowedRoute
  children: React.ReactNode
}) {
  const { eventId } = useTypedParams(route)
  const events = useEvents()

  const [event] = events.getEvent(eventId)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  if (!configuration) {
    throw new Error('Event configuration not found')
  }

  return (
    <Frame
      header={<FormHeader label={configuration.label} />}
      skipToContentText="Skip to form"
    >
      <React.Suspense fallback={<Spinner id="event-form-spinner" />}>
        {children}
      </React.Suspense>
    </Frame>
  )
}
