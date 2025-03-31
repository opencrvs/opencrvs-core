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
import { FieldValue, FieldUpdateValue } from './FieldValue'
import { ActionType } from './ActionType'

/**
 * ActionUpdate is a record of a specific action that updated data fields.
 */
export const ActionUpdate = z.record(z.string(), FieldUpdateValue)
export type ActionUpdate = z.infer<typeof ActionUpdate>
/**
 * EventState is an aggregate of all the actions that have been applied to event data.
 */
export type EventState = Record<string, FieldValue>

export enum ActionStatus {
  Requested = 'Requested',
  Accepted = 'Accepted',
  Rejected = 'Rejected'
}

export const ActionBase = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  createdBy: z.string(),
  data: ActionUpdate,
  metadata: ActionUpdate.optional(),
  createdAtLocation: z.string(),
  status: z.enum([
    ActionStatus.Requested,
    ActionStatus.Accepted,
    ActionStatus.Rejected
  ]),
  // If the action is an asynchronous confirmation for another action, we will save the original action id here.
  confirmationForActionWithId: z.string().optional()
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
    registrationNumber: z.string().optional()
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

const ArchiveAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.ARCHIVE)
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

const ReadAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.READ)
  })
)

const CustomAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.CUSTOM)
  })
)

export const ConfirmationRejectAction = ActionBase.omit({
  data: true,
  metadata: true,
  createdBy: true,
  createdAtLocation: true
}).merge(
  z.object({
    type: z.union([
      z.literal(ActionType.VALIDATE),
      z.literal(ActionType.REJECT),
      z.literal(ActionType.ARCHIVE),
      z.literal(ActionType.NOTIFY),
      z.literal(ActionType.REGISTER),
      z.literal(ActionType.DECLARE),
      z.literal(ActionType.ASSIGN),
      z.literal(ActionType.REQUEST_CORRECTION),
      z.literal(ActionType.APPROVE_CORRECTION),
      z.literal(ActionType.REJECT_CORRECTION),
      z.literal(ActionType.UNASSIGN),
      z.literal(ActionType.PRINT_CERTIFICATE),
      z.literal(ActionType.CUSTOM)
    ]),
    status: z.literal(ActionStatus.Rejected)
  })
)

export type ConfirmationRejectAction = z.infer<typeof ConfirmationRejectAction>

export const ActionDocument = z.discriminatedUnion('type', [
  CreatedAction,
  ValidateAction,
  RejectAction,
  MarkAsDuplicateAction,
  ArchiveAction,
  NotifiedAction,
  RegisterAction,
  DeclareAction,
  AssignedAction,
  RequestedCorrectionAction,
  ApprovedCorrectionAction,
  RejectedCorrectionAction,
  UnassignedAction,
  PrintCertificateAction,
  ReadAction,
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
