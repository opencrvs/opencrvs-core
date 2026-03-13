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
import { ActionConfig } from './ActionConfig'
import { SummaryConfig } from './SummaryConfig'
import { TranslationConfig } from './TranslationConfig'
import { AdvancedSearchConfig } from './AdvancedSearchConfig'
import { DeclarationFormConfig, DeclarationFormConfigInput } from './FormConfig'
import { FieldReference } from './FieldConfig'
import { EventMetadataDateFieldIdInput } from './EventMetadata'
import { FlagConfig } from './Flag'
import {
  validateActionOrder,
  validateActionFlags,
  validatePlaceOfEvent,
  validateDateOfEvent,
  validateAdvancedSearchConfig
} from './eventConfigValidation'

export const EventFieldReference = z
  .object({ $$event: EventMetadataDateFieldIdInput })
  .describe(
    'Reference to a field defined in the event metadata, using the field id.'
  )

export type EventConfig = {
  id: string
  dateOfEvent?: FieldReference | z.infer<typeof EventFieldReference>
  placeOfEvent?: FieldReference
  title: TranslationConfig
  fallbackTitle?: TranslationConfig
  summary: SummaryConfig
  label: TranslationConfig
  actions: ActionConfig[]
  actionOrder?: string[]
  declaration: DeclarationFormConfig
  advancedSearch: AdvancedSearchConfig[]
  flags: FlagConfig[]
}

export type EventConfigInput = Omit<
  EventConfig,
  | 'advancedSearch'
  | 'flags'
  | 'declaration'
  | 'actions'
  | 'dateOfEvent'
  | 'placeOfEvent'
> & {
  dateOfEvent?:
    | z.input<typeof FieldReference>
    | z.infer<typeof EventFieldReference>
  placeOfEvent?: z.input<typeof FieldReference>
  advancedSearch?: AdvancedSearchConfig[]
  flags?: FlagConfig[]
  declaration: DeclarationFormConfigInput
  actions: z.input<typeof ActionConfig>[]
}

/**
 * Description of event features defined by the country. Includes configuration for process steps and forms involved.
 *
 * `Event.parse(config)` will throw an error if the configuration is invalid.
 */
export const EventConfig: z.ZodType<EventConfig, EventConfigInput> = z
  .object({
    id: z
      .string()
      .describe(
        'Machine-readable identifier of the event (e.g. "birth", "death").'
      ),
    dateOfEvent: FieldReference.or(EventFieldReference)
      .optional()
      .describe(
        'Reference to the field capturing the date of the event (e.g. date of birth). Defaults to the event creation date if unspecified.'
      ),
    placeOfEvent: FieldReference.optional().describe(
      'Reference to the field capturing the place of the event (e.g. place of birth). Defaults to the meta.createdAtLocation if unspecified.'
    ),
    title: TranslationConfig.describe(
      'Title template for the singular event, supporting variables (e.g. "{applicant.name.firstname} {applicant.name.surname}").'
    ),
    fallbackTitle: TranslationConfig.optional().describe(
      'Fallback title shown when the main title resolves to an empty value.'
    ),
    summary: SummaryConfig.describe(
      'Summary information displayed in the event overview.'
    ),
    label: TranslationConfig.describe(
      'Human-readable label for the event type.'
    ),
    actions: z
      .array(ActionConfig)
      .describe(
        'Configuration of system-defined actions associated with the event.'
      ),
    actionOrder: z
      .array(z.string())
      .optional()
      .describe(
        'Order of actions in the action menu. Use either the action type for core actions or the customActionType for custom actions.'
      ),
    declaration: DeclarationFormConfig.describe(
      'Configuration of the form used to gather event data.'
    ),
    advancedSearch: z
      .array(AdvancedSearchConfig)
      .optional()
      .default([])
      .describe(
        'Configuration of fields available in the advanced search feature.'
      ),
    flags: z
      .array(FlagConfig)
      .optional()
      .default([])
      .describe(
        'Configuration of flags associated with the actions of this event type.'
      )
  })
  .superRefine((event, ctx) => {
    validateAdvancedSearchConfig(event, ctx)
    validateDateOfEvent(event, ctx)
    validatePlaceOfEvent(event, ctx)
    validateActionFlags(event, ctx)
    validateActionOrder(event, ctx)
  })
  .meta({
    id: 'EventConfig'
  })
  .describe('Configuration defining an event type.')
