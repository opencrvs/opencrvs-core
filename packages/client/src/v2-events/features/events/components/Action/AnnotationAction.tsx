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

import React, { PropsWithChildren, useEffect } from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  ActionType,
  createEmptyDraft,
  deepMerge,
  findActiveDraftForEvent,
  deepDropNulls,
  mergeDrafts
} from '@opencrvs/commons/client'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { createTemporaryId } from '@client/v2-events/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { NavigationStack } from '@client/v2-events/components/NavigationStack'

type Props = PropsWithChildren<{ actionType: Exclude<ActionType, 'DELETE'> }>

/**
 * Creates a wrapper component for the annotation action.
 * Manages the state of the annotation action and its local draft.
 *
 * Annotation is always specific to the action. Annotation action does not modify declaration.
 * Annotation action can be triggered multiple times. Annotation state should be based on draft, if available.
 * Annotation action is always an "independent" action, and should not base its state on previous action of same type.
 *
 * This differs from DeclarationAction, which is a series of one-time actions that modify the declaration.
 */
function AnnotationActionComponent({ children, actionType }: Props) {
  const params = useTypedParams(ROUTES.V2.EVENTS.DECLARE.PAGES)

  const { getEvent } = useEvents()

  const { setLocalDraft, getLocalDraftOrDefault, useGetRemoteDraftByEventId } =
    useDrafts()

  const event = getEvent.useGetEventFromCache(params.eventId)
  const remoteDraft = useGetRemoteDraftByEventId(event.id)

  const activeRemoteDraft = remoteDraft
    ? findActiveDraftForEvent(event, remoteDraft)
    : undefined

  const localDraft = getLocalDraftOrDefault(
    activeRemoteDraft ||
      createEmptyDraft(params.eventId, createTemporaryId(), actionType)
  )

  const annotation = useActionAnnotation((state) => state.annotation)

  useEffect(() => {
    if (!annotation) {
      return
    }

    setLocalDraft({
      ...localDraft,
      eventId: event.id,
      action: {
        ...localDraft.action,
        annotation
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotation])

  /*
   * Initialize the form state
   */
  const setAnnotation = useActionAnnotation((state) => state.setAnnotation)

  const localDraftWithAdjustedTimestamp = {
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
  }

  const mergedDraft = activeRemoteDraft
    ? mergeDrafts(activeRemoteDraft, localDraftWithAdjustedTimestamp)
    : localDraftWithAdjustedTimestamp

  const actionAnnotation = deepDropNulls(mergedDraft.action.annotation)

  useEffect(() => {
    // Use the annotation values from the zustand state, so that filled form state is not lost
    // If user e.g. enters the 'screen lock' flow while filling form.
    // Then use annotation values from drafts.
    const initialAnnotation = deepMerge(annotation || {}, actionAnnotation)

    setAnnotation(initialAnnotation)

    /*
     * This is fine to only run once on mount and unmount as
     * At the point of this code being run, there absolutely must be an event that has already been
     * fetched of which data can be used to initialise the form
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return children
}

export const AnnotationAction = withSuspense((props: Props) => {
  return (
    <NavigationStack>
      <AnnotationActionComponent {...props} />
    </NavigationStack>
  )
})
