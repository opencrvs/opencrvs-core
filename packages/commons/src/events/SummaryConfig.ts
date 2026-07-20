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
import { ShowConditional } from './Conditional'
import { AvailableIcons } from '../icons'

export const SummaryBanner = z
  .object({
    type: z
      .enum(['info', 'warning', 'error'])
      .describe('Visual style of the banner.'),
    icon: AvailableIcons.optional().describe(
      'Icon displayed inside the banner.'
    ),
    title: TranslationConfig.describe('Banner title.'),
    description: TranslationConfig.optional().describe(
      'Supporting text displayed below the banner title.'
    ),
    conditionals: z
      .array(ShowConditional)
      .default([])
      .optional()
      .describe(
        'Conditions under which the banner is shown. When omitted, the banner is always shown.'
      )
  })
  .describe('Banner displayed above the summary fields in the event overview.')

export type SummaryBanner = z.infer<typeof SummaryBanner>

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
    banners: z
      .array(SummaryBanner)
      .default([])
      .optional()
      .describe(
        'Banners displayed above the summary fields in the event overview.'
      ),
    fields: z
      .array(z.union([Field, ReferenceField]))
      .describe('Fields displayed in the event summary view.')
  })
  .meta({
    id: 'SummaryConfig',
    description:
      'Configuration of the event overview page. Defines which declaration fields appear in the record summary, optionally with custom labels, empty-value messages, and templated values.'
  })

export type SummaryConfig = z.infer<typeof SummaryConfig>
