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
import { FormPageConfig, PageConfig } from './PageConfig'

export const BaseFormConfig = z.object({
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
  active: z.boolean().describe('Whether the form is active')
})

export const DeclarationFormConfig = BaseFormConfig.extend({
  label: TranslationConfig.describe('Human readable description of the form'),
  pages: z.array(FormPageConfig)
}).describe('Configuration for a declaration form used to gather even **data**')

export type DeclarationFormConfig = z.infer<typeof DeclarationFormConfig>
export type DeclarationFormConfigInput = z.input<typeof DeclarationFormConfig>

export const ActionFormConfig = BaseFormConfig.extend({
  label: TranslationConfig.describe('Human readable description of the form'),
  pages: z.array(PageConfig)
}).describe(
  'Configuration for an action form used to gather event **metadata**'
)

export type ActionFormConfig = z.infer<typeof ActionFormConfig>
export type ActionFormConfigInput = z.input<typeof ActionFormConfig>

export const FormConfig = z.union([DeclarationFormConfig, ActionFormConfig])
export type FormConfig = z.infer<typeof FormConfig>
