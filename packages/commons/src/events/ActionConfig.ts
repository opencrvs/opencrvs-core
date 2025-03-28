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
import { EnableConditional, ShowConditional } from './Conditional'
import { PageConfig } from './PageConfig'
import { TranslationConfig } from './TranslationConfig'
import { ActionType } from './ActionType'
import { FieldConfig } from './FieldConfig'
import { ActionFormConfig } from './FormConfig'

/**
 * By default, when conditionals are not defined, action is visible and enabled to the user.
 */
const ActionConditional = z.discriminatedUnion('type', [
  /** If conditional is defined, the action is shown to the user only if the condition is met */
  ShowConditional,
  /** If conditional is defined, the action is enabled only if the condition is met */
  EnableConditional
])

export const ReviewPageConfig = z.object({
  declarationVersionId: z
    .string()
    .describe('Which declaration form the review configuration references to.'),
  fields: z
    .array(FieldConfig)
    .describe(
      'Fields to be rendered on the review page for metadata gathering.'
    )
})

export type ReviewPageConfig = z.infer<typeof ReviewPageConfig>

export const ActionConfigBase = z.object({
  label: TranslationConfig,
  conditionals: z.array(ActionConditional).optional().default([]),
  draft: z.boolean().optional()
})

const DeclareConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.DECLARE),
    review: z.array(ReviewPageConfig).optional()
  })
)

const ValidateConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.VALIDATE),
    review: z.array(ReviewPageConfig).optional()
  })
)

const RegisterConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.REGISTER),
    review: z.array(ReviewPageConfig).optional()
  })
)

const RejectDeclarationConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.REJECT)
  })
)

const MarkedAsDuplicateConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.MARKED_AS_DUPLICATE)
  })
)

const ArchiveConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.ARCHIVE)
  })
)

const DeleteConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.DELETE)
  })
)

const PrintCertificateActionConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.PRINT_CERTIFICATE),
    printForm: z.array(ActionFormConfig)
  })
)

const RequestCorrectionConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.REQUEST_CORRECTION),
    onboardingForm: z.array(PageConfig),
    additionalDetailsForm: z.array(PageConfig)
  })
)

const RejectCorrectionConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.REJECT_CORRECTION)
  })
)

const ApproveCorrectionConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.APPROVE_CORRECTION)
  })
)

/*
 * This needs to be exported so that Typescript can refer to the type in
 * the declaration output type. If it can't do that, you might start encountering
 * "The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed"
 * errors when compiling
 */
/** @knipignore */
export type AllActionConfigFields =
  | typeof DeclareConfig
  | typeof ValidateConfig
  | typeof RejectDeclarationConfig
  | typeof MarkedAsDuplicateConfig
  | typeof ArchiveConfig
  | typeof RegisterConfig
  | typeof DeleteConfig
  | typeof PrintCertificateActionConfig
  | typeof RequestCorrectionConfig
  | typeof RejectCorrectionConfig
  | typeof ApproveCorrectionConfig

/** @knipignore */
export type InferredActionConfig =
  | z.infer<typeof DeclareConfig>
  | z.infer<typeof ValidateConfig>
  | z.infer<typeof RejectDeclarationConfig>
  | z.infer<typeof MarkedAsDuplicateConfig>
  | z.infer<typeof ArchiveConfig>
  | z.infer<typeof RegisterConfig>
  | z.infer<typeof DeleteConfig>
  | z.infer<typeof PrintCertificateActionConfig>
  | z.infer<typeof RequestCorrectionConfig>
  | z.infer<typeof RejectCorrectionConfig>
  | z.infer<typeof ApproveCorrectionConfig>

export const ActionConfig = z.discriminatedUnion('type', [
  DeclareConfig,
  ValidateConfig,
  RejectDeclarationConfig,
  MarkedAsDuplicateConfig,
  ArchiveConfig,
  RegisterConfig,
  DeleteConfig,
  PrintCertificateActionConfig,
  RequestCorrectionConfig,
  RejectCorrectionConfig,
  ApproveCorrectionConfig
]) as unknown as z.ZodDiscriminatedUnion<'type', AllActionConfigFields[]>

export type ActionConfig = InferredActionConfig

export const DeclarationActionConfig = z.discriminatedUnion('type', [
  DeclareConfig,
  ValidateConfig,
  RegisterConfig
])

export type DeclarationActionConfig = z.infer<typeof DeclarationActionConfig>
