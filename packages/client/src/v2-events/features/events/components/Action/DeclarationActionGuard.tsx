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
import { useSelector } from 'react-redux'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { useNavigate } from 'react-router-dom'
import {
  ACTION_ALLOWED_SCOPES,
  DeclarationActions,
  DeclarationActionType,
  EventIndex,
  getAvailableActionsForEvent,
  getCurrentEventState,
  getOrThrow,
  hasAnyOfScopes
} from '@opencrvs/commons/client'
import { getScope } from '@client/profile/profileSelectors'
import { ROUTES } from '../../../../routes'
import { useEvents } from '../../useEvents/useEvents'
import { useEventConfiguration } from '../../useEventConfiguration'

interface AccessGuardProps {
  children: React.ReactNode
  actionType: DeclarationActionType
}

function getDeclarationRoute(actionType: DeclarationActionType) {
  switch (actionType) {
    case DeclarationActions.enum.DECLARE:
      return ROUTES.V2.EVENTS.DECLARE
    case DeclarationActions.enum.VALIDATE:
      return ROUTES.V2.EVENTS.VALIDATE
    case DeclarationActions.enum.REGISTER:
      return ROUTES.V2.EVENTS.REGISTER
    default:
      throw new Error(`Unknown action type: ${actionType}`)
  }
}
/**
 * Enforces access control for actions based on user permissions and event status.
 * Prevent intentional or accidental access to actions that the user cannot perform or that are not applicable to the current event.
 */
export function DeclarationActionGuard({
  children,
  actionType
}: AccessGuardProps) {
  // const navigate = useNavigate()
  const userScopes = useSelector(getScope) ?? []

  const route = getDeclarationRoute(actionType)
  const { eventId } = useTypedParams(route)
  const events = useEvents()

  const event = getOrThrow(
    events.getEvent.findFromCache(eventId).data,
    'Event not found'
  )

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const eventState = getCurrentEventState(event, configuration)

  const availableActions = getAvailableActionsForEvent(eventState)

  const isActionAllowed = availableActions.includes(actionType)
  if (!isActionAllowed) {
    // If the action is not available for the event, redirect to the ovrerview page
    throw new Error(
      `Action ${actionType} not available for the event ${eventId} with status ${eventState.status}`
    )
  }
  const requiredScopes = ACTION_ALLOWED_SCOPES[actionType]

  const canUserPerformAction = hasAnyOfScopes(userScopes, requiredScopes)

  if (!canUserPerformAction) {
    // If the user cannot perform the action, redirect to the unauthorized page
    throw new Error(
      `User does not have permission to perform action ${actionType} on event ${eventId}`
    )
  }

  return <>{children}</>
}
