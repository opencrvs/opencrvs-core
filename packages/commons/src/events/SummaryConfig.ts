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
import { ShowConditional } from './Conditional'

const BaseField = z.object({
  emptyValueMessage: TranslationConfig.optional(),
  conditionals: z.array(ShowConditional).default([]).optional()
})

const ReferenceField = BaseField.extend({
  fieldId: z.string()
}).describe('Field directly referencing event data with field id')

const Field = BaseField.extend({
  id: z.string().describe('Id of summary field'),
  value: TranslationConfig.describe(
    'Summary field value. Can utilise values defined in configuration and EventMetadata'
  ),
  label: TranslationConfig,
  emptyValueMessage: TranslationConfig.optional(),
  customLabel: TranslationConfig.optional().describe(
    "By default, the configured field's label is used. This can be overridden by providing a custom label."
  )
}).describe('Custom configured field')

export const SummaryConfig = z
  .object({
    fields: z
      .array(z.union([Field, ReferenceField]))
      .describe('Fields rendered in summary view.')
  })
  .describe('Configuration for summary in event.')

export type SummaryConfig = z.infer<typeof SummaryConfig>
