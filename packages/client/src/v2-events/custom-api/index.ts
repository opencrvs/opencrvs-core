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

import {
  EventState,
  getUUID,
  ActionType,
  getCurrentEventState,
  omitHiddenAnnotationFields,
  EventDocument,
  EventConfig
} from '@opencrvs/commons/client'
import { trpcClient } from '@client/v2-events/trpc'

// Defines custom API functions that are not part of the generated API from TRPC.

export interface OnDeclareParams {
  eventId: string
  declaration: EventState
  transactionId: string
  annotation?: EventState
  fullEvent?: EventDocument
}
/**
 * Runs a sequence of actions from declare to register.
 *
 * Defining the function here, statically allows offline support.
 * Moving the function to one level up will break offline support since the definition needs to be static.
 */
export async function registerOnDeclare({
  eventId,
  eventConfiguration,
  declaration,
  transactionId,
  annotation
}: {
  eventId: string
  transactionId: string
  declaration: EventState
  eventConfiguration: EventConfig
  annotation?: EventState
}) {
  const declaredEvent = await trpcClient.event.actions.declare.request.mutate({
    declaration,
    annotation,
    eventId,
    transactionId,
    keepAssignment: true
  })

  const declaredEventIndex = getCurrentEventState(
    declaredEvent,
    eventConfiguration
  )

  if (declaredEventIndex.potentialDuplicates.length > 0) {
    return declaredEvent
  }

  // update is a patch, no need to send again.
  await trpcClient.event.actions.validate.request.mutate({
    declaration: {},
    annotation,
    eventId,
    transactionId,
    keepAssignment: true
  })

  const latestResponse = await trpcClient.event.actions.register.request.mutate(
    {
      declaration: {},
      annotation,
      eventId,
      transactionId
    }
  )

  return latestResponse
}

/**
 * Runs a sequence of actions from declare to validate.
 *
 * Defining the function here, statically allows offline support.
 * Moving the function to one level up will break offline support since the definition needs to be static.
 */
export async function validateOnDeclare(variables: {
  eventId: string
  declaration: EventState
  transactionId: string
  eventConfiguration: EventConfig
  annotation?: EventState
}) {
  const { eventId, eventConfiguration, declaration, annotation } = variables
  const declaredEvent = await trpcClient.event.actions.declare.request.mutate({
    declaration,
    annotation,
    eventId,
    transactionId: variables.transactionId,
    keepAssignment: true
  })

  const declaredEventIndex = getCurrentEventState(
    declaredEvent,
    eventConfiguration
  )

  if (declaredEventIndex.potentialDuplicates.length > 0) {
    return declaredEvent
  }

  const latestResponse = await trpcClient.event.actions.validate.request.mutate(
    {
      // update is a patch, no need to send again.
      declaration: {},
      annotation,
      eventId,
      transactionId: variables.transactionId
    }
  )

  return latestResponse
}

/**
 * Runs a sequence of actions from  validate to register.
 *
 * Defining the function here, statically allows offline support.
 * Moving the function to one level up will break offline support since the definition needs to be static.
 */
export async function registerOnValidate(variables: {
  eventId: string
  eventConfiguration: EventConfig
  declaration: EventState
  transactionId: string
  annotation?: EventState
}) {
  const { eventId, eventConfiguration, declaration, annotation } = variables

  const maybeDuplicateEvent =
    await trpcClient.event.actions.validate.request.mutate({
      declaration,
      annotation,
      eventId,
      transactionId: variables.transactionId,
      keepAssignment: true
    })

  const maybeDuplicateEventIndex = getCurrentEventState(
    maybeDuplicateEvent,
    eventConfiguration
  )

  if (maybeDuplicateEventIndex.potentialDuplicates.length > 0) {
    return maybeDuplicateEvent
  }

  const latestResponse = await trpcClient.event.actions.register.request.mutate(
    {
      // update is a patch, no need to send again.
      declaration: {},
      annotation,
      eventId,
      transactionId: variables.transactionId
    }
  )

  return latestResponse
}

/**
 * Runs a full correction sequence:
 * 1. Request a correction
 * 2. Approve the correction
 *
 * This is used to make a direct correction (instead of a separate request and approval) by users who are allowed to do so.
 *
 * Defining the function here, statically allows offline support.
 * Moving the function to one level up will break offline support since the definition needs to be static.
 */
export async function makeCorrectionOnRequest(variables: {
  eventId: string
  declaration: EventState
  transactionId: string
  eventConfiguration: EventConfig
  annotation?: EventState
  fullEvent?: EventDocument
}) {
  const {
    eventId,
    declaration,
    annotation: declarationMixedUpAnnotation,
    transactionId,
    fullEvent,
    eventConfiguration
  } = variables

  if (!fullEvent) {
    throw new Error(`full event payload not provided for makeCorrectionRequest`)
  }
  // Let's find the REQUEST_CORRECTION action configuration. Because the annotation passed down here is mixed up
  // with declaration in the REQUEST_CORRECTION page form, we need to cleanup the annotation from declaration
  const actionConfiguration = eventConfiguration.actions.find(
    (action) => action.type === ActionType.REQUEST_CORRECTION
  )

  const originalDeclaration = getCurrentEventState(
    fullEvent,
    eventConfiguration
  ).declaration

  const annotation =
    actionConfiguration && declarationMixedUpAnnotation
      ? omitHiddenAnnotationFields(
          actionConfiguration,
          originalDeclaration,
          declarationMixedUpAnnotation
        )
      : {}
  const response =
    await trpcClient.event.actions.correction.request.request.mutate({
      eventId,
      declaration,
      transactionId,
      annotation,
      keepAssignment: true
    })
  const requestId = response.actions.find(
    (a) => a.transactionId === transactionId
  )?.id
  if (!requestId) {
    throw new Error(
      `Request ID not found in response for eventId: ${eventId}, transactionId: ${transactionId}`
    )
  }
  return trpcClient.event.actions.correction.approve.request.mutate({
    type: ActionType.APPROVE_CORRECTION,
    transactionId: getUUID(),
    eventId,
    requestId,
    annotation: {
      isImmediateCorrection: true
    }
  })
}
