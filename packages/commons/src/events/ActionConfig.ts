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
import { FormConfig, FormPage } from './FormConfig'
import { TranslationConfig } from './TranslationConfig'
import { ActionType } from './ActionType'

/**
 * By default, when conditionals are not defined, action is visible and enabled to the user.
 */
const ActionConditional = z.discriminatedUnion('type', [
  /** If conditional is defined, the action is shown to the user only if the condition is met */
  ShowConditional,
  /** If conditional is defined, the action is enabled only if the condition is met */
  EnableConditional
])

export const ActionConfigBase = z.object({
  label: TranslationConfig,
  conditionals: z.array(ActionConditional).optional().default([]),
  draft: z.boolean().optional(),
  forms: z.array(FormConfig)
})

const DeclareConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.DECLARE)
  })
)

const ValidateConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.VALIDATE)
  })
)

const RegisterConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.REGISTER)
  })
)

const DeleteConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.DELETE)
  })
)

const PrintCertificateActionConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.PRINT_CERTIFICATE)
  })
)

const RequestCorrectionConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.REQUEST_CORRECTION),
    onboardingForm: z.array(FormPage),
    additionalDetailsForm: z.array(FormPage)
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

const CustomConfig = ActionConfigBase.merge(
  z.object({
    type: z.literal(ActionType.CUSTOM)
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
  | typeof RegisterConfig
  | typeof DeleteConfig
  | typeof PrintCertificateActionConfig
  | typeof RequestCorrectionConfig
  | typeof RejectCorrectionConfig
  | typeof ApproveCorrectionConfig
  | typeof CustomConfig

/** @knipignore */
export type InferredActionConfig =
  | z.infer<typeof DeclareConfig>
  | z.infer<typeof ValidateConfig>
  | z.infer<typeof RegisterConfig>
  | z.infer<typeof DeleteConfig>
  | z.infer<typeof PrintCertificateActionConfig>
  | z.infer<typeof RequestCorrectionConfig>
  | z.infer<typeof RejectCorrectionConfig>
  | z.infer<typeof ApproveCorrectionConfig>
  | z.infer<typeof CustomConfig>

export const ActionConfig = z.discriminatedUnion('type', [
  DeclareConfig,
  ValidateConfig,
  RegisterConfig,
  DeleteConfig,
  PrintCertificateActionConfig,
  RequestCorrectionConfig,
  RejectCorrectionConfig,
  ApproveCorrectionConfig,
  CustomConfig
]) as unknown as z.ZodDiscriminatedUnion<'type', AllActionConfigFields[]>

export type ActionConfig = InferredActionConfig
