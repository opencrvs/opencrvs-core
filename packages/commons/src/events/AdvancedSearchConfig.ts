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
import { FieldConfig, SelectOption, ValidationConfig } from './FieldConfig'
import { FieldType } from './FieldType'
import { FieldConditional } from './Conditional'
import { FieldValue } from './FieldValue'

const MatchType = z.enum(['fuzzy', 'exact', 'range', 'within'])

const BaseField = z.object({
  config: z.object({
    type: MatchType.describe(
      'Determines the search type of field. How to match value.'
    ),
    searchFields: z
      .array(z.string())
      .optional()
      .describe(
        `
      Defines multiple form fields that should be searched when this field has a value.
      All specified fields will be combined using OR logic.

      Example: { searchFields: ['mother.name', 'father.name', 'informant.name'] }
      Will search all fields and return a record if any of the fields match the search value.     
      `
      )
  }),
  type: z
    .nativeEnum(FieldType)
    .optional()
    .describe(
      `
      Explicitly specify the field type for searchFields.
      This is required when searchFields is defined, to show the correct control in the UI.
        
      Example: FieldType.NAME for name fields, FieldType.TEXT for text fields, FieldType.DATE for date fields, etc.
      `
    ),
  label: TranslationConfig.optional().describe(
    `
      Explicitly specify the label for searchFields.
      This is required when searchFields is defined.            
      `
  ),
  options: z.array(SelectOption).optional(),
  searchCriteriaLabelPrefix: TranslationConfig.optional().describe(
    `
    This property determines whether to add a prefix (such as "Child" or "Applicant") before the field label
    when rendering search parameter labels — for example, in the search results page to indicate which fields were used in the search.

    For example, a field config like { id: "child.name.firstname", label: { defaultMessage: "First Name(s)" } } would render as "First Name(s)" by default.

    A field config like { id: "mother.firstname", label: { defaultMessage: "First Name(s)" } } would also render as "First Name(s)" by default.

    So, if both child.name.firstname and mother.firstname are used in a search, the resulting search criteria labels would be "First Name(s)", "First Name(s)",
    which is ambiguous.

    Now, if we treat the field ID prefix as a label (e.g., "applicant.firstname" → "Applicant"), and the field label is already
    descriptive — like { id: "applicant.firstname", label: { defaultMessage: "Applicant's First Name" } } — then the resulting
    label would be "Applicant Applicant's First Name", which is redundant and awkward.

    By setting searchCriteriaLabelPrefix to a translation config object, we can explicitly define the desired prefix
    in the country-config > event.advancedSearch configuration. For example: field("child.dob", { searchCriteriaLabelPrefix: TranslationConfig }).
    `
  ),
  conditionals: z
    .array(FieldConditional)
    .optional()
    .describe(
      `
       In advanced search, we sometimes need to override the default field visibility conditionals.

       For example, Informant fields in the declaration form may have conditional logic
       that hides them based on other field values. Since the advanced search form reuses
       the declaration form config, those same conditionals would apply by default.

       However, in advanced search we often want to make all Informant fields searchable,
       regardless of their original visibility logic. To do this, we explicitly set their
       'conditionals' to an empty array ('[]') in the search config. This ensures they
       are always rendered in the advanced search form.
      `
    ),
  validations: z
    .array(ValidationConfig)
    .optional()
    .describe(
      `Option for overriding the field validations specifically for advanced search form.`
    )
})

export const SearchQueryParams = z
  .object({
    eventType: z
      .string()
      .optional()
      .describe(
        'Defines type of event so that when redirecting to Advanced Search page, appropriate tab can be selected'
      )
  })
  .catchall(FieldValue)
export type SearchQueryParams = z.infer<typeof SearchQueryParams>

export const FieldConfigSchema = BaseField.extend({
  fieldId: z.string(),
  fieldType: z.literal('field')
})

/**
 * The event fields that are available for advanced search. These are the values
 * that can be passed to the `event` function to create a field config.
 */
export const EventFieldIdInput = z.enum([
  'trackingId',
  'status',
  'legalStatuses.REGISTERED.acceptedAt',
  'legalStatuses.REGISTERED.createdAtLocation',
  'updatedAt'
])

/**
 * Represent the prefix used to differentiate event metadata fields from
 * the declaration ones in advanced search form.
 */
export const METADATA_FIELD_PREFIX = 'event.'

/**
 * The field IDs that are actually used in the advanced search. The `event`
 * function prefixes the `EventFieldIdInput` values with METADATA_FIELD_PREFIX.
 */
export const EventFieldId = z.enum([
  `${METADATA_FIELD_PREFIX}trackingId`,
  `${METADATA_FIELD_PREFIX}status`,
  `${METADATA_FIELD_PREFIX}legalStatuses.REGISTERED.acceptedAt`,
  `${METADATA_FIELD_PREFIX}legalStatuses.REGISTERED.createdAtLocation`,
  `${METADATA_FIELD_PREFIX}updatedAt`
])

export type EventFieldIdInput = z.infer<typeof EventFieldIdInput>
export type EventFieldId = z.infer<typeof EventFieldId>

export const EventFieldConfigSchema = BaseField.extend({
  fieldId: EventFieldId,
  fieldType: z.literal('event')
})

export const AdvancedSearchField = z
  .discriminatedUnion('fieldType', [FieldConfigSchema, EventFieldConfigSchema])
  .superRefine((data, ctx) => {
    if (data.config.searchFields && data.config.searchFields.length > 0) {
      if (!data.label) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'label is required when config.searchFields is defined.',
          path: ['label']
        })
      }
      if (!data.type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'type is required when config.searchFields is defined.',
          path: ['type']
        })
      }
    }
  })

export type AdvancedSearchField = z.infer<typeof AdvancedSearchField>

export const AdvancedSearchConfig = z.object({
  title: TranslationConfig.describe('Advanced search tab title'),
  fields: z
    .array(AdvancedSearchField)
    .describe('Advanced search fields within the tab.')
})

export type AdvancedSearchConfig = z.infer<typeof AdvancedSearchConfig>
export type AdvancedSearchConfigWithFieldsResolved = Omit<
  AdvancedSearchConfig,
  'fields'
> & { fields: FieldConfig[] }
