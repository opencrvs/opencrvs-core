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

import React, { PropsWithChildren, useEffect, useMemo } from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { useNavigate } from 'react-router-dom'
import {
  createEmptyDraft,
  findActiveDrafts,
  getCurrentEventStateWithDrafts,
  getActionAnnotation,
  deepMerge,
  ActionType,
  getAnnotationFromDrafts,
  isMetaAction
} from '@opencrvs/commons/client'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { createTemporaryId } from '@client/v2-events/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { NavigationStack } from '@client/v2-events/components/NavigationStack'
import { useEventConfiguration } from '../../useEventConfiguration'
import { getEventDrafts } from './utils'

/**
 * Creates a wrapper component for correction actions.
 */
function CorrectionActionComponent({ children }: PropsWithChildren) {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REQUEST_CORRECTION)

  const events = useEvents()
  const navigate = useNavigate()
  const { setLocalDraft, getLocalDraftOrDefault, getRemoteDrafts } = useDrafts()

  const event = events.getEvent.findFromCache(eventId).data

  useEffect(() => {
    if (!event) {
      // eslint-disable-next-line no-console
      console.warn(
        `Event with id ${eventId} not found in cache. Redirecting to overview.`
      )
      return navigate(ROUTES.V2.EVENTS.OVERVIEW.buildPath({ eventId: eventId }))
    }
  }, [event, eventId, navigate])

  if (!event) {
    return <div />
  }

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const writeActions = event.actions.filter((a) => !isMetaAction(a.type))
  const lastWriteAction = writeActions[writeActions.length - 1]
  const isLastActionCorrectionRequest =
    lastWriteAction.type === ActionType.REQUEST_CORRECTION

  const drafts = getRemoteDrafts(event.id)
  const activeDraft = findActiveDrafts(event, drafts)[0]

  const localDraft = getLocalDraftOrDefault(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    activeDraft ||
      createEmptyDraft(
        eventId,
        createTemporaryId(),
        ActionType.REQUEST_CORRECTION
      )
  )

  /*
   * Keep the local draft updated as per the form changes
   */
  const formValues = useEventFormData((state) => state.formValues)
  const annotation = useActionAnnotation((state) => state.annotation)
  const clearForm = useEventFormData((state) => state.clear)
  const clearAnnotation = useActionAnnotation((state) => state.clear)

  useEffect(() => {
    if (!formValues || !annotation) {
      return
    }

    setLocalDraft({
      ...localDraft,
      eventId: event.id,
      action: {
        ...localDraft.action,
        declaration: formValues,
        annotation
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, annotation])

  /*
   * Initialize the form state
   */
  const setFormValues = useEventFormData((state) => state.setFormValues)
  const setAnnotation = useActionAnnotation((state) => state.setAnnotation)

  const eventDrafts = getEventDrafts(event.id, localDraft, drafts)

  const eventStateWithDrafts = useMemo(
    () =>
      getCurrentEventStateWithDrafts({
        event,
        drafts: eventDrafts,
        configuration
      }),
    [eventDrafts, event, configuration]
  )

  // const actionAnnotation = useMemo(() => {
  //   return getActionAnnotation({
  //     event,
  //     actionType: ActionType.REQUEST_CORRECTION,
  //     drafts: eventDrafts
  //   })
  // }, [eventDrafts, event])

  const actionAnnotation = useMemo(() => {
    if (isLastActionCorrectionRequest) {
      return getActionAnnotation({
        event,
        actionType: ActionType.REQUEST_CORRECTION,
        drafts: eventDrafts
      })
    }

    return getAnnotationFromDrafts(eventDrafts)
  }, [eventDrafts, event, isLastActionCorrectionRequest])

  useEffect(() => {
    // Use the form values from the zustand state, so that filled form state is not lost
    // If user e.g. enters the 'screen lock' flow while filling form.
    // Then use form values from drafts.
    const initialFormValues = deepMerge(
      formValues || {},
      eventStateWithDrafts.declaration
    )

    setFormValues(initialFormValues)

    const initialAnnotation = deepMerge(annotation || {}, actionAnnotation)
    setAnnotation(initialAnnotation)

    return () => {
      /*
       * When user leaves the action, remove all
       * staged drafts the user has for this event id and type
       */
      setLocalDraft(null)
      clearForm()
      clearAnnotation()
    }

    /*
     * This is fine to only run once on mount and unmount as
     * At the point of this code being run, there absolutely must be an event that has already been
     * fetched of which data can be used to initialise the form
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <NavigationStack>{children}</NavigationStack>
}

export const CorrectionAction = withSuspense(CorrectionActionComponent)
