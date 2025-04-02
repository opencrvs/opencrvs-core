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

import { EventState, getUUID } from '@opencrvs/commons/client'
import { trpcClient } from '@client/v2-events/trpc'

// Defines custom API functions that are not part of the generated API from TRPC.

export interface OnDeclareParams {
  eventId: string
  declaration: EventState
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
  annotation
}: {
  eventId: string
  declaration: EventState
  annotation?: EventState
}) {
  await trpcClient.event.actions.declare.mutate({
    declaration,
    annotation,
    eventId,
    transactionId: getUUID()
  })

  await trpcClient.event.actions.validate.mutate({
    declaration,
    annotation,
    eventId,
    transactionId: getUUID(),
    duplicates: []
  })

  const latestResponse = await trpcClient.event.actions.register.mutate({
    declaration,
    annotation,
    eventId,
    transactionId: getUUID()
  })

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
  annotation?: EventState
}) {
  const { eventId, declaration, annotation } = variables
  await trpcClient.event.actions.declare.mutate({
    declaration,
    annotation,
    eventId,
    transactionId: getUUID()
  })

  const latestResponse = await trpcClient.event.actions.validate.mutate({
    declaration,
    annotation,
    eventId,
    transactionId: getUUID(),
    duplicates: []
  })

  return latestResponse
}
