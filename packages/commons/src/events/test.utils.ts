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
import {
  ArchivedActionInput,
  DeclareActionInput,
  RegisterActionInput,
  RejectDeclarationActionInput,
  RequestCorrectionActionInput,
  ValidateActionInput
} from './ActionInput'
import { ActionType } from './ActionType'
import { EventConfig } from './EventConfig'
import { EventInput } from './EventInput'
import { mapFieldTypeToMockValue } from './FieldTypeMapping'
import { findActiveActionFields, stripHiddenOrDisabledFields } from './utils'

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
  return stripHiddenOrDisabledFields(action, configuration, data)
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
    archive: (
      eventId: string,
      input: Partial<Pick<ArchivedActionInput, 'transactionId' | 'data'>> = {}
    ) => ({
      type: ActionType.ARCHIVED,
      transactionId: input.transactionId ?? getUUID(),
      data: input.data ?? {},
      duplicates: [],
      eventId
    }),
    reject: (
      eventId: string,
      input: Partial<
        Pick<RejectDeclarationActionInput, 'transactionId' | 'data'>
      > = {}
    ) => ({
      type: ActionType.REJECT,
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
