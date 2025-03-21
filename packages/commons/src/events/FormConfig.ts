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

export const FormPageType = {
  FORM: 'FORM',
  VERIFICATION: 'VERIFICATION'
} as const

export const FormPage = z.object({
  id: z.string().describe('Unique identifier for the page'),
  title: TranslationConfig.describe('Header title of the page'),
  fields: z.array(FieldConfig).describe('Fields to be rendered on the page'),
  type: z.literal(FormPageType.FORM).default(FormPageType.FORM)
})

export const VerificationPageConfig = z
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

export const VerificationPage = FormPage.extend({
  type: z.literal(FormPageType.VERIFICATION),
  actions: VerificationPageConfig
})

export type VerificationPageConfig = z.infer<typeof VerificationPageConfig>
type AllPageConfigs = typeof FormPage | typeof VerificationPage

export const PageConfig = z.preprocess(
  (pageConfig: z.infer<AllPageConfigs>) => ({
    ...pageConfig,
    type: pageConfig.type ?? FormPageType.FORM // Default type to "FORM" if not provided
  }),
  z.discriminatedUnion('type', [FormPage, VerificationPage])
) as unknown as z.ZodDiscriminatedUnion<'type', AllPageConfigs[]>

export type PageInput = z.input<typeof PageConfig>
export type Page = z.infer<typeof PageConfig>

export const FormConfig = z.object({
  label: TranslationConfig.describe('Human readable description of the form'),
  version: z.object({
    id: z
      .string()
      .describe(
        'Form version. Semantic versioning recommended. Example: 0.0.1'
      ),
    label: TranslationConfig.describe(
      'Human readable description of the version'
    )
  }),
  active: z.boolean().default(false).describe('Whether the form is active'),
  pages: z.array(PageConfig),
  review: z.object({
    title: TranslationConfig.describe(
      'Title of the form to show in review page'
    ),
    fields: z
      .array(FieldConfig)
      .describe('Fields to be rendered on the review page for metadata')
  })
})

export type FormConfig = z.infer<typeof FormConfig>
export type FormConfigInput = z.input<typeof FormConfig>
