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
import { TranslationConfig } from './TranslationConfig'
import { ActionType } from './ActionType'
import { FieldConfig } from './FieldConfig'
import { ActionFormConfig } from './FormConfig'
import { DeduplicationConfig } from './DeduplicationConfig'
import { extendZodWithOpenApi } from 'zod-openapi'

extendZodWithOpenApi(z)

export const DeclarationReviewConfig = z
  .object({
    title: TranslationConfig.describe('Title of the review page'),
    fields: z
      .array(FieldConfig)
      .describe('Fields displayed on the review page for annotations.')
  })
  .describe(
    'Configuration of the declaration review page for collecting event-related metadata.'
  )

export type ReviewPageConfig = z.infer<typeof DeclarationReviewConfig>

export const ActionConfigBase = z.object({
  label: TranslationConfig.describe('Human readable description of the action')
})

// TODO CIHAN: move review to DeclareConfig only
const DeclarationActionBase = ActionConfigBase.extend({
  review: DeclarationReviewConfig,
  deduplication: DeduplicationConfig.optional()
})

const ReadActionConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.READ),
    review: DeclarationReviewConfig.describe(
      'Configuration of the review page for read-only view.'
    )
  })
)

const DeclareConfig = DeclarationActionBase.merge(
  z.object({
    type: z.literal(ActionType.DECLARE)
  })
)

const ValidateConfig = DeclarationActionBase.merge(
  z.object({
    type: z.literal(ActionType.VALIDATE)
  })
)

const RegisterConfig = DeclarationActionBase.merge(
  z.object({
    type: z.literal(ActionType.REGISTER)
  })
)

const RejectDeclarationConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.REJECT)
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
    correctionForm: ActionFormConfig
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
  .describe(
    'Configuration of an action available for an event. Data collected depends on the action type and is accessible through the annotation property in ActionDocument.'
  )
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
