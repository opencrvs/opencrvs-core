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

import { extendZodWithOpenApi } from 'zod-openapi'
extendZodWithOpenApi(z)

/**
 * By default, when conditionals are not defined, action is visible and enabled to the user.
 */
const ActionConditional = z.discriminatedUnion('type', [
  /** If conditional is defined, the action is shown to the user only if the condition is met */
  ShowConditional,
  /** If conditional is defined, the action is enabled only if the condition is met */
  EnableConditional
])

export const DeclarationReviewConfig = z
  .object({
    title: TranslationConfig.describe('Title of the review page'),
    fields: z
      .array(FieldConfig)
      .describe('Fields to be rendered on the review page for annotations.')
  })
  .describe('Configuration for **declaration** review page.')

export type ReviewPageConfig = z.infer<typeof DeclarationReviewConfig>

export const ActionConfigBase = z.object({
  label: TranslationConfig,
  conditionals: z.array(ActionConditional).optional().default([]),
  draft: z.boolean().optional()
})

const ReadActionConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.READ),
    review: DeclarationReviewConfig
  })
)

const DeclareConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.DECLARE),
    review: DeclarationReviewConfig
  })
)

const ValidateConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.VALIDATE),
    review: DeclarationReviewConfig
  })
)

const RegisterConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.REGISTER),
    review: DeclarationReviewConfig
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
    printForm: ActionFormConfig
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
  | typeof ReadActionConfig
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
  | z.infer<typeof ReadActionConfig>
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

export const ActionConfig = z
  .discriminatedUnion('type', [
    /*
     * OpenAPI references are defined here so our generated OpenAPI spec knows to reuse the models
     * and treat them as "models" instead of duplicating the data structure in each endpoint.
     */
    ReadActionConfig.openapi({ ref: 'ReadActionConfig' }),
    DeclareConfig.openapi({ ref: 'DeclareActionConfig' }),
    ValidateConfig.openapi({ ref: 'ValidateActionConfig' }),
    RejectDeclarationConfig.openapi({ ref: 'RejectDeclarationActionConfig' }),
    MarkedAsDuplicateConfig.openapi({ ref: 'MarkedAsDuplicateActionConfig' }),
    ArchiveConfig.openapi({ ref: 'ArchiveActionConfig' }),
    RegisterConfig.openapi({ ref: 'RegisterActionConfig' }),
    DeleteConfig.openapi({ ref: 'DeleteActionConfig' }),
    PrintCertificateActionConfig.openapi({
      ref: 'PrintCertificateActionConfig'
    }),
    RequestCorrectionConfig.openapi({ ref: 'RequestCorrectionActionConfig' }),
    RejectCorrectionConfig.openapi({ ref: 'RejectCorrectionActionConfig' }),
    ApproveCorrectionConfig.openapi({ ref: 'ApproveCorrectionActionConfig' })
  ])
  .openapi({ ref: 'ActionConfig' }) as unknown as z.ZodDiscriminatedUnion<
  'type',
  AllActionConfigFields[]
>

export type ActionConfig = InferredActionConfig

export const DeclarationActionConfig = z.discriminatedUnion('type', [
  DeclareConfig,
  ValidateConfig,
  RegisterConfig
])

export type DeclarationActionConfig = z.infer<typeof DeclarationActionConfig>
