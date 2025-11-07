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
export const ActionUpdate = z
  .record(z.string(), FieldUpdateValue)
  .describe(
    'Record of field-level changes made by an action. Supports partial updates and nullable values.'
  )
export type ActionUpdate = z.infer<typeof ActionUpdate>

/**
 * EventState is an aggregate of all the actions that have been applied to event data.
 */
export const EventState = z
  .record(z.string(), FieldValue)
  .describe(
    'Aggregate representation of event data after all actions have been applied, with all updates consolidated and null values removed.'
  )
export type EventState = z.infer<typeof EventState>

export const ActionStatus = {
  Requested: 'Requested',
  Accepted: 'Accepted',
  Rejected: 'Rejected'
} as const

export type ActionStatus = keyof typeof ActionStatus

export const ActionBase = z.object({
  id: UUID.describe('Unique identifier of the action.'),
  transactionId: z.string().describe('Unique identifier of the transaction.'),
  createdByUserType: TokenUserType.describe(
    'Indicates whether the action was created by a human-user or by a system-user.'
  ),
  createdAt: z
    .string()
    .datetime()
    .describe('Timestamp indicating when the action was created.'),
  createdBy: z
    .string()
    .describe('Identifier of the user who created the action.'),
  createdByRole: z
    .string()
    .describe('Role of the user who created the action.'),
  createdBySignature: z
    .string()
    .nullish()
    .describe('Reference to the signature of the user who created the action.'),
  createdAtLocation: CreatedAtLocation.describe(
    'Reference to the location of the user who created the action.'
  ),
  declaration: ActionUpdate.describe(
    'Declaration data defined by the ActionConfig. Supports partial updates.'
  ),
  annotation: ActionUpdate.optional()
    .nullable()
    .describe('Action-specific metadata used to annotate the event.'),
  status: z
    .enum([
      ActionStatus.Requested,
      ActionStatus.Accepted,
      ActionStatus.Rejected
    ])
    .describe(
      'Current status of the action. Actions may be validated asynchronously by third-party integrations.'
    ),
  originalActionId: UUID.optional()
    .nullable()
    .describe(
      'Reference to the original action asynchronously accepted or rejected by a third-party integration.'
    )
})

export type ActionBase = z.infer<typeof ActionBase>

const AssignedAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.ASSIGN),
    assignedTo: z
      .string()
      .describe('Identifier of the user to whom the action is assigned.') // TODO move into 'content' property
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
    registrationNumber: z
      .string()
      .optional()
      .describe(
        'Registration number of the event. Always present for accepted registrations.'
      ) // TODO move into 'content' property
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
    .describe(
      'Message describing the reason for rejecting or archiving the event.'
    )
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

const CustomAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.CUSTOM),
    name: z.string()
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
    ReadAction.openapi({ ref: 'ReadAction' }),
    CustomAction.openapi({ ref: 'CustomAction' })
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

export type CreatedAction = z.infer<typeof CreatedAction>
export type AssignedAction = z.infer<typeof AssignedAction>
