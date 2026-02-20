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
  emptyValueMessage: TranslationConfig.optional().describe(
    'Default message displayed when the field value is empty.'
  ),
  conditionals: z.array(ShowConditional).default([]).optional()
})

const ReferenceField = BaseField.extend({
  fieldId: z.string(),
  label: TranslationConfig.optional().describe(
    'Overrides the default label from the referenced field when provided.'
  )
}).describe('Field referencing existing event data by field ID.')

const Field = BaseField.extend({
  id: z.string().describe('Identifier of the summary field.'),
  value: TranslationConfig.describe(
    'Field value template supporting variables from configuration and EventMetadata (e.g. "{informant.phoneNo} {informant.email}").'
  ),
  label: TranslationConfig
}).describe('Custom field defined for the summary view.')

export const SummaryConfig = z
  .object({
    fields: z
      .array(z.union([Field, ReferenceField]))
      .describe('Fields displayed in the event summary view.')
  })
  .describe('Configuration of the event summary section.')

export type SummaryConfig = z.infer<typeof SummaryConfig>
