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
import { ActionType } from './ActionType'
import {
  PrintContent,
  ActionUpdate,
  ReasonContent,
  PotentialDuplicate
} from './ActionDocument'

import { UUID, getUUID } from '../uuid'
import { CreatedAtLocation } from './CreatedAtLocation'

export const BaseActionInput = z.object({
  eventId: UUID,
  transactionId: z.string(),
  declaration: ActionUpdate.default({}),
  annotation: ActionUpdate.optional(),
  originalActionId: UUID.optional(), // should not be part of base action.
  keepAssignment: z.boolean().optional(),
  // For normal users, the createdAtLocation is resolved on the backend from the user's primaryOfficeId.
  createdAtLocation: CreatedAtLocation.describe(
    'A valid office location ID. This is required for system users performing actions. The provided location must be a leaf-location, i.e. it must not have any children locations.'
  )
})

const CreateActionInput = BaseActionInput.extend(
  z.object({
    type: z.literal(ActionType.CREATE).default(ActionType.CREATE),
    createdAtLocation: CreatedAtLocation
  }).shape
)

export const RegisterActionInput = BaseActionInput.extend(
  z.strictObject({
    type: z.literal(ActionType.REGISTER).default(ActionType.REGISTER),
    registrationNumber: z.string().optional()
  }).shape
)

export type RegisterActionInput = z.infer<typeof RegisterActionInput>

export const ValidateActionInput = BaseActionInput.extend(
  z.object({
    type: z.literal(ActionType.VALIDATE).default(ActionType.VALIDATE)
  }).shape
)

export type ValidateActionInput = z.infer<typeof ValidateActionInput>

export const NotifyActionInput = BaseActionInput.extend(
  z.object({
    type: z.literal(ActionType.NOTIFY).default(ActionType.NOTIFY)
  }).shape
).meta({
  default: {
    eventId: '<event-id-here>',
    transactionId: getUUID(),
    declaration: {},
    annotation: {},
    type: ActionType.NOTIFY
  }
})

export type NotifyActionInput = z.infer<typeof NotifyActionInput>

export const DeclareActionInput = BaseActionInput.extend(
  z.object({
    type: z.literal(ActionType.DECLARE).default(ActionType.DECLARE)
  }).shape
)

export const PrintCertificateActionInput = BaseActionInput.extend(
  z.object({
    type: z
      .literal(ActionType.PRINT_CERTIFICATE)
      .default(ActionType.PRINT_CERTIFICATE),
    content: PrintContent.optional()
  }).shape
)

export type DeclareActionInput = z.infer<typeof DeclareActionInput>

export const RejectDeclarationActionInput = BaseActionInput.extend(
  z.object({
    type: z.literal(ActionType.REJECT).default(ActionType.REJECT),
    content: ReasonContent
  }).shape
)
export type RejectDeclarationActionInput = z.infer<
  typeof RejectDeclarationActionInput
>

export const DuplicateDetectedActionInput = BaseActionInput.extend(
  z.object({
    type: z
      .literal(ActionType.DUPLICATE_DETECTED)
      .default(ActionType.DUPLICATE_DETECTED),
    content: z.object({
      duplicates: z.array(PotentialDuplicate)
    })
  }).shape
)

export const MarkAsDuplicateActionInput = BaseActionInput.extend(
  z.object({
    type: z
      .literal(ActionType.MARK_AS_DUPLICATE)
      .default(ActionType.MARK_AS_DUPLICATE),
    content: z
      .object({
        duplicateOf: UUID
      })
      .optional()
  }).shape
)
export type MarkAsDuplicateActionInput = z.infer<
  typeof MarkAsDuplicateActionInput
>

export const MarkNotDuplicateActionInput = BaseActionInput.extend(
  z.object({
    type: z
      .literal(ActionType.MARK_AS_NOT_DUPLICATE)
      .default(ActionType.MARK_AS_NOT_DUPLICATE)
  }).shape
)
export type MarkNotDuplicateActionInput = z.infer<
  typeof MarkNotDuplicateActionInput
>

export const ArchiveActionInput = BaseActionInput.extend(
  z.object({
    type: z.literal(ActionType.ARCHIVE).default(ActionType.ARCHIVE),
    content: ReasonContent
  }).shape
)
export type ArchiveActionInput = z.infer<typeof ArchiveActionInput>

export const AssignActionInput = BaseActionInput.extend(
  z.object({
    type: z.literal(ActionType.ASSIGN),
    assignedTo: z.string()
  }).shape
)

export type AssignActionInput = z.infer<typeof AssignActionInput>

export const UnassignActionInput = BaseActionInput.extend(
  z.object({
    type: z.literal(ActionType.UNASSIGN).default(ActionType.UNASSIGN),
    assignedTo: z.literal(null).default(null)
  }).shape
)

export type UnassignActionInput = z.infer<typeof UnassignActionInput>

export const RequestCorrectionActionInput = BaseActionInput.extend(
  z.object({
    type: z
      .literal(ActionType.REQUEST_CORRECTION)
      .default(ActionType.REQUEST_CORRECTION)
  }).shape
)

export type RequestCorrectionActionInput = z.infer<
  typeof RequestCorrectionActionInput
>

export const RejectCorrectionActionInput = BaseActionInput.extend(
  z.object({
    requestId: z.string(),
    type: z
      .literal(ActionType.REJECT_CORRECTION)
      .default(ActionType.REJECT_CORRECTION),
    content: ReasonContent
  }).shape
)

export type RejectCorrectionActionInput = z.infer<
  typeof RejectCorrectionActionInput
>

export const ApproveCorrectionActionInput = BaseActionInput.extend(
  z.object({
    requestId: z.string(),
    type: z
      .literal(ActionType.APPROVE_CORRECTION)
      .default(ActionType.APPROVE_CORRECTION)
  }).shape
)

export type ApproveCorrectionActionInput = z.infer<
  typeof ApproveCorrectionActionInput
>

export const ReadActionInput = BaseActionInput.extend(
  z.object({
    type: z.literal(ActionType.READ).default(ActionType.READ)
  }).shape
)

export type ReadActionInput = z.infer<typeof ReadActionInput>

export const DeleteActionInput = z.object({ eventId: UUID })
export type DeleteActionInput = z.infer<typeof DeleteActionInput>

export const CustomActionInput = BaseActionInput.extend(
  z.object({
    type: z.literal(ActionType.CUSTOM).default(ActionType.CUSTOM),
    customActionType: z.string().describe('Name of the custom action.')
  }).shape
)
export type CustomActionInput = z.infer<typeof CustomActionInput>

/**
 * ActionInput types are used to validate the input data for the action.
 * In our use case, we use it directly with TRPC to validate the input data for the action.
 * using z.literal(ActionType.ACTION).default(ActionType.ACTION) makes them more convenient to use
 * without having to pass the type in the input data, when it's defined in the method.
 *
 * e.g. mutation.declare({createdAt: new Date()}) vs mutation.declare({createdAt: new Date(), type: 'DECLARE'})
 */
export const ActionInput = z
  .discriminatedUnion('type', [
    CreateActionInput.meta({ id: 'CreateActionInput' }),
    ValidateActionInput.meta({ id: 'ValidateActionInput' }),
    RegisterActionInput.meta({ id: 'RegisterActionInput' }),
    NotifyActionInput.meta({ id: 'NotifyActionInput' }),
    DeclareActionInput.meta({ id: 'DeclareActionInput' }),
    RejectDeclarationActionInput.meta({
      id: 'RejectDeclarationActionInput'
    }),
    DuplicateDetectedActionInput.meta({
      id: 'DuplicateDetectedActionInput'
    }),
    MarkAsDuplicateActionInput.meta({
      id: 'MarkAsDuplicateActionInput'
    }),
    MarkNotDuplicateActionInput.meta({
      id: 'MarkNotDuplicateActionInput'
    }),
    ArchiveActionInput.meta({ id: 'ArchiveActionInput' }),
    AssignActionInput.meta({ id: 'AssignActionInput' }),
    UnassignActionInput.meta({ id: 'UnassignActionInput' }),
    PrintCertificateActionInput.meta({ id: 'PrintCertificateActionInput' }),
    RequestCorrectionActionInput.meta({
      id: 'RequestCorrectionActionInput'
    }),
    RejectCorrectionActionInput.meta({ id: 'RejectCorrectionActionInput' }),
    ApproveCorrectionActionInput.meta({
      id: 'ApproveCorrectionActionInput'
    }),
    ReadActionInput.meta({ id: 'ReadActionInput' }),
    CustomActionInput.meta({ id: 'CustomActionInput' })
  ])
  .meta({
    id: 'ActionInput'
  })

export type ActionInput = z.input<typeof ActionInput>
export type ActionInputWithType = z.infer<typeof ActionInput>
