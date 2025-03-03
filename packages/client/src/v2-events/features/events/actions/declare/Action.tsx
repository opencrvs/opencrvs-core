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

import { PropsWithChildren, useEffect, useMemo } from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  useLocation,
  useMatches,
  useNavigate,
  useViewTransitionState
} from 'react-router-dom'
import {
  ActionType,
  getCurrentEventStateWithDrafts,
  getMetadataForAction
} from '@opencrvs/commons/client'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventMetadata } from '@client/v2-events/features/events/useEventMeta'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'

export function Action({ children }: PropsWithChildren) {
  const params = useTypedParams(ROUTES.V2.EVENTS.DECLARE.PAGES)
  const { getEvent, getDrafts } = useEvents()
  const setFormValues = useEventFormData((state) => state.setFormValuesIfEmpty)
  const clearFormValues = useEventFormData((state) => state.clear)
  const setMetadata = useEventMetadata((state) => state.setMetadata)
  const clearMetadata = useEventMetadata((state) => state.clear)

  const [event] = getEvent.useSuspenseQuery(params.eventId)
  const drafts = getDrafts()
  const draftsForThisEvent = useMemo(
    () => drafts.filter((d) => d.eventId === event.id),
    [drafts, event.id]
  )

  const eventDataWithDrafts = useMemo(
    () => getCurrentEventStateWithDrafts(event, draftsForThisEvent),
    [draftsForThisEvent, event]
  )

  const declareMetadata = useMemo(() => {
    return getMetadataForAction(event, ActionType.DECLARE, draftsForThisEvent)
  }, [draftsForThisEvent, event])

  useEffect(() => {
    setFormValues(eventDataWithDrafts.id, eventDataWithDrafts.data)
    setMetadata(eventDataWithDrafts.id, declareMetadata)

    return () => {
      clearFormValues()
      clearMetadata()
    }
  }, [
    clearFormValues,
    clearMetadata,
    declareMetadata,
    eventDataWithDrafts.data,
    eventDataWithDrafts.id,
    setFormValues,
    setMetadata
  ])

  return children
}
