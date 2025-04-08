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
import { FieldConfig } from './FieldConfig'
import { TranslationConfig } from './TranslationConfig'
import { Conditional } from './Conditional'

export const PageTypes = z.enum(['FORM', 'VERIFICATION'])
export type PageType = z.infer<typeof PageTypes>

const PageConfigBase = z.object({
  id: z.string().describe('Unique identifier for the page'),
  title: TranslationConfig.describe('Header title of the page'),
  fields: z.array(FieldConfig).describe('Fields to be rendered on the page'),
  conditional: Conditional()
    .optional()
    .describe(
      'Page will be shown if condition is met. If conditional is not defined, the page will be always shown.'
    )
})

export const FormPageConfig = PageConfigBase.extend({
  type: z.literal(PageTypes.enum.FORM).default(PageTypes.enum.FORM)
})

export type FormPageConfig = z.infer<typeof FormPageConfig>
export type FormPageConfigInput = z.input<typeof FormPageConfig>

export const VerificationActionConfig = z
  .object({
    verify: z.object({ label: TranslationConfig }),
    cancel: z.object({
      label: TranslationConfig,
      confirmation: z.object({
        title: TranslationConfig,
        body: TranslationConfig
      })
    })
  })
  .describe('Actions available on the verification page')

export const VerificationPageConfig = FormPageConfig.extend({
  type: z.literal(PageTypes.enum.VERIFICATION),
  actions: VerificationActionConfig
})
export type VerificationPageConfig = z.infer<typeof VerificationPageConfig>

type AllPageConfig = typeof VerificationPageConfig | typeof FormPageConfig
export const PageConfig = z.discriminatedUnion('type', [
  FormPageConfig,
  VerificationPageConfig
]) as unknown as z.ZodDiscriminatedUnion<'type', AllPageConfig[]>

export type PageConfig = z.infer<typeof PageConfig>
export type PageConfigInput = z.input<typeof PageConfig>
