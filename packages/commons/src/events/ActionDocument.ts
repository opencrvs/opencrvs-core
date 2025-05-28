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
import { ActionType, ConfirmableActions } from './ActionType'
import { extendZodWithOpenApi } from 'zod-openapi'
extendZodWithOpenApi(z)

/**
 * ActionUpdate is a record of a specific action that updated data fields.
 */
export const ActionUpdate = z.record(z.string(), FieldUpdateValue)
export type ActionUpdate = z.infer<typeof ActionUpdate>
/**
 * EventState is an aggregate of all the actions that have been applied to event data.
 */

export const EventState = z.record(z.string(), FieldValue)
export type EventState = z.infer<typeof EventState>

export const ActionStatus = {
  Requested: 'Requested',
  Accepted: 'Accepted',
  Rejected: 'Rejected'
} as const

export type ActionStatus = keyof typeof ActionStatus

export const ActionBase = z.object({
  id: z.string(),
  transactionId: z.string(),
  createdAt: z.string().datetime(),
  createdBy: z.string(),
  createdByRole: z.string(),
  declaration: ActionUpdate,
  annotation: ActionUpdate.optional(),
  createdAtLocation: z
    .string()
    .nullable()
    .describe(
      'Location of the user who created the action. This is null for system users.'
    ),
  status: z.enum([
    ActionStatus.Requested,
    ActionStatus.Accepted,
    ActionStatus.Rejected
  ]),
  // If the action is an asynchronous confirmation for another action, we will save the original action id here.
  originalActionId: z.string().optional()
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
    type: z.literal(ActionType.UNASSIGN),
    assignedTo: z.literal(null)
  })
)

export const RegisterAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.REGISTER),
    registrationNumber: z.string().optional()
  })
)

export type RegisterAction = z.infer<typeof RegisterAction>

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

export const ActionDocument = z
  .discriminatedUnion('type', [
    CreatedAction.openapi({ ref: 'CreatedAction' }),
    ValidateAction.openapi({ ref: 'ValidateAction' }),
    RejectAction.openapi({ ref: 'RejectAction' }),
    MarkAsDuplicateAction.openapi({ ref: 'MarkAsDuplicateAction' }),
    ArchiveAction.openapi({ ref: 'ArchiveAction' }),
    NotifiedAction.openapi({ ref: 'NotifiedAction' }),
    RegisterAction.openapi({ ref: 'RegisterAction' }),
    DeclareAction.openapi({ ref: 'DeclareAction' }),
    AssignedAction.openapi({ ref: 'AssignedAction' }),
    RequestedCorrectionAction.openapi({ ref: 'RequestedCorrectionAction' }),
    ApprovedCorrectionAction.openapi({ ref: 'ApprovedCorrectionAction' }),
    RejectedCorrectionAction.openapi({ ref: 'RejectedCorrectionAction' }),
    UnassignedAction.openapi({ ref: 'UnassignedAction' }),
    PrintCertificateAction.openapi({ ref: 'PrintCertificateAction' }),
    ReadAction.openapi({ ref: 'ReadAction' })
  ])
  .openapi({
    ref: 'ActionDocument'
  })

export type ActionDocument = z.infer<typeof ActionDocument>

export const AsyncRejectActionDocument = ActionBase.omit({
  declaration: true,
  annotation: true
}).merge(
  z.object({
    type: z.enum(ConfirmableActions),
    status: z.literal(ActionStatus.Rejected)
  })
)

export type AsyncRejectActionDocument = z.infer<
  typeof AsyncRejectActionDocument
>

export const Action = z.union([ActionDocument, AsyncRejectActionDocument])
export type Action = ActionDocument | AsyncRejectActionDocument

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
