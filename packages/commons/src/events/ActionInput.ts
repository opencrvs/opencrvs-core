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
import { ActionType } from './ActionType'
import { ActionUpdate } from './ActionDocument'
import { extendZodWithOpenApi } from 'zod-openapi'
import { v4 as uuidv4 } from 'uuid'
extendZodWithOpenApi(z)

export const BaseActionInput = z.object({
  eventId: z.string(),
  transactionId: z.string(),
  declaration: ActionUpdate.default({}),
  annotation: ActionUpdate.optional(),
  originalActionId: z.string().optional(),
  keepAssignment: z.boolean().optional()
})

const CreateActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.CREATE).default(ActionType.CREATE),
    createdAtLocation: z.string() // @TODO: should not be part of the input
  })
)

export const RegisterActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.REGISTER).default(ActionType.REGISTER),
    registrationNumber: z.string().optional() // @TODO: Should only be allowed by the system user?
  })
)

export type RegisterActionInput = z.infer<typeof RegisterActionInput>

export const ValidateActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.VALIDATE).default(ActionType.VALIDATE),
    duplicates: z.array(z.string())
  })
)

export type ValidateActionInput = z.infer<typeof ValidateActionInput>

export const NotifyActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.NOTIFY).default(ActionType.NOTIFY)
  })
).openapi({
  default: {
    eventId: '<event-id-here>',
    transactionId: uuidv4(),
    declaration: {},
    annotation: {},
    type: ActionType.NOTIFY
  }
})

export type NotifyActionInput = z.infer<typeof NotifyActionInput>

export const DeclareActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.DECLARE).default(ActionType.DECLARE)
  })
)

export const PrintCertificateActionInput = BaseActionInput.merge(
  z.object({
    type: z
      .literal(ActionType.PRINT_CERTIFICATE)
      .default(ActionType.PRINT_CERTIFICATE)
  })
)

export type DeclareActionInput = z.infer<typeof DeclareActionInput>

export const RejectDeclarationActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.REJECT).default(ActionType.REJECT)
  })
)
export type RejectDeclarationActionInput = z.infer<
  typeof RejectDeclarationActionInput
>

export const MarkedAsDuplicateActionInput = BaseActionInput.merge(
  z.object({
    type: z
      .literal(ActionType.MARKED_AS_DUPLICATE)
      .default(ActionType.MARKED_AS_DUPLICATE)
  })
)
export type MarkedAsDuplicateActionInput = z.infer<
  typeof MarkedAsDuplicateActionInput
>

export const ArchiveActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.ARCHIVE).default(ActionType.ARCHIVE)
  })
)
export type ArchiveActionInput = z.infer<typeof ArchiveActionInput>

export const AssignActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.ASSIGN).default(ActionType.ASSIGN),
    assignedTo: z.string() // @TODO: Could this be set to UUID?
  })
)

export type AssignActionInput = z.infer<typeof AssignActionInput>

export const UnassignActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.UNASSIGN).default(ActionType.UNASSIGN),
    assignedTo: z.literal(null).default(null)
  })
)
export type UnassignActionInput = z.infer<typeof UnassignActionInput>

export const RequestCorrectionActionInput = BaseActionInput.merge(
  z.object({
    type: z
      .literal(ActionType.REQUEST_CORRECTION)
      .default(ActionType.REQUEST_CORRECTION)
  })
)

export type RequestCorrectionActionInput = z.infer<
  typeof RequestCorrectionActionInput
>

export const RejectCorrectionActionInput = BaseActionInput.merge(
  z.object({
    requestId: z.string(),
    type: z
      .literal(ActionType.REJECT_CORRECTION)
      .default(ActionType.REJECT_CORRECTION)
  })
)

export type RejectCorrectionActionInput = z.infer<
  typeof RejectCorrectionActionInput
>

export const ApproveCorrectionActionInput = BaseActionInput.merge(
  z.object({
    requestId: z.string(),
    type: z
      .literal(ActionType.APPROVE_CORRECTION)
      .default(ActionType.APPROVE_CORRECTION)
  })
)

export type ApproveCorrectionActionInput = z.infer<
  typeof ApproveCorrectionActionInput
>

export const ReadActionInput = BaseActionInput.merge(
  z.object({
    type: z.literal(ActionType.READ).default(ActionType.READ)
  })
)

export type ReadActionInput = z.infer<typeof ReadActionInput>

export const DeleteActionInput = z.object({ eventId: z.string() })
export type DeleteActionInput = z.infer<typeof DeleteActionInput>

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
    CreateActionInput.openapi({ ref: 'CreateActionInput' }),
    ValidateActionInput.openapi({ ref: 'ValidateActionInput' }),
    RegisterActionInput.openapi({ ref: 'RegisterActionInput' }),
    NotifyActionInput.openapi({ ref: 'NotifyActionInput' }),
    DeclareActionInput.openapi({ ref: 'DeclareActionInput' }),
    RejectDeclarationActionInput.openapi({
      ref: 'RejectDeclarationActionInput'
    }),
    MarkedAsDuplicateActionInput.openapi({
      ref: 'MarkedAsDuplicateActionInput'
    }),
    ArchiveActionInput.openapi({ ref: 'ArchiveActionInput' }),
    AssignActionInput.openapi({ ref: 'AssignActionInput' }),
    UnassignActionInput.openapi({ ref: 'UnassignActionInput' }),
    PrintCertificateActionInput.openapi({ ref: 'PrintCertificateActionInput' }),
    RequestCorrectionActionInput.openapi({
      ref: 'RequestCorrectionActionInput'
    }),
    RejectCorrectionActionInput.openapi({ ref: 'RejectCorrectionActionInput' }),
    ApproveCorrectionActionInput.openapi({
      ref: 'ApproveCorrectionActionInput'
    }),
    ReadActionInput.openapi({ ref: 'ReadActionInput' })
  ])
  .openapi({
    ref: 'ActionInput'
  })

export type ActionInput = z.input<typeof ActionInput>
export type ActionInputWithType = z.infer<typeof ActionInput>
