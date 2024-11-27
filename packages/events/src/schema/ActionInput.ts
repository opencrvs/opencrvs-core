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

import { ActionType } from '@opencrvs/commons'
import { z } from 'zod'

const BaseActionInput = z.object({
  eventId: z.string(),
  transactionId: z.string(),
  data: z.record(z.any())
})

const CreateActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.CREATE),
    createdAtLocation: z.string()
  })
)

const RegisterActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.REGISTER),
    identifiers: z.object({
      trackingId: z.string(),
      registrationNumber: z.string()
    })
  })
)

export const NotifyActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.NOTIFY),
    createdAtLocation: z.string()
  })
)

export const DeclareActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.DECLARE)
  })
)
export const AssignActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.ASSIGN),
    assignedTo: z.string()
  })
)
export const UnassignActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.UNASSIGN)
  })
)

export const ActionInput = z.discriminatedUnion('type', [
  CreateActionInput,
  RegisterActionInput,
  NotifyActionInput,
  DeclareActionInput,
  AssignActionInput,
  UnassignActionInput
])

export type ActionInput = z.infer<typeof ActionInput>
