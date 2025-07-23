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

import { EventState, getUUID, ActionType } from '@opencrvs/commons/client'
import { trpcClient } from '@client/v2-events/trpc'

// Defines custom API functions that are not part of the generated API from TRPC.

export interface OnDeclareParams {
  eventId: string
  declaration: EventState
  transactionId: string
  annotation?: EventState
}
/**
 * Runs a sequence of actions from declare to register.
 *
 * Defining the function here, statically allows offline support.
 * Moving the function to one level up will break offline support since the definition needs to be static.
 */
export async function registerOnDeclare({
  eventId,
  declaration,
  transactionId,
  annotation
}: {
  eventId: string
  transactionId: string
  declaration: EventState
  annotation?: EventState
}) {
  await trpcClient.event.actions.declare.request.mutate({
    declaration,
    annotation,
    eventId,
    transactionId,
    keepAssignment: true
  })

  // update is a patch, no need to send again.
  await trpcClient.event.actions.validate.request.mutate({
    declaration: {},
    annotation,
    eventId,
    transactionId,
    duplicates: [],
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
  annotation?: EventState
}) {
  const { eventId, declaration, annotation } = variables
  await trpcClient.event.actions.declare.request.mutate({
    declaration,
    annotation,
    eventId,
    transactionId: variables.transactionId,
    keepAssignment: true
  })

  const latestResponse = await trpcClient.event.actions.validate.request.mutate(
    {
      // update is a patch, no need to send again.
      declaration: {},
      annotation,
      eventId,
      transactionId: variables.transactionId,
      duplicates: []
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
  declaration: EventState
  transactionId: string
  annotation?: EventState
}) {
  const { eventId, declaration, annotation } = variables

  await trpcClient.event.actions.validate.request.mutate({
    declaration,
    annotation,
    eventId,
    transactionId: variables.transactionId,
    duplicates: [],
    keepAssignment: true
  })

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
 * Runs a sequence of actions from  validate to register.
 *
 * Defining the function here, statically allows offline support.
 * Moving the function to one level up will break offline support since the definition needs to be static.
 */
export async function makeCorrectionOnRequest(variables: {
  eventId: string
  declaration: EventState
  transactionId: string
  annotation?: EventState
}) {
  const { eventId, declaration, annotation } = variables

  const response = await trpcClient.event.actions.correction.request.mutate({
    eventId,
    declaration,
    transactionId: variables.transactionId,
    annotation,
    keepAssignment: true
  })

  const requestId = response.actions.find(
    (x) => x.transactionId === variables.transactionId
  )?.id
  if (!requestId) {
    throw new Error(
      `Request ID not found in response for eventId: ${eventId}, transactionId: ${variables.transactionId}`
    )
  }
  const latestResponse =
    await trpcClient.event.actions.correction.approve.mutate({
      requestId,
      type: ActionType.APPROVE_CORRECTION,
      transactionId: getUUID(),
      eventId
    })

  return latestResponse
}
