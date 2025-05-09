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
import {
  createEmptyDraft,
  findActiveDrafts,
  getCurrentEventStateWithDrafts,
  getActionAnnotation,
  DeclarationUpdateActionType,
  ActionType,
  Action
} from '@opencrvs/commons/client'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'

import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { createTemporaryId } from '@client/v2-events/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { NavigationStack } from '@client/v2-events/components/NavigationStack'

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
  const params = useTypedParams(ROUTES.V2.EVENTS.DECLARE.PAGES)

  const { getEvent } = useEvents()

  const { setLocalDraft, getLocalDraftOrDefault, getRemoteDrafts } = useDrafts()

  const [event] = getEvent.useSuspenseQuery(params.eventId)

  const drafts = getRemoteDrafts()
  const activeDraft = findActiveDrafts(event, drafts)[0]
  const localDraft = getLocalDraftOrDefault(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    activeDraft ||
      createEmptyDraft(params.eventId, createTemporaryId(), actionType)
  )

  /*
   * Keep the local draft updated as per the form changes
   */
  const formValues = useEventFormData((state) => state.formValues)
  const annotation = useActionAnnotation((state) => state.annotation)

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

  const setInitialAnnotation = useActionAnnotation(
    (state) => state.setInitialAnnotation
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

  const eventStateWithDrafts = useMemo(
    () => getCurrentEventStateWithDrafts(event, eventDrafts),
    [eventDrafts, event]
  )

  const initialForm = useEventFormData((state) =>
    state.getFormValues(eventStateWithDrafts.declaration)
  )

  const actionAnnotation = useMemo(() => {
    return getActionAnnotation({
      event,
      actionType,
      drafts: eventDrafts
    })
  }, [eventDrafts, event, actionType])

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
    setFormValues(initialForm)
    setInitialAnnotation({ ...previousActionAnnotation, ...actionAnnotation })

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

  return <NavigationStack>{children}</NavigationStack>
}

export const DeclarationAction = withSuspense(DeclarationActionComponent)
