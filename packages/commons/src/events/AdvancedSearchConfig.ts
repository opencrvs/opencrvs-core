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
import { SelectOption } from './FieldConfig'
import { FieldConditional } from './Conditional'
import { FieldValue } from './FieldValue'

const MatchType = z.enum(['fuzzy', 'exact', 'range'])

const BaseField = z.object({
  config: z.object({
    type: MatchType.describe('Determines the type of field')
  }),
  options: z.array(SelectOption).optional(),
  conditionals: z
    .array(FieldConditional)
    .default([])
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

export const EventFieldId = z.enum([
  'trackingId',
  'status',
  'legalStatus.REGISTERED.createdAt',
  'legalStatus.REGISTERED.createdAtLocation',
  'updatedAt'
])

export type EventFieldId = z.infer<typeof EventFieldId>

export const EventFieldConfigSchema = BaseField.extend({
  fieldId: EventFieldId,
  fieldType: z.literal('event')
})

export const SearchField = z.discriminatedUnion('fieldType', [
  FieldConfigSchema,
  EventFieldConfigSchema
])

export type SearchField = z.infer<typeof SearchField>

export const AdvancedSearchConfig = z.object({
  title: TranslationConfig.describe('Advanced search tab title'),
  fields: z.array(SearchField).describe('Advanced search fields.')
})

export type AdvancedSearchConfigInput = z.infer<typeof AdvancedSearchConfig>
export type AdvancedSearchConfig = z.infer<typeof AdvancedSearchConfig>
