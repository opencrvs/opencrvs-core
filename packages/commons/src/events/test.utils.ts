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
import { tennisClubMembershipEvent } from '../fixtures'
import { getUUID } from '../uuid'
import { ActionBase, ActionDocument } from './ActionDocument'
import {
  DeclareActionInput,
  RegisterActionInput,
  RequestCorrectionActionInput,
  ValidateActionInput
} from './ActionInput'
import { ActionType } from './ActionType'
import { EventConfig } from './EventConfig'
import { EventDocument } from './EventDocument'
import { EventInput } from './EventInput'
import { mapFieldTypeToMockValue } from './FieldTypeMapping'
import { findActiveActionFields, stripHiddenFields } from './utils'

export function generateActionInput(
  configuration: EventConfig,
  action: ActionType
) {
  const fields = findActiveActionFields(configuration, action) ?? []

  const data = fields.reduce(
    (acc, field, i) => ({
      ...acc,
      [field.id]: mapFieldTypeToMockValue(field, i)
    }),
    {}
  )

  // Strip away hidden or disabled fields from mock action data
  // If this is not done, the mock data might contain hidden or disabled fields, which will cause validation errors
  return stripHiddenFields(fields, data)
}

export const eventPayloadGenerator = {
  create: (input: Partial<EventInput> = {}) => ({
    transactionId: input.transactionId ?? getUUID(),
    type: input.type ?? 'TENNIS_CLUB_MEMBERSHIP'
  }),
  patch: (id: string, input: Partial<EventInput> = {}) => ({
    transactionId: input.transactionId ?? getUUID(),
    type: input.type ?? 'TENNIS_CLUB_MEMBERSHIP',
    id
  }),
  actions: {
    declare: (
      eventId: string,
      input: Partial<Pick<DeclareActionInput, 'transactionId' | 'data'>> = {}
    ) => ({
      type: ActionType.DECLARE,
      transactionId: input.transactionId ?? getUUID(),
      data:
        input.data ??
        generateActionInput(tennisClubMembershipEvent, ActionType.DECLARE),
      eventId
    }),
    validate: (
      eventId: string,
      input: Partial<Pick<ValidateActionInput, 'transactionId' | 'data'>> = {}
    ) => ({
      type: ActionType.VALIDATE,
      transactionId: input.transactionId ?? getUUID(),
      data: input.data ?? {},
      duplicates: [],
      eventId
    }),
    register: (
      eventId: string,
      input: Partial<Pick<RegisterActionInput, 'transactionId' | 'data'>> = {}
    ) => ({
      type: ActionType.REGISTER,
      transactionId: input.transactionId ?? getUUID(),
      data:
        input.data ??
        generateActionInput(tennisClubMembershipEvent, ActionType.REGISTER),
      eventId
    }),
    printCertificate: (
      eventId: string,
      input: Partial<Pick<RegisterActionInput, 'transactionId' | 'data'>> = {}
    ) => ({
      type: ActionType.PRINT_CERTIFICATE,
      transactionId: input.transactionId ?? getUUID(),
      data:
        input.data ??
        generateActionInput(
          tennisClubMembershipEvent,
          ActionType.PRINT_CERTIFICATE
        ),
      eventId
    }),
    correction: {
      request: (
        eventId: string,
        input: Partial<
          Pick<RequestCorrectionActionInput, 'transactionId' | 'data'>
        > = {}
      ) => ({
        type: ActionType.REQUEST_CORRECTION,
        transactionId: input.transactionId ?? getUUID(),
        data:
          input.data ??
          generateActionInput(
            tennisClubMembershipEvent,
            ActionType.REQUEST_CORRECTION
          ),
        metadata: {},
        eventId
      }),
      approve: (
        eventId: string,
        requestId: string,
        input: Partial<
          Pick<RequestCorrectionActionInput, 'transactionId' | 'data'>
        > = {}
      ) => ({
        type: ActionType.APPROVE_CORRECTION,
        transactionId: input.transactionId ?? getUUID(),
        data:
          input.data ??
          generateActionInput(
            tennisClubMembershipEvent,
            ActionType.APPROVE_CORRECTION
          ),
        eventId,
        requestId
      }),
      reject: (
        eventId: string,
        requestId: string,
        input: Partial<
          Pick<RequestCorrectionActionInput, 'transactionId' | 'data'>
        > = {}
      ) => ({
        type: ActionType.REJECT_CORRECTION,
        transactionId: input.transactionId ?? getUUID(),
        data:
          input.data ??
          generateActionInput(
            tennisClubMembershipEvent,
            ActionType.REJECT_CORRECTION
          ),
        eventId,
        requestId
      })
    }
  }
}

function generateActionDocument({
  configuration,
  action
}: {
  configuration: EventConfig
  action: ActionType
}): ActionDocument {
  const actionBase = {
    createdAt: new Date().toISOString(),
    createdBy: getUUID(),
    draft: false,
    id: getUUID(),
    createdAtLocation: 'TODO',
    data: generateActionInput(configuration, action),
    metadata: {}
  } satisfies ActionBase

  switch (action) {
    case ActionType.DECLARE:
      return { ...actionBase, type: action }
    case ActionType.UNASSIGN:
      return { ...actionBase, type: action }
    case ActionType.ASSIGN:
      return { ...actionBase, assignedTo: getUUID(), type: action }
    case ActionType.VALIDATE:
      return { ...actionBase, type: action }
    case ActionType.CREATE:
      return { ...actionBase, type: action }
    case ActionType.NOTIFY:
      return { ...actionBase, type: action }
    case ActionType.PRINT_CERTIFICATE:
      return { ...actionBase, type: action }
    case ActionType.REQUEST_CORRECTION:
      return { ...actionBase, type: action }
    case ActionType.APPROVE_CORRECTION:
      return { ...actionBase, requestId: getUUID(), type: action }
    case ActionType.REJECT_CORRECTION:
      return { ...actionBase, requestId: getUUID(), type: action }
    case ActionType.CUSTOM:
      return { ...actionBase, type: action }
    case ActionType.REGISTER:
      return {
        ...actionBase,
        type: action,
        identifiers: { trackingId: getUUID(), registrationNumber: getUUID() }
      }

    default:
      throw new Error(`Unsupported action type: ${action}`)
  }
}

export function generateEventDocument({
  configuration,
  actions
}: {
  configuration: EventConfig
  actions: ActionType[]
}): EventDocument {
  return {
    type: configuration.id,
    actions: actions.map((action) =>
      generateActionDocument({ configuration, action })
    ),
    createdAt: new Date().toISOString(),
    id: getUUID(),
    updatedAt: new Date().toISOString()
  }
}
