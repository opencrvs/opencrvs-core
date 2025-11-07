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
import { TranslationConfig } from './TranslationConfig'
import { ActionType } from './ActionType'
import { FieldConfig } from './FieldConfig'
import { ActionFormConfig } from './FormConfig'
import { DeduplicationConfig } from './DeduplicationConfig'
import { ActionFlagConfig } from './Flag'

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
  label: TranslationConfig.describe('Human readable description of the action'),
  flags: z
    .array(ActionFlagConfig)
    .optional()
    .default([])
    .describe('Flag actions which are executed when the action is performed.')
})

// @TODO: as part of custom actions work, we should probably move the 'review' to be only in DECLARE action config
const DeclarationActionBase = ActionConfigBase.extend({
  review: DeclarationReviewConfig,
  deduplication: DeduplicationConfig.optional()
})

const ReadActionConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.READ),
    review: DeclarationReviewConfig.describe(
      'Configuration of the review page for read-only view.'
    )
  }).shape
)

const DeclareConfig = DeclarationActionBase.extend(
  z.object({
    type: z.literal(ActionType.DECLARE)
  }).shape
)

const ValidateConfig = DeclarationActionBase.extend(
  z.object({
    type: z.literal(ActionType.VALIDATE)
  }).shape
)

const RegisterConfig = DeclarationActionBase.extend(
  z.object({
    type: z.literal(ActionType.REGISTER)
  }).shape
)

const RejectDeclarationConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.REJECT)
  }).shape
)

const ArchiveConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.ARCHIVE)
  }).shape
)

const DeleteConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.DELETE)
  }).shape
)

const PrintCertificateActionConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.PRINT_CERTIFICATE),
    printForm: ActionFormConfig
  }).shape
)

const RequestCorrectionConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.REQUEST_CORRECTION),
    correctionForm: ActionFormConfig
  }).shape
)

const RejectCorrectionConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.REJECT_CORRECTION)
  }).shape
)

const ApproveCorrectionConfig = ActionConfigBase.extend(
  z.object({
    type: z.literal(ActionType.APPROVE_CORRECTION)
  }).shape
)

const CustomActionConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.CUSTOM),
    name: z.string().describe('Name of the custom action.'),
    /** Custom action form configuration supports a simple array of field configs, which should be rendered on the action modal. In the future, we might add support for pages etc. */
    form: z
      .array(FieldConfig)
      .describe(
        'Form configuration for the custom action. The form configured here will be used on the custom action confirmation modal.'
      )
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
  | typeof CustomActionConfig

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
  | z.infer<typeof CustomActionConfig>

export const ActionConfig = z
  .discriminatedUnion('type', [
    /*
     * OpenAPI references are defined here so our generated OpenAPI spec knows to reuse the models
     * and treat them as "models" instead of duplicating the data structure in each endpoint.
     */
    ReadActionConfig.meta({ id: 'ReadActionConfig' }),
    DeclareConfig.meta({ id: 'DeclareActionConfig' }),
    ValidateConfig.meta({ id: 'ValidateActionConfig' }),
    RejectDeclarationConfig.meta({ id: 'RejectDeclarationActionConfig' }),
    ArchiveConfig.meta({ id: 'ArchiveActionConfig' }),
    RegisterConfig.meta({ id: 'RegisterActionConfig' }),
    DeleteConfig.meta({ id: 'DeleteActionConfig' }),
    PrintCertificateActionConfig.meta({
      id: 'PrintCertificateActionConfig'
    }),
    RequestCorrectionConfig.meta({ id: 'RequestCorrectionActionConfig' }),
    RejectCorrectionConfig.meta({ id: 'RejectCorrectionActionConfig' }),
    ApproveCorrectionConfig.meta({
      id: 'ApproveCorrectionActionConfig'
    })
    // @TODO: adding this causes too long inferred type error in EventConfig. Need to find a workaround.
    // CustomActionConfig.meta({ id: 'CustomActionConfig' })
  ])
  .describe(
    'Configuration of an action available for an event. Data collected depends on the action type and is accessible through the annotation property in ActionDocument.'
  )
  .meta({ id: 'ActionConfig' })

export type ActionConfig = InferredActionConfig

export const DeclarationActionConfig = z.discriminatedUnion('type', [
  DeclareConfig,
  ValidateConfig,
  RegisterConfig
])

export type DeclarationActionConfig = z.infer<typeof DeclarationActionConfig>
