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

import * as z from 'zod/v4'
import { FieldValue, FieldUpdateValue } from './FieldValue'
import { ActionType, ConfirmableActions } from './ActionType'
import { UUID } from '../uuid'
import { CreatedAtLocation } from './CreatedAtLocation'
import { TokenUserType } from '../authentication'

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

const AssignedAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.ASSIGN),
    assignedTo: z
      .string()
      .describe('Identifier of the user to whom the action is assigned.') // TODO move into 'content' property
  }).shape
)

const UnassignedAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.UNASSIGN)
  }).shape
)

export const RegisterAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.REGISTER),
    registrationNumber: z
      .string()
      .optional()
      .describe(
        'Registration number of the event. Always present for accepted registrations.'
      ) // TODO move into 'content' property
  }).shape
)

export type RegisterAction = z.infer<typeof RegisterAction>

const DeclareAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.DECLARE)
  }).shape
)

const ValidateAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.VALIDATE)
  }).shape
)

export const ReasonContent = z.object({
  reason: z
    .string()
    .min(1, { error: 'Message cannot be empty' })
    .describe(
      'Message describing the reason for rejecting or archiving the event.'
    )
})

const RejectAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.REJECT),
    content: ReasonContent
  }).shape
)

export const PotentialDuplicate = z.object({
  id: UUID,
  trackingId: z.string()
})
export type PotentialDuplicate = z.infer<typeof PotentialDuplicate>

export const DuplicateDetectedAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.DUPLICATE_DETECTED),
    content: z.object({
      duplicates: z.array(PotentialDuplicate)
    })
  }).shape
)
export type DuplicateDetectedAction = z.infer<typeof DuplicateDetectedAction>

const MarkNotDuplicateAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.MARK_AS_NOT_DUPLICATE)
  }).shape
)

const MarkAsDuplicateAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.MARK_AS_DUPLICATE),
    content: z
      .object({
        duplicateOf: UUID
      })
      .optional()
  }).shape
)

const ArchiveAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.ARCHIVE),
    content: ReasonContent
  }).shape
)

const CreatedAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.CREATE)
  }).shape
)

const NotifiedAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.NOTIFY)
  }).shape
)

export const PrintContent = z.object({
  templateId: z.string().optional()
})

export type PrintContent = z.infer<typeof PrintContent>

const PrintCertificateAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.PRINT_CERTIFICATE),
    content: PrintContent.optional().nullable()
  }).shape
)

export type PrintCertificateAction = z.infer<typeof PrintCertificateAction>

const RequestedCorrectionAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.REQUEST_CORRECTION)
  }).shape
)

export type RequestedCorrectionAction = z.infer<
  typeof RequestedCorrectionAction
>

const ApprovedCorrectionAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.APPROVE_CORRECTION),
    requestId: z.string() // TODO move into 'content' property
  }).shape
)

const RejectedCorrectionAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.REJECT_CORRECTION),
    requestId: z.string(), // TODO move into 'content' property
    content: ReasonContent
  }).shape
)

const ReadAction = ActionBase.extend(
  z.object({
    type: z.literal(ActionType.READ)
  }).shape
)

const CustomAction = ActionBase.merge(
  z.object({
    type: z.literal(ActionType.CUSTOM),
    name: z.string()
  })
)

export const ActionDocument = z
  .discriminatedUnion('type', [
    CreatedAction.meta({ id: 'CreatedAction' }),
    ValidateAction.meta({ id: 'ValidateAction' }),
    RejectAction.meta({ id: 'RejectAction' }),
    DuplicateDetectedAction.meta({ id: 'DuplicateDetectedAction' }),
    MarkNotDuplicateAction.meta({ id: 'MarkNotDuplicateAction' }),
    MarkAsDuplicateAction.meta({ id: 'MarkAsDuplicateAction' }),
    ArchiveAction.meta({ id: 'ArchiveAction' }),
    NotifiedAction.meta({ id: 'NotifiedAction' }),
    RegisterAction.meta({ id: 'RegisterAction' }),
    DeclareAction.meta({ id: 'DeclareAction' }),
    AssignedAction.meta({ id: 'AssignedAction' }),
    RequestedCorrectionAction.meta({ id: 'RequestedCorrectionAction' }),
    ApprovedCorrectionAction.meta({ id: 'ApprovedCorrectionAction' }),
    RejectedCorrectionAction.meta({ id: 'RejectedCorrectionAction' }),
    UnassignedAction.meta({ id: 'UnassignedAction' }),
    PrintCertificateAction.meta({ id: 'PrintCertificateAction' }),
    ReadAction.meta({ id: 'ReadAction' }),
    CustomAction.meta({ id: 'CustomAction' })
  ])
  .meta({
    id: 'ActionDocument'
  })

export type ActionDocument = z.infer<typeof ActionDocument>

export const AsyncRejectActionDocument = ActionBase.omit({
  declaration: true,
  annotation: true
}).extend(
  z.object({
    type: z.enum(ConfirmableActions),
    status: z.literal(ActionStatus.Rejected)
  }).shape
)

export type AsyncRejectActionDocument = z.infer<
  typeof AsyncRejectActionDocument
>

export const Action = z.union([ActionDocument, AsyncRejectActionDocument])
export type Action = z.infer<typeof Action>

export type CreatedAction = z.infer<typeof CreatedAction>
export type AssignedAction = z.infer<typeof AssignedAction>
