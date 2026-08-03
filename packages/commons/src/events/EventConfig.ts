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
import { Conditional } from './Conditional'
import type { JSONSchema } from '../conditionals/conditionals'
import { AvailableIcons } from '../icons'
import { PlainDate } from './PlainDate'
import {
  validateActionOrder,
  validateActionFlags,
  validatePlaceOfEvent,
  validateDateOfEvent,
  validateAdvancedSearchConfig,
  validateVersionWindow
} from './eventConfigValidation'

export const EventFieldReference = z
  .object({ $$event: EventMetadataDateFieldIdInput })
  .describe(
    'Reference to a field defined in the event metadata, using the field id.'
  )

export type EventConfig = {
  id: string
  /**
   * Opaque identifier for this configuration snapshot, unique per `id`.
   * Together with `id`, forms the natural key for a form version (e.g. "v1", "legacy-1985").
   * Defaults to `"legacy"` so pre-versioning configs keep parsing unchanged.
   */
  version: string
  /** Date this version starts governing new (or explicitly pinned) declarations. */
  effectiveFrom: PlainDate
  /** Date this version stops applying, if it's a closed historical/legacy window. Open-ended (current) versions omit this. */
  effectiveTo?: PlainDate
  /** The `version` this one replaces, for lineage/audit display only — not used in resolution. */
  supersedes?: string
  /** Human-readable label for this version, e.g. "2027 Legal Update" or "Pre-1996 Paper Form". */
  versionLabel?: TranslationConfig
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
  analytics: boolean
  icon?: Partial<Record<AvailableIcons, JSONSchema>>
}

export type EventConfigInput = Omit<
  EventConfig,
  | 'advancedSearch'
  | 'flags'
  | 'declaration'
  | 'actions'
  | 'dateOfEvent'
  | 'placeOfEvent'
  | 'analytics'
  | 'version'
  | 'effectiveFrom'
  | 'effectiveTo'
> & {
  version?: string
  effectiveFrom?: string
  effectiveTo?: string
  dateOfEvent?:
    | z.input<typeof FieldReference>
    | z.infer<typeof EventFieldReference>
  placeOfEvent?: z.input<typeof FieldReference>
  advancedSearch?: AdvancedSearchConfig[]
  flags?: FlagConfig[]
  declaration: DeclarationFormConfigInput
  actions: z.input<typeof ActionConfig>[]
  analytics?: boolean
}

/**
 * Description of event features defined by the country. Includes configuration for process steps and forms involved.
 *
 * `Event.parse(config)` will throw an error if the configuration is invalid.
 */
const _EventConfigBase: z.ZodType<EventConfig, EventConfigInput> = z.object({
  id: z
    .string()
    .describe(
      'Machine-readable identifier of the event (e.g. "birth", "death").'
    ),
  version: z
    .string()
    .optional()
    .default('legacy')
    .describe(
      'Opaque identifier for this configuration snapshot, unique per `id` (e.g. "v1", "legacy-1985"). Defaults to "legacy" so pre-versioning configs keep parsing unchanged.'
    ),
  effectiveFrom: PlainDate.optional()
    .default(() => PlainDate.parse('1970-01-01'))
    .describe(
      'Date this version starts governing new (or explicitly pinned) declarations. Defaults to the epoch so pre-versioning configs behave as an always-active legacy version.'
    ),
  effectiveTo: PlainDate.optional().describe(
    'Date this version stops applying, for a closed historical/legacy window. Omit for the current, open-ended version.'
  ),
  supersedes: z
    .string()
    .optional()
    .describe(
      'The `version` this one replaces, for lineage/audit display only — not used in resolution.'
    ),
  versionLabel: TranslationConfig.optional().describe(
    'Human-readable label for this version, e.g. "2027 Legal Update" or "Pre-1996 Paper Form".'
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
  label: TranslationConfig.describe('Human-readable label for the event type.'),
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

export const EventConfig: z.ZodType<EventConfig, EventConfigInput> =
  _EventConfigBase
    .superRefine((event, ctx) => {
      validateAdvancedSearchConfig(event, ctx)
      validateDateOfEvent(event, ctx)
      validatePlaceOfEvent(event, ctx)
      validateActionFlags(event, ctx)
      validateActionOrder(event, ctx)
      validateVersionWindow(event, ctx)
    })
    .meta({
      id: 'EventConfig',
      description:
        'Configuration defining an event type registered in OpenCRVS (for example birth or death).'
    })
