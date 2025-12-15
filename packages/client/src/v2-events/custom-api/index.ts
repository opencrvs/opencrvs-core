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
  EventConfig,
  ArchiveActionInput,
  MarkAsDuplicateActionInput,
  ActionStatus,
  ValidatorContext,
  EditActionInput
} from '@opencrvs/commons/client'
import { trpcClient } from '@client/v2-events/trpc'

// Defines custom API functions that are not part of the generated API from TRPC.

export interface CustomMutationParams {
  eventId: string
  declaration: EventState
  transactionId: string
  eventConfiguration: EventConfig
  annotation?: EventState
}

export interface EditRequestParams extends CustomMutationParams {
  content: EditActionInput['content']
}

export interface CorrectionRequestParams extends CustomMutationParams {
  event: EventDocument
  context: ValidatorContext
}

export interface ArchiveOnDuplicateParams extends CustomMutationParams {
  content: ArchiveActionInput['content'] &
    Partial<MarkAsDuplicateActionInput['content']>
}

function hasPotentialDuplicates(
  event: EventDocument,
  eventConfiguration: EventConfig
) {
  const eventIndex = getCurrentEventState(event, eventConfiguration)
  return eventIndex.potentialDuplicates.length > 0
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
}: CustomMutationParams) {
  const declaredEvent = await trpcClient.event.actions.declare.request.mutate({
    declaration,
    annotation,
    eventId,
    transactionId,
    keepAssignment: true
  })

  if (hasPotentialDuplicates(declaredEvent, eventConfiguration)) {
    return declaredEvent
  }

  return trpcClient.event.actions.register.request.mutate({
    declaration: {},
    annotation,
    eventId,
    transactionId
  })
}

export async function editAndRegister({
  eventId,
  declaration,
  transactionId,
  annotation,
  content,
  eventConfiguration
}: EditRequestParams) {
  await trpcClient.event.actions.edit.request.mutate({
    declaration,
    annotation,
    eventId,
    transactionId,
    keepAssignment: true,
    content
  })

  // TODO CIHAN: do declare only if its not been notified previously?
  // const declaredEvent = await trpcClient.event.actions.declare.request.mutate({
  //   declaration,
  //   annotation,
  //   eventId,
  //   transactionId,
  //   keepAssignment: true
  // })

  // if (hasPotentialDuplicates(declaredEvent, eventConfiguration)) {
  //   return declaredEvent
  // }

  return trpcClient.event.actions.register.request.mutate({
    declaration,
    annotation,
    eventId,
    transactionId
  })
}

export async function editAndDeclare({
  eventId,
  declaration,
  transactionId,
  annotation,
  content
}: EditRequestParams) {
  await trpcClient.event.actions.edit.request.mutate({
    declaration,
    annotation,
    eventId,
    transactionId,
    keepAssignment: true,
    content
  })

  return trpcClient.event.actions.declare.request.mutate({
    declaration,
    annotation,
    eventId,
    transactionId
  })
}

export async function editAndNotify({
  eventId,
  declaration,
  transactionId,
  annotation,
  content
}: EditRequestParams) {
  await trpcClient.event.actions.edit.request.mutate({
    declaration,
    annotation,
    eventId,
    transactionId,
    keepAssignment: true,
    content
  })

  return trpcClient.event.actions.notify.request.mutate({
    declaration,
    annotation,
    eventId,
    transactionId
  })
}

/**
 * Runs markAsDuplicate and then archive on sequence.
 */
export async function archiveOnDuplicate({
  eventId,
  transactionId,
  declaration,
  content
}: ArchiveOnDuplicateParams) {
  await trpcClient.event.actions.duplicate.markAsDuplicate.mutate({
    eventId,
    transactionId,
    declaration,
    keepAssignment: true,
    ...(content.duplicateOf
      ? { content: { duplicateOf: content.duplicateOf } }
      : {})
  })
  return trpcClient.event.actions.archive.request.mutate({
    eventId,
    transactionId,
    declaration,
    content: { reason: content.reason }
  })
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
export async function makeCorrectionOnRequest({
  eventId,
  declaration,
  annotation: declarationMixedUpAnnotation,
  transactionId,
  event,
  eventConfiguration,
  context
}: CorrectionRequestParams) {
  // Let's find the REQUEST_CORRECTION action configuration. Because the annotation passed down here is mixed up
  // with declaration in the REQUEST_CORRECTION page form, we need to cleanup the annotation from declaration
  const actionConfiguration = eventConfiguration.actions.find(
    (action) => action.type === ActionType.REQUEST_CORRECTION
  )

  const originalDeclaration = getCurrentEventState(
    event,
    eventConfiguration
  ).declaration

  const annotation =
    actionConfiguration && declarationMixedUpAnnotation
      ? omitHiddenAnnotationFields(
          actionConfiguration,
          originalDeclaration,
          declarationMixedUpAnnotation,
          context
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
    (a) =>
      a.transactionId === transactionId && a.status === ActionStatus.Accepted
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
