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
  Draft,
  createEmptyDraft,
  findActiveDraftForEvent,
  dangerouslyGetCurrentEventStateWithDrafts,
  getActionAnnotation,
  DeclarationUpdateActionType,
  ActionType,
  Action,
  deepMerge,
  getUUID,
  mergeDrafts
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

type Props = PropsWithChildren<{ actionType: DeclarationUpdateActionType }>

function getPreviousDeclarationActionType(
  actions: Action[],
  currentActionType: DeclarationUpdateActionType
): DeclarationUpdateActionType | undefined {
  // If action type is DECLARE, there is no previous declaration action
  if (currentActionType === ActionType.DECLARE) {
    return
  }

  // If action type is VALIDATE, we know that the previous declaration action is DECLARE
  if (currentActionType === ActionType.VALIDATE) {
    return ActionType.DECLARE
  }

  // If action type is REGISTER, we know that the previous declaration action is VALIDATE
  if (currentActionType === ActionType.REGISTER) {
    return ActionType.VALIDATE
  }

  // If action type is REQUEST_CORRECTION, we want to get the 'latest' action type
  // Check for the most recent action type in order of precedence
  const actionTypes = [
    ActionType.REGISTER,
    ActionType.VALIDATE,
    ActionType.DECLARE
  ]

  for (const type of actionTypes) {
    if (actions.find((a) => a.type === type)) {
      return type
    }
  }

  return
}

/**
 * Creates a wrapper component for the declaration action.
 * Manages the state of the declaration action and its local draft.
 *
 * Declaration action modifies the declaration. The action can add annotation to the declaration.
 * Declaration action is triggered only once. Declaration state is generated from series of declaration actions and drafts.
 *
 * This differs from AnnotationAction, which modify the annotation, and can be triggered multiple times.
 */
function DeclarationActionComponent({ children, actionType }: Props) {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.PAGES)

  const events = useEvents()
  const navigate = useNavigate()
  const { setLocalDraft, getLocalDraftOrDefault, getRemoteDraftByEventId } =
    useDrafts()

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

  const remoteDraft: Draft | undefined = getRemoteDraftByEventId(event.id)

  const activeRemoteDraft = remoteDraft
    ? findActiveDraftForEvent(event, remoteDraft)
    : undefined

  const localDraft = getLocalDraftOrDefault(
    activeRemoteDraft
      ? // new transactionId must be generated for the draft to be saved. Otherwise it will hit the "idempotency wall"
        { ...activeRemoteDraft, transactionId: getUUID() }
      : createEmptyDraft(eventId, createTemporaryId(), actionType)
  )

  /*
   * Keep the local draft updated as per the form changes
   */
  const currentDeclaration = useEventFormData((state) => state.formValues)
  const currentAnnotation = useActionAnnotation((state) => state.annotation)
  const clearForm = useEventFormData((state) => state.clear)
  const clearAnnotation = useActionAnnotation((state) => state.clear)

  useEffect(() => {
    if (!currentDeclaration || !currentAnnotation) {
      return
    }

    setLocalDraft({
      ...localDraft,
      eventId: event.id,
      action: {
        ...localDraft.action,
        declaration: currentDeclaration,
        annotation: currentAnnotation
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDeclaration, currentAnnotation])

  /*
   * Initialize the form state
   */
  const setFormValues = useEventFormData((state) => state.setFormValues)
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

  const mergedDraft: Draft = activeRemoteDraft
    ? mergeDrafts(activeRemoteDraft, localDraftWithAdjustedTimestamp)
    : localDraftWithAdjustedTimestamp

  const eventStateWithDrafts = useMemo(
    () =>
      dangerouslyGetCurrentEventStateWithDrafts({
        event,
        draft: mergedDraft,
        configuration
      }),
    [mergedDraft, event, configuration]
  )

  const actionAnnotation = useMemo(() => {
    return getActionAnnotation({
      event,
      actionType,
      draft: mergedDraft
    })
  }, [mergedDraft, event, actionType])

  const previousActionAnnotation = useMemo(() => {
    const previousActionType = getPreviousDeclarationActionType(
      event.actions,
      actionType
    )

    if (!previousActionType) {
      return {}
    }

    const prevActionAnnotation = getActionAnnotation({
      event,
      actionType: previousActionType
    })

    // If we found annotation data from the previous action, use that.
    if (Object.keys(prevActionAnnotation).length) {
      return prevActionAnnotation
    }

    // As a fallback, lets see if there is a notify action annotation and use that.
    return getActionAnnotation({
      event,
      actionType: ActionType.NOTIFY
    })
  }, [event, actionType])

  useEffect(() => {
    // Use the form values from the zustand state, so that filled form state is not lost
    // If user e.g. enters the 'screen lock' flow while filling form.
    // Then use form values from drafts.
    const initialFormValues = deepMerge(
      currentDeclaration || {},
      eventStateWithDrafts.declaration
    )

    setFormValues(initialFormValues)

    const initialAnnotation = deepMerge(
      deepMerge(currentAnnotation || {}, previousActionAnnotation),
      actionAnnotation
    )

    setAnnotation(initialAnnotation)

    /*
     * This is fine to only run once on mount and unmount as
     * At the point of this code being run, there absolutely must be an event that has already been
     * fetched of which data can be used to initialise the form
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <NavigationStack>{children}</NavigationStack>
}

export const DeclarationAction = withSuspense(DeclarationActionComponent)
