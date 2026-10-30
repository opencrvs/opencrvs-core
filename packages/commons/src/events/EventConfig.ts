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
import { toPlainDateInTimeZone } from './PlainDate'
import { getOrThrow } from '../utils'
import {
  validateActionOrder,
  validateActionFlags,
  validatePlaceOfEvent,
  validateDateOfEvent,
  validateAdvancedSearchConfig,
  validateExactlyOneDeclareAction,
  validateNotificationForm
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
 * Input accepted by `EventConfig.parse`. `declaration` lives only on the DECLARE action,
 * and NOTIFY carries its `notificationForm` and `review`.
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
  /** @deprecated Define `declaration` on the DECLARE action instead. */
  declaration?: DeclarationFormConfigInput
  actions: Array<
    | Exclude<ActionConfigInput, DeclareActionConfigInput>
    | (Omit<DeclareActionConfigInput, 'declaration'> & {
        declaration?: DeclarationFormConfigInput
      })
  >
}

/**
 * Input accepted by `defineConfig` for one version of an event.
 * `declaration` lives only on the DECLARE action.
 */
export type EventConfigVersionInput = Omit<
  EventConfigSchemaInput,
  EventLevelField
> & {
  /** Identifier of the version, unique within the event (e.g. "birth-v2"). */
  id: string
  /** Date (YYYY-MM-DD) from which this version is effective. Without one, effective from the beginning of time. */
  effectiveFrom?: string
}

/**
 * Input accepted by `defineConfig` for an event with several versions.
 * `id`, `label` and `advancedSearch` are shared by every version.
 */
export type VersionedEventConfigInput = Pick<
  EventConfigInput,
  EventLevelField
> & {
  versions: EventConfigVersionInput[]
}

/** Fields shared by every version of an event. */
const eventLevelFields = {
  id: z
    .string()
    .describe(
      'Machine-readable identifier of the event (e.g. "birth", "death").'
    ),
  label: TranslationConfig.describe('Human-readable label for the event type.'),
  advancedSearch: z
    .array(AdvancedSearchConfig)
    .optional()
    .default([])
    .describe(
      'Configuration of fields available in the advanced search feature.'
    )
}

/** Fields that each version of an event defines for itself. */
const versionFields = {
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
}

/**
 * Description of event features defined by the country. Includes configuration for process steps and forms involved.
 *
 * `Event.parse(config)` will throw an error if the configuration is invalid.
 */
const _EventConfigBase: z.ZodType<EventConfig, EventConfigSchemaInput> =
  z.object({ ...eventLevelFields, ...versionFields })

/** Validations of one version of an event, read together with the fields shared by every version. */
export function validateEventConfig(
  event: EventConfig,
  ctx: z.RefinementCtx<EventConfig>
) {
  // This validation is made to early return, since following validations depend on the declare action being present and correctly configured.
  if (!validateExactlyOneDeclareAction(event, ctx)) {
    return
  }
  validateNotificationForm(event, ctx)
  validateAdvancedSearchConfig(event, ctx)
  validateDateOfEvent(event, ctx)
  validatePlaceOfEvent(event, ctx)
  validateActionFlags(event, ctx)
  validateActionOrder(event, ctx)
}

export const EventConfig: z.ZodType<EventConfig, EventConfigSchemaInput> =
  _EventConfigBase.superRefine(validateEventConfig).meta({
    id: 'EventConfig',
    description:
      'Configuration defining an event type registered in OpenCRVS (for example birth or death).'
  })

type EventLevelField = keyof typeof eventLevelFields

/** Id of the version of an event configured without `versions`. */
export const DEFAULT_EVENT_CONFIG_VERSION_ID = 'default'

/** `effectiveFrom` of a version configured without one. */
export const DEFAULT_EFFECTIVE_FROM = '0001-01-01'

/** One version of an event: what the event looks like from `effectiveFrom` on. */
export type EventConfigVersion = Omit<EventConfig, EventLevelField> & {
  id: string
  /** Date (YYYY-MM-DD) from which this version is effective. '0001-01-01' when configured without one. */
  effectiveFrom: string
}

/**
 * An event with every version of its configuration. This is what country config serves.
 * Read it through `resolveEventConfig`, which gives the configuration of one version.
 */
export type VersionedEventConfig = Pick<EventConfig, EventLevelField> & {
  versions: EventConfigVersion[]
}

const _EventConfigVersion: z.ZodType<
  EventConfigVersion,
  EventConfigVersionInput
> = z.object({
  id: z
    .string()
    .describe(
      'Identifier of the version, unique within the event (e.g. "birth-v2").'
    ),
  effectiveFrom: z.iso
    .date()
    .default(DEFAULT_EFFECTIVE_FROM)
    .describe(
      `Date (YYYY-MM-DD) from which this version is effective. A version without one is effective from the beginning of time ('${DEFAULT_EFFECTIVE_FROM}').`
    ),
  ...versionFields
})

/**
 * Keyed on the event as well as the version: after a refetch, a version may be the same
 * object while a field shared by every version (e.g. `label`) has changed.
 */
const resolvedConfigs = new WeakMap<
  VersionedEventConfig,
  WeakMap<EventConfigVersion, EventConfig>
>()

/**
 * @returns the configuration of `version`, together with the fields shared by every
 * version of the event. The same event and version give the same object, so caches
 * keyed on the configuration keep working.
 */
export function toEventConfig(
  config: VersionedEventConfig,
  version: EventConfigVersion
): EventConfig {
  let resolvedVersions = resolvedConfigs.get(config)
  if (!resolvedVersions) {
    resolvedVersions = new WeakMap()
    resolvedConfigs.set(config, resolvedVersions)
  }
  const cached = resolvedVersions.get(version)
  if (cached) {
    return cached
  }

  const { id: _id, effectiveFrom: _effectiveFrom, ...fields } = version
  const resolved: EventConfig = {
    ...fields,
    id: config.id,
    label: config.label,
    advancedSearch: config.advancedSearch
  }
  resolvedVersions.set(version, resolved)
  return resolved
}

/**
 * @returns the configuration of the version with id `versionId`.
 * @throws when the version is not configured.
 */
export function getEventConfigOfVersion(
  config: VersionedEventConfig,
  versionId: string
): EventConfig {
  return toEventConfig(
    config,
    getOrThrow(
      config.versions.find(({ id }) => id === versionId),
      `Event '${config.id}' has no version '${versionId}'`
    )
  )
}

/** Orders versions by `effectiveFrom`, earliest first. */
export function byEffectiveFrom(a: EventConfigVersion, b: EventConfigVersion) {
  return a.effectiveFrom.localeCompare(b.effectiveFrom)
}

/** @returns the version that takes effect earliest. */
function getEarliestVersion(config: VersionedEventConfig) {
  return [...config.versions].sort(byEffectiveFrom)[0]
}

/**
 * @returns the version in effect at `now`: the one with the latest `effectiveFrom` not
 * after the date of `now` in `timeZone`, the country's time zone, since versions take
 * effect at its midnight. Undefined when every version takes effect later.
 */
export function resolveEffectiveVersion(
  config: VersionedEventConfig,
  now: Date,
  timeZone: string
): EventConfigVersion | undefined {
  const today = toPlainDateInTimeZone(now, timeZone)
  return config.versions
    .filter(({ effectiveFrom }) => effectiveFrom <= today)
    .sort(byEffectiveFrom)
    .at(-1)
}

/**
 * @returns the configuration of the version a record is stamped with, like
 * `getEventConfigForRecord`, or undefined when that version is not configured.
 */
export function findEventConfigForRecord(
  config: VersionedEventConfig,
  record: { configVersionId?: string }
): EventConfig | undefined {
  const versionId = record.configVersionId ?? getEarliestVersion(config).id
  const version = config.versions.find(({ id }) => id === versionId)
  return version && toEventConfig(config, version)
}

/**
 * @returns the configuration of the version a record is stamped with. A record created
 * before versioning has no stamp and uses the earliest version.
 * @throws when the record's version is no longer configured.
 */
export function getEventConfigForRecord(
  config: VersionedEventConfig,
  record: { configVersionId?: string }
): EventConfig {
  return getOrThrow(
    findEventConfigForRecord(config, record),
    `Event '${config.id}' has no version '${record.configVersionId}'`
  )
}

/**
 * @returns the configuration of the version in effect today in `timeZone`, the
 * country's time zone (the earliest, when every version takes effect later). For a
 * record, use `getEventConfigForRecord` instead.
 */
export function resolveEventConfigInTimeZone(
  config: VersionedEventConfig,
  timeZone: string
): EventConfig {
  return toEventConfig(
    config,
    resolveEffectiveVersion(config, new Date(), timeZone) ??
      getEarliestVersion(config)
  )
}

/**
 * @returns the configuration of the version in effect today in UTC. For country config
 * code with no time zone at hand; core code uses `resolveEventConfigInTimeZone`.
 */
export function resolveEventConfig(config: VersionedEventConfig): EventConfig {
  return resolveEventConfigInTimeZone(config, 'UTC')
}

/**
 * Versions are told apart by `id` and by `effectiveFrom`: no two versions may share
 * either, and at most one may omit `effectiveFrom` (effective from the beginning of time).
 */
function validateVersionList(
  config: VersionedEventConfig,
  ctx: z.RefinementCtx<VersionedEventConfig>
) {
  const ids = new Set<string>()
  /** Id of the first version with each `effectiveFrom` */
  const versionIdByEffectiveFrom = new Map<string, string>()

  config.versions.forEach((version, index) => {
    if (ids.has(version.id)) {
      ctx.addIssue({
        code: 'custom',
        message: `Event '${config.id}' has more than one version with id '${version.id}'. Each version must have a different id.`,
        path: ['versions', index, 'id']
      })
    }
    ids.add(version.id)

    const sameEffectiveFromId = versionIdByEffectiveFrom.get(
      version.effectiveFrom
    )
    if (sameEffectiveFromId !== undefined) {
      const versionIds = `'${sameEffectiveFromId}', '${version.id}'`
      ctx.addIssue({
        code: 'custom',
        message:
          version.effectiveFrom !== DEFAULT_EFFECTIVE_FROM
            ? `Event '${config.id}' has more than one version with \`effectiveFrom\` '${version.effectiveFrom}' (${versionIds}). Each version must have a different \`effectiveFrom\`.`
            : `Event '${config.id}' has more than one version without \`effectiveFrom\` (${versionIds}). At most one version may omit it.`,
        path: ['versions', index, 'effectiveFrom']
      })
    } else {
      versionIdByEffectiveFrom.set(version.effectiveFrom, version.id)
    }
  })
}

/**
 * Runs `validate` on the configuration of each version (`events[i]` is that of
 * `versions[i]`). Issues on a field of the version are reported under that version.
 * Issues on a field shared by every version (e.g. `advancedSearch`) are reported once,
 * where they are defined.
 */
export function validateEachVersion<E>(
  ctx: Pick<z.RefinementCtx<unknown>, 'addIssue'>,
  events: E[],
  validate: (event: E, versionCtx: z.RefinementCtx<E>) => void
) {
  const reported = new Set<string>()

  events.forEach((event, index) => {
    const addIssue: z.RefinementCtx<E>['addIssue'] = (issue) => {
      if (typeof issue === 'string') {
        ctx.addIssue({
          code: 'custom',
          message: issue,
          path: ['versions', index]
        })
        return
      }

      const [field] = issue.path ?? []
      const isEventLevel =
        typeof field === 'string' && field in eventLevelFields
      const path = isEventLevel
        ? (issue.path ?? [])
        : ['versions', index, ...(issue.path ?? [])]
      const key = JSON.stringify([path, issue.message])
      if (reported.has(key)) {
        return
      }
      reported.add(key)
      ctx.addIssue({ ...issue, path })
    }

    validate(event, { value: event, addIssue } as z.RefinementCtx<E>)
  })
}

export const VersionedEventConfig: z.ZodType<
  VersionedEventConfig,
  VersionedEventConfigInput
> = z
  .object({
    ...eventLevelFields,
    versions: z
      .array(_EventConfigVersion)
      .min(1)
      .describe(
        `Versions of the event configuration, each effective from its \`effectiveFrom\`. An event configured without versions has a single version, with id '${DEFAULT_EVENT_CONFIG_VERSION_ID}' and \`effectiveFrom\` '${DEFAULT_EFFECTIVE_FROM}'.`
      )
  })
  .superRefine((config, ctx) => {
    validateVersionList(config, ctx)
    validateEachVersion(
      ctx,
      config.versions.map((version) => toEventConfig(config, version)),
      validateEventConfig
    )
  })
  .meta({
    id: 'VersionedEventConfig',
    description:
      'Configuration of an event type registered in OpenCRVS (for example birth or death), with every version of it.'
  })
