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
import { ActionType } from './ActionConfig'
import { z } from 'zod'
import { FieldValue } from './FieldValue'

const ActionBase = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  createdBy: z.string(),
  data: z.record(z.string(), FieldValue),
  draft: z.boolean().optional().default(false),
  createdAtLocation: z.string()
})

const AssignedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.ASSIGN),
    assignedTo: z.string()
  })
)

const UnassignedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.UNASSIGN)
  })
)

const RegisterAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.REGISTER),
    identifiers: z.object({
      trackingId: z.string(),
      registrationNumber: z.string()
    })
  })
)

const DeclareAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.DECLARE)
  })
)

const ValidateAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.VALIDATE)
  })
)

const CreatedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.CREATE)
  })
)

const NotifiedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.NOTIFY)
  })
)

const RequestedCorrectionAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.REQUEST_CORRECTION)
  })
)

const ApprovedCorrectionAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.APPROVE_CORRECTION),
    requestId: z.string()
  })
)

const RejectedCorrectionAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.REJECT_CORRECTION),
    requestId: z.string()
  })
)

const CustomAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.CUSTOM)
  })
)

export const ActionDocument = z.discriminatedUnion('type', [
  CreatedAction,
  ValidateAction,
  NotifiedAction,
  RegisterAction,
  DeclareAction,
  AssignedAction,
  RequestedCorrectionAction,
  ApprovedCorrectionAction,
  RejectedCorrectionAction,
  UnassignedAction,
  CustomAction
])

export type ActionDocument = z.infer<typeof ActionDocument>

export const ResolvedUser = z.object({
  id: z.string(),
  role: z.string(),
  name: z.array(
    z.object({
      use: z.string(),
      given: z.array(z.string()),
      family: z.string()
    })
  )
})

export type ResolvedUser = z.infer<typeof ResolvedUser>

export type CreatedAction = z.infer<typeof CreatedAction>

export type ActionFormData = ActionDocument['data']
