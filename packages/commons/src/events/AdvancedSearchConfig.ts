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

const MatchType = z.enum(['FUZZY', 'EXACT', 'RANGE'])

const BaseField = z.object({
  config: z.object({
    type: MatchType.describe('Determines the type of field')
  }),
  options: z.array(SelectOption).optional()
})

export const FieldConfigSchema = BaseField.extend({
  fieldId: z.string(),
  fieldType: z.literal('field')
})

export const EventFieldId = z.enum(['trackingId', 'status'])
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
