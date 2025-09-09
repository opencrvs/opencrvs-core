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
import { UUID } from '../uuid'
import { CreatedAtLocation } from './CreatedAtLocation'
import { TokenUserType } from '../authentication'

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
  id: UUID,
  transactionId: z.string(),
  createdByUserType: TokenUserType,
  createdAt: z.string().datetime(),
  createdBy: z.string(),
  createdByRole: z.string(),
  createdBySignature: z
    .string()
    .nullish()
    .describe('Reference to signature of the user who created the action'),
  createdAtLocation: CreatedAtLocation,
  declaration: ActionUpdate,
  annotation: ActionUpdate.optional().nullable(),
  status: z.enum([
    ActionStatus.Requested,
    ActionStatus.Accepted,
    ActionStatus.Rejected
  ]),
  // If the action is an asynchronous confirmation for another action, we will save the original action id here.
  originalActionId: UUID.optional()
    .nullable()
    .describe(
      'Reference to the original action that was asynchronously rejected or accepted by 3rd party integration.'
    )
  // 'content' field reserved for additional data
  // Each action can define its own content specifc to the action
  // See PrintCertificateAction
})

export type ActionBase = z.infer<typeof ActionBase>

const AssignedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.ASSIGN),
    assignedTo: z.string() // TODO move into 'content' property
  })
)

const UnassignedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.UNASSIGN)
  })
)

export const RegisterAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.REGISTER),
    registrationNumber: z.string().optional() // TODO move into 'content' property
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

export const ReasonContent = z.object({
  reason: z
    .string()
    .min(1, { message: 'Message cannot be empty' })
    .describe('Message describing reason for rejection or archiving')
})

const RejectAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.REJECT),
    content: ReasonContent
  })
)

export const PotentialDuplicate = z.object({
  id: UUID,
  trackingId: z.string()
})
export type PotentialDuplicate = z.infer<typeof PotentialDuplicate>

export const DuplicateDetectedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.DUPLICATE_DETECTED),
    content: z.object({
      duplicates: z.array(PotentialDuplicate)
    })
  })
)
export type DuplicateDetectedAction = z.infer<typeof DuplicateDetectedAction>

const MarkNotDuplicateAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.MARK_AS_NOT_DUPLICATE)
  })
)

const MarkAsDuplicateAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.MARK_AS_DUPLICATE),
    content: z
      .object({
        duplicateOf: UUID
      })
      .optional()
  })
)

const ArchiveAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.ARCHIVE),
    content: ReasonContent
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

export const PrintContent = z.object({
  templateId: z.string().optional()
})

export type PrintContent = z.infer<typeof PrintContent>

const PrintCertificateAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.PRINT_CERTIFICATE),
    content: PrintContent.optional().nullable()
  })
)

export type PrintCertificateAction = z.infer<typeof PrintCertificateAction>

const RequestedCorrectionAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.REQUEST_CORRECTION)
  })
)

export type RequestedCorrectionAction = z.infer<
  typeof RequestedCorrectionAction
>

const ApprovedCorrectionAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.APPROVE_CORRECTION),
    requestId: z.string() // TODO move into 'content' property
  })
)

const RejectedCorrectionAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.REJECT_CORRECTION),
    requestId: z.string(), // TODO move into 'content' property
    content: ReasonContent
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
    DuplicateDetectedAction.openapi({ ref: 'DuplicateDetectedAction' }),
    MarkNotDuplicateAction.openapi({ ref: 'MarkNotDuplicateAction' }),
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
  ),
  primaryOfficeId: z.string()
})

export type ResolvedUser = z.infer<typeof ResolvedUser>

export type CreatedAction = z.infer<typeof CreatedAction>
