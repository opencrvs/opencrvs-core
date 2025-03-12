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
import { z } from 'zod'
import { FieldValueInput } from './FieldValue'
import { ActionType } from './ActionType'

export const ActionBase = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  createdBy: z.string(),
  data: z.record(z.string(), FieldValueInput),
  metadata: z.record(z.string(), FieldValueInput).optional(),
  createdAtLocation: z.string()
})

export type ActionBase = z.infer<typeof ActionBase>

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

const RejectAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.REJECT)
  })
)

const MarkAsDuplicateAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.MARKED_AS_DUPLICATE)
  })
)

const ArchivedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.ARCHIVED)
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

const PrintCertificateAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.PRINT_CERTIFICATE)
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
  RejectAction,
  MarkAsDuplicateAction,
  ArchivedAction,
  NotifiedAction,
  RegisterAction,
  DeclareAction,
  AssignedAction,
  RequestedCorrectionAction,
  ApprovedCorrectionAction,
  RejectedCorrectionAction,
  UnassignedAction,
  PrintCertificateAction,
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
