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

export const DeclarationFormConfig = z
  .object({
    label: TranslationConfig.describe(
      'Human readable description of the declaration form'
    ),
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
    pages: z.array(FormPageConfig)
  })
  .describe('Defines what data is gathered of the event.')

export type DeclarationFormConfig = z.infer<typeof DeclarationFormConfig>
export type DeclarationFormConfigInput = z.input<typeof DeclarationFormConfig>

export const ActionFormConfig = z.object({
  label: TranslationConfig.describe(
    'Human readable description of the declaration form'
  ),
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
  pages: z.array(PageConfig)
})

export type ActionFormConfig = z.infer<typeof ActionFormConfig>
export type ActionFormConfigInput = z.input<typeof ActionFormConfig>
