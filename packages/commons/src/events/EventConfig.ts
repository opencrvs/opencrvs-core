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
import { ActionConfig } from './ActionConfig'
import { DeduplicationConfig } from './DeduplicationConfig'
import { SummaryConfig } from './SummaryConfig'
import { TranslationConfig } from './TranslationConfig'
import { AdvancedSearchConfig } from './AdvancedSearchConfig'
import { findAllFields } from './utils'
import { DeclarationFormConfig } from './FormConfig'
// eslint-disable-next-line import/no-unassigned-import
import 'zod-openapi/extend'

/**
 * Description of event features defined by the country. Includes configuration for process steps and forms involved.
 *
 * `Event.parse(config)` will throw an error if the configuration is invalid.
 */
export const EventConfig = z
  .object({
    id: z
      .string()
      .describe(
        'A machine-readable identifier for the event, e.g. "birth" or "death"'
      ),
    summary: SummaryConfig,
    label: TranslationConfig,
    actions: z.array(ActionConfig),
    declaration: DeclarationFormConfig,
    deduplication: z.array(DeduplicationConfig).optional().default([]),
    advancedSearch: z.array(AdvancedSearchConfig).optional().default([])
  })
  .superRefine((event, ctx) => {
    const allFields = findAllFields(event)
    const fieldIds = allFields.map((field) => field.id)

    const advancedSearchFields = event.advancedSearch.flatMap((section) =>
      section.fields.flatMap((field) => field.fieldId)
    )

    const advancedSearchFieldsSet = new Set(advancedSearchFields)

    if (advancedSearchFieldsSet.size !== advancedSearchFields.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Advanced search field ids must be unique',
        path: ['advancedSearch']
      })
    }

    const invalidFields = event.advancedSearch.flatMap((section) =>
      section.fields.filter((field) => !fieldIds.includes(field.fieldId))
    )

    if (invalidFields.length > 0) {
      ctx.addIssue({
        code: 'custom',
        message: `Advanced search id must match a field id in fields array.
    Invalid AdvancedSearch field IDs for event ${event.id}: ${invalidFields
      .map((f) => f.fieldId)
      .join(', ')}`,
        path: ['advancedSearch']
      })
    }
  })
  .openapi({
    ref: 'EventConfig'
  })

export type EventConfig = z.infer<typeof EventConfig>
