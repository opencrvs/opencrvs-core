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
import { Conditional } from './Conditional'

const Field = z.union([
  z
    .object({
      id: z.string().describe('Id of summary field'),
      value: TranslationConfig.describe(
        'Summary field value. Can utilise values defined in configuration and EventMetadata'
      ),
      label: TranslationConfig,
      emptyValueMessage: TranslationConfig.optional(),
      conditional: Conditional.optional().describe(
        'Field will be shown if condition is met. If conditional is not defined, the field will always be shown.'
      )
    })
    .describe('Custom configured field'),
  z
    .object({
      fieldId: z.string(),
      emptyValueMessage: TranslationConfig.optional(),
      conditional: Conditional.optional().describe(
        'Field will be shown if condition is met. If conditional is not defined, the field will always be shown.'
      )
    })
    .describe('Field directly referencing event data with field id')
])

const Title = z.object({
  id: z.string(),
  label: TranslationConfig.describe('Title content'),
  emptyValueMessage: TranslationConfig.optional()
})

export const SummaryConfig = z
  .object({
    title: Title.describe('Title of summary view.'),
    fields: z.array(Field).describe('Fields rendered in summary view.')
  })
  .describe('Configuration for summary in event.')

export type SummaryConfig = z.infer<typeof SummaryConfig>
