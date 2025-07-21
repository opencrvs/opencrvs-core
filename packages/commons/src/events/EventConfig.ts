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
import { AdvancedSearchConfig, EventFieldId } from './AdvancedSearchConfig'
import { findAllFields, getDeclarationFields } from './utils'
import { DeclarationFormConfig } from './FormConfig'
import { extendZodWithOpenApi } from 'zod-openapi'
import { FieldType } from './FieldType'
import { FieldReference } from './FieldConfig'
extendZodWithOpenApi(z)

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
    dateOfEvent: FieldReference.optional(),
    title: TranslationConfig,
    fallbackTitle: TranslationConfig.optional().describe(
      'This is a fallback title if actual title resolves to empty string'
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
      // Check if the fieldId is not in the fieldIds array
      // and also not in the metadataFields array
      section.fields.filter(
        (field) =>
          !(
            fieldIds.includes(field.fieldId) ||
            (EventFieldId.options as string[]).includes(field.fieldId)
          )
      )
    )

    if (invalidFields.length > 0) {
      ctx.addIssue({
        code: 'custom',
        message: `Advanced search id must match a field id of form fields or pre-defined metadata fields.
    Invalid AdvancedSearch field IDs for event ${event.id}: ${invalidFields
      .map((f) => f.fieldId)
      .join(', ')}`,
        path: ['advancedSearch']
      })
    }

    // Additional check: alternateFieldIds must exist in allFields
    event.advancedSearch.forEach((section, sectionIndex) => {
      section.fields.forEach((field, fieldIndex) => {
        if (
          'alternateFieldIds' in field &&
          Array.isArray(field.alternateFieldIds)
        ) {
          const invalidAltIds = field.alternateFieldIds.filter(
            (id) => !fieldIds.includes(id)
          )

          if (invalidAltIds.length > 0) {
            ctx.addIssue({
              code: 'custom',
              message: `Invalid alternateFieldIds: ${invalidAltIds.join(', ')}`,
              path: [
                'advancedSearch',
                sectionIndex,
                'fields',
                fieldIndex,
                'alternateFieldIds'
              ]
            })
          }
        }
      })
    })

    if (event.dateOfEvent) {
      const eventDateFieldId = getDeclarationFields(event).find(
        ({ id }) => id === event.dateOfEvent?.$$field
      )
      if (!eventDateFieldId) {
        ctx.addIssue({
          code: 'custom',
          message: `Date of event field id must match a field id in fields array.
          Invalid date of event field ID for event ${event.id}: ${event.dateOfEvent.$$field}`,
          path: ['dateOfEvent']
        })
      } else if (eventDateFieldId.type !== FieldType.DATE) {
        ctx.addIssue({
          code: 'custom',
          message: `Field specified for date of event is of type: ${eventDateFieldId.type}, but it needs to be of type: ${FieldType.DATE}`,
          path: ['dateOfEvent.fieldType']
        })
      }
    }
  })
  .openapi({
    ref: 'EventConfig'
  })

export type EventConfig = z.infer<typeof EventConfig>
