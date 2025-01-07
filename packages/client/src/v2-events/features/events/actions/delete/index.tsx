import React, { useEffect } from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'

export function DeleteEvent() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DELETE)
  const navigate = useNavigate()
  const events = useEvents()
  const deleteEvent = events.deleteEvent

  useEffect(() => {
    deleteEvent.mutate({ eventId })
    navigate(ROUTES.V2.path)
  }, [deleteEvent, eventId, navigate])

  return <div />
}
