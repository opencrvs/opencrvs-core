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
import { DeclarationFormConfigInput } from './FormConfig'
import { FieldReference } from './FieldConfig'
import { EventMetadataDateFieldIdInput } from './EventMetadata'
import { FlagConfig } from './Flag'
import { Conditional } from './Conditional'
import type { JSONSchema } from '../conditionals/conditionals'
import { AvailableIcons } from '../icons'
import { ActionType } from './ActionType'
import {
  validateActionOrder,
  validateActionFlags,
  validatePlaceOfEvent,
  validateDateOfEvent,
  validateAdvancedSearchConfig,
  validateExactlyOneDeclareAction
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
  advancedSearch: AdvancedSearchConfig[]
  flags: FlagConfig[]
  analytics: boolean
  icon?: Partial<Record<AvailableIcons, JSONSchema>>
}

type ActionConfigInput = z.input<typeof ActionConfig>

type DeclareActionConfigInput = Extract<
  ActionConfigInput,
  { type: typeof ActionType.DECLARE }
>

/**
 * Input accepted by `EventConfig.parse`. `declaration` lives only on the DECLARE action.
 */
type EventConfigSchemaInput = Omit<
  EventConfig,
  | 'advancedSearch'
  | 'flags'
  | 'actions'
  | 'dateOfEvent'
  | 'placeOfEvent'
  | 'analytics'
> & {
  dateOfEvent?:
    | z.input<typeof FieldReference>
    | z.infer<typeof EventFieldReference>
  placeOfEvent?: z.input<typeof FieldReference>
  advancedSearch?: AdvancedSearchConfig[]
  flags?: FlagConfig[]
  actions: ActionConfigInput[]
  analytics?: boolean
}

/**
 * Input accepted by `defineConfig`.
 * `declaration` may be given at the top level (kept for backwards compatibility)
 * or on the DECLARE action.
 * `defineConfig` checks at runtime that it is given in exactly one of these places.
 */
export type EventConfigInput = Omit<EventConfigSchemaInput, 'actions'> & {
  declaration?: DeclarationFormConfigInput
  actions: Array<
    | Exclude<ActionConfigInput, DeclareActionConfigInput>
    | (Omit<DeclareActionConfigInput, 'declaration'> & {
        declaration?: DeclarationFormConfigInput
      })
  >
}

/**
 * Description of event features defined by the country. Includes configuration for process steps and forms involved.
 *
 * `Event.parse(config)` will throw an error if the configuration is invalid.
 */
const _EventConfigBase: z.ZodType<EventConfig, EventConfigSchemaInput> =
  z.object({
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
        'Configuration of core and custom actions associated with the event.'
      ),
    actionOrder: z
      .array(z.string())
      .optional()
      .describe(
        'Order of actions in the action menu. Use either the action type for core actions or the customActionType for custom actions.'
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
        'Configuration of custom flags associated with the actions of this event type.'
      ),
    analytics: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        'Indicates whether the records of this event type are included in analytics'
      ),
    icon: z
      .partialRecord(AvailableIcons, Conditional)
      .optional()
      .describe(
        'Maps an icon name to a conditional. The icon of the first entry (in definition order) whose conditional matches the event is used when rendering it (e.g. in the "iconWithName"/"iconWithNameEvent" workqueue columns). Falls back to the default status-based icon when unset or when no conditional matches.'
      )
  })

export const EventConfig: z.ZodType<EventConfig, EventConfigSchemaInput> =
  _EventConfigBase
    .superRefine((event, ctx) => {
      if (!validateExactlyOneDeclareAction(event, ctx)) {
        return
      }
      validateAdvancedSearchConfig(event, ctx)
      validateDateOfEvent(event, ctx)
      validatePlaceOfEvent(event, ctx)
      validateActionFlags(event, ctx)
      validateActionOrder(event, ctx)
    })
    .meta({
      id: 'EventConfig',
      description:
        'Configuration defining an event type registered in OpenCRVS (for example birth or death).'
    })
