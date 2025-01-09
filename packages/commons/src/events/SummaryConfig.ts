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

const Field = z.object({
  id: z.string().describe('Id of a field defined under form.'),
  label: TranslationConfig,
  emptyValueMessage: TranslationConfig.optional()
})

const FieldInput = Field.extend({
  // label is enforced during runtime.
  label: TranslationConfig.optional()
})

export const SummaryConfig = z
  .object({
    title: TranslationConfig.describe('Header title of summary'),
    fields: z.array(Field).describe('Fields rendered in summary view.')
  })
  .describe('Configuration for summary in event.')

export const SummaryConfigInput = SummaryConfig.extend({
  fields: z.array(FieldInput)
})

export type SummaryConfig = z.infer<typeof SummaryConfig>
export type SummaryConfigInput = z.input<typeof SummaryConfigInput>
