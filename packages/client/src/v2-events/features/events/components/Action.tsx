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
  ActionType,
  getCurrentEventStateWithDrafts,
  getMetadataForAction,
  ActionFormData
} from '@opencrvs/commons/client'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventMetadata } from '@client/v2-events/features/events/useEventMeta'

import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { createTemporaryId } from '@client/v2-events/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'

type Props = PropsWithChildren<{ type: ActionType }>
function ActionComponent({ children, type }: Props) {
  const params = useTypedParams(ROUTES.V2.EVENTS.DECLARE.PAGES)

  const { getEvent } = useEvents()

  const { setLocalDraft, getLocalDraftOrDefault, getRemoteDrafts } = useDrafts()

  const drafts = getRemoteDrafts()

  const [event] = getEvent.useSuspenseQuery(params.eventId)

  const localDraft = getLocalDraftOrDefault({
    id: createTemporaryId(),
    eventId: params.eventId,
    createdAt: new Date().toISOString(),
    transactionId: createTemporaryId(),
    action: {
      type,
      data: {},
      metadata: {},
      createdAt: new Date().toISOString(),
      createdBy: '@todo',
      createdAtLocation: '@todo'
    }
  })

  /*
   * Keep the local draft updated as per the form changes
   */
  const formValues = useEventFormData((state) => state.getFormValues())
  const metadataValues = useEventMetadata((state) =>
    state.getMetadataFormValues(
      event.id,
      getMetadataForAction({
        event,
        actionType: ActionType.DECLARE,
        draftsForEvent: []
      })
    )
  )

  useEffect(() => {
    setLocalDraft({
      ...localDraft,
      eventId: event.id,
      action: {
        ...localDraft.action,
        data: formValues,
        metadata: metadataValues
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, metadataValues])

  /*
   * Initialize the form state
   */

  const setInitialFormValues = useEventFormData(
    (state) => state.setInitialFormValues
  )

  const setInitialMetadataValues = useEventMetadata(
    (state) => state.setMetadataFormValues
  )

  const eventDrafts = drafts
    .filter((d) => d.eventId === event.id)
    .concat({
      ...localDraft,
      /*
       * Force the local draft always to be the latest
       * This is to prevent a situation where the local draft gets created,
       * then a CREATE action request finishes in the background and is stored with a later
       * timestamp
       */
      createdAt: new Date().toISOString(),
      /*
       * If params.eventId changes (from tmp id to concrete id) then change the local draft id
       */
      eventId: event.id,
      action: {
        ...localDraft.action,
        createdAt: new Date().toISOString()
      }
    })

  const eventDataWithDrafts = useMemo(
    () => getCurrentEventStateWithDrafts(event, eventDrafts),
    [eventDrafts, event]
  )

  const declareMetadata = useMemo(() => {
    return getMetadataForAction({
      event,
      actionType: ActionType.DECLARE,
      draftsForEvent: eventDrafts
    })
  }, [eventDrafts, event])

  useEffect(() => {
    setInitialFormValues(eventDataWithDrafts.data)
    // @TODO: Check this should not need casting
    setInitialMetadataValues(event.id, declareMetadata as ActionFormData)

    return () => {
      /*
       * When user leaves the action, remove all
       * staged drafts the user has for this event id and type
       */
      setLocalDraft(null)
    }

    /*
     * This is fine to only run once on mount and unmount as
     * At the point of this code being run, there absolutely must be an event that has already been
     * fetched of which data can be used to initialise the form
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return children
}

export const Action = withSuspense(ActionComponent)
