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
import {
  EncodedScope,
  encodeScope,
  RecordScopeTypeV2,
  RecordScopeV2,
  Scope
} from './scopes'

/**
 * @deprecated - will be removed in v2.1.
 * Configurable scopes are for example:
 * user.create[role=first-role|second-role]
 * record.notify[event=birth]
 * record.registered.print-certified-copies[event=birth|tennis-club-membership]
 */
const rawConfigurableScopeRegex =
  /^([a-zA-Z][a-zA-Z0-9.-]*(?:\.[a-zA-Z0-9.-]+)*)\[((?:\w+=[\w.-]+(?:\|[\w.-]+)*)(?:,[\w]+=[\w.-]+(?:\|[\w.-]+)*)*)\]$/

/**
 * @deprecated - will be removed in v2.1.
 */
const rawConfigurableScope = z.string().regex(rawConfigurableScopeRegex)

const SearchScope = z.object({
  type: z.literal('search'),
  options: z.object({
    event: z.array(z.string()).length(1),
    access: z.array(z.enum(['my-jurisdiction', 'all'])).length(1)
  })
})

/**
 * @deprecated - will be removed in v2.1.
 */
const CreateUserScope = z.object({
  type: z.literal('user.create'),
  options: z.object({
    role: z.array(z.string())
  })
})

/**
 * @deprecated - will be removed in v2.1.
 */
const EditUserScope = z.object({
  type: z.literal('user.edit'),
  options: z.object({
    role: z.array(z.string())
  })
})

/**
 * @deprecated - will be removed in v2.1.
 */
const WorkqueueScope = z.object({
  type: z.literal('workqueue'),
  options: z.object({
    id: z.array(z.string())
  })
})

/**
 * @deprecated - will be removed in v2.1.
 */
const PrintCertifiedCopiesScope = z.object({
  type: z.literal('record.registered.print-certified-copies'),
  options: z.object({
    event: z.array(z.string()).describe('Event type, e.g. birth, death'),
    templates: z
      .array(z.string())
      .optional()
      .describe(
        'Template IDs for certified copies. If not provided, all templates will be used.'
      )
  })
})

/**
 * Legacy record scopes are not supported in 2.0.
 * They are solely for migration purposes.
 * @deprecated - will be removed in v2.1.
 */
const LegacyRecordScope = z
  .object({
    type: z.enum([
      'record.create',
      'record.read',
      'record.declare',
      'record.notify',
      'record.declared.edit',
      'record.declared.validate',
      'record.declared.reject',
      'record.declared.archive',
      'record.declared.review-duplicates',
      'record.register',
      'record.registered.request-correction',
      'record.registered.correct',
      'record.unassign-others'
    ]),
    options: z.object({
      event: z.array(z.string()).describe('Event type, e.g. birth, death')
    })
  })
  .describe(
    "Scopes used to check user's permission to perform actions on a record."
  )

/**
 * @deprecated - will be removed in v2.1.
 */
const ConfigurableRawScopes = z.discriminatedUnion('type', [
  SearchScope,
  LegacyRecordScope,
  PrintCertifiedCopiesScope,
  CreateUserScope,
  EditUserScope,
  WorkqueueScope
])

type ConfigurableRawScopes = z.infer<typeof ConfigurableRawScopes>
type ConfigurableScopeType = ConfigurableRawScopes['type']

type ConfigurableScopes = Exclude<ConfigurableRawScopes, { type: 'search' }>

type FlattenedSearchScope = {
  type: 'search'
  options: Record<string, 'my-jurisdiction' | 'all'>
}

/**
 * @deprecated will be removed in v2.1.
 *
 */
export function findScope<T extends ConfigurableScopeType>(
  scopes: string[],
  scopeType: T
) {
  const parsedScopes = scopes.map(parseConfigurableScope)
  const searchScopes = parsedScopes.filter((scope) => scope?.type === 'search')
  const otherScopes = parsedScopes.filter((scope) => scope?.type !== 'search')
  const mergedSearchScope = flattenAndMergeScopes(searchScopes)

  return [...otherScopes, mergedSearchScope].find(
    (scope): scope is Extract<ConfigurableScopes, { type: T }> =>
      scope?.type === scopeType
  )
}
/**
 * @deprecated will be removed in v2.1.
 * Parses a raw options string for non-search scopes (e.g., workqueues).
 * @param rawOptions - The raw string, e.g. "event=birth|club-reg,all"
 * @returns An object like: { event: ['birth', 'club-reg'], access: ['all'] }
 */

function flattenAndMergeScopes(
  scopes: Extract<ConfigurableRawScopes, { type: 'search' }>[]
): FlattenedSearchScope | null {
  if (scopes.length === 0) return null

  const type = scopes[0].type // all scopes have same `type`
  const mergedOptions: Record<string, 'my-jurisdiction' | 'all'> = {}

  for (const scope of scopes) {
    const entries = Object.entries(scope.options)

    if (entries.length < 2) continue

    // Assumes the first key (e.g., 'event') holds source values like ['birth', 'death']
    const sourceValues = entries[0][1]

    // Assumes the second key (e.g., 'access') holds corresponding target values like ['my-jurisdiction', 'all']
    const targetValues = entries[1][1]

    for (let i = 0; i < sourceValues.length; i++) {
      mergedOptions[sourceValues[i]] = targetValues[i] as
        | 'my-jurisdiction'
        | 'all'
    }
  }

  return { type, options: mergedOptions }
}

/**
 * @deprecated - will be removed in v2.1.
 */
function getScopeOptions(rawOptions: string) {
  return rawOptions
    .split(',')
    .reduce((acc: Record<string, string[]>, option) => {
      const [key, value] = option.split('=')
      acc[key] = value.split('|')
      return acc
    }, {})
}

/**
 * @deprecated - Remove on 2.1.
 * Parses a configurable scope string into a ConfigurableRawScopes object.
 * @param {string} scope - The scope string to parse
 * @returns {ConfigurableRawScopes | undefined} The parsed scope object if valid, undefined otherwise
 * @example
 * parseScope("user.create[role=field-agent|registration-agent]")
 * // Returns: { type: "user.create", options: { role: ["field-agent", "registration-agent"] } }
 */
export function parseConfigurableScope(scope: string) {
  const maybeConfigurableScope = rawConfigurableScope.safeParse(scope)

  if (!maybeConfigurableScope.success) {
    return
  }

  const rawScope = maybeConfigurableScope.data
  const [, type, rawOptions] = rawScope.match(rawConfigurableScopeRegex) ?? []

  // Different options are separated by commas, and each option value is separated by a pipe e.g.:
  // record.digitise[event=birth|tennis-club-membership, my-jurisdiction]
  const options = getScopeOptions(rawOptions)

  const parsedScope = {
    type,
    options
  }

  const result = ConfigurableRawScopes.safeParse(parsedScope)
  return result.success ? result.data : undefined
}

/**
 * @deprecated - These are v1.8 legacy literal scopes which are no longer supported on v2.0. However, they are automatically migrated to v2.0 scopes.
 * */
export const SCOPES = {
  BYPASSRATELIMIT: 'bypassratelimit',
  RECORD_REINDEX: 'record.reindex',
  RECORD_IMPORT: 'record.import',
  ATTACHMENT_UPLOAD: 'attachment.upload',
  USER_DATA_SEEDING: 'user.data-seeding',
  INTEGRATION_CREATE: 'integration.create',
  PERFORMANCE_EXPORT_VITAL_STATISTICS: 'performance.vital-statistics-export',
  PROFILE_ELECTRONIC_SIGNATURE: 'profile.electronic-signature',
  PERFORMANCE_READ: 'performance.read',
  PERFORMANCE_READ_DASHBOARDS: 'performance.read-dashboards',
  CONFIG_UPDATE_ALL: 'config.update-all',
  ORGANISATION_READ_LOCATIONS: 'organisation.read-locations',
  ORGANISATION_READ_LOCATIONS_MY_OFFICE:
    'organisation.read-locations:my-office',
  ORGANISATION_READ_LOCATIONS_MY_JURISDICTION:
    'organisation.read-locations:my-jurisdiction',
  USER_CREATE: 'user.create:all',
  USER_READ: 'user.read:all',
  USER_UPDATE: 'user.update:all',
  USER_READ_MY_OFFICE: 'user.read:my-office',
  USER_READ_MY_JURISDICTION: 'user.read:my-jurisdiction',
  USER_READ_ONLY_MY_AUDIT: 'user.read:only-my-audit',
  USER_CREATE_MY_JURISDICTION: 'user.create:my-jurisdiction',
  USER_UPDATE_MY_JURISDICTION: 'user.update:my-jurisdiction'
} as const

const literalScopeToV2ScopeMap: Record<
  (typeof SCOPES)[keyof typeof SCOPES],
  Scope
> = {
  [SCOPES.BYPASSRATELIMIT]: { type: 'bypassratelimit' },
  [SCOPES.RECORD_REINDEX]: { type: 'record.reindex' },
  [SCOPES.RECORD_IMPORT]: { type: 'record.import' },
  [SCOPES.ATTACHMENT_UPLOAD]: { type: 'attachment.upload' },
  [SCOPES.USER_DATA_SEEDING]: { type: 'user.data-seeding' },
  [SCOPES.INTEGRATION_CREATE]: { type: 'integration.create' },
  [SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS]: {
    type: 'performance.vital-statistics-export'
  },
  [SCOPES.PROFILE_ELECTRONIC_SIGNATURE]: {
    type: 'profile.electronic-signature'
  },
  [SCOPES.PERFORMANCE_READ]: { type: 'performance.read' },
  [SCOPES.PERFORMANCE_READ_DASHBOARDS]: { type: 'performance.read-dashboards' },
  [SCOPES.CONFIG_UPDATE_ALL]: { type: 'config.update-all' },
  [SCOPES.ORGANISATION_READ_LOCATIONS]: {
    type: 'organisation.read-locations'
  },
  [SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE]: {
    type: 'organisation.read-locations',
    options: { accessLevel: 'location' }
  },
  [SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION]: {
    type: 'organisation.read-locations',
    options: { accessLevel: 'administrativeArea' }
  },
  [SCOPES.USER_CREATE]: { type: 'user.create' },
  [SCOPES.USER_CREATE_MY_JURISDICTION]: {
    type: 'user.create',
    options: { accessLevel: 'administrativeArea' }
  },
  [SCOPES.USER_READ]: { type: 'user.read' },
  [SCOPES.USER_READ_MY_OFFICE]: {
    type: 'user.read',
    options: { accessLevel: 'location' }
  },
  [SCOPES.USER_READ_MY_JURISDICTION]: {
    type: 'user.read',
    options: { accessLevel: 'administrativeArea' }
  },
  [SCOPES.USER_READ_ONLY_MY_AUDIT]: { type: 'user.read-only-my-audit' },
  [SCOPES.USER_UPDATE]: { type: 'user.edit' },
  [SCOPES.USER_UPDATE_MY_JURISDICTION]: {
    type: 'user.edit',
    options: { accessLevel: 'administrativeArea' }
  }
} as const

/**
 * @deprecated - will be removed in v2.1.
 */
export function parseLiteralScope(scope: string) {
  if (scope in literalScopeToV2ScopeMap) {
    return literalScopeToV2ScopeMap[
      scope as keyof typeof literalScopeToV2ScopeMap
    ]
  }

  return undefined
}

/**
 * Mapping of V1 scope types to V2 scope types.
 *
 * Unifies the naming structure by dropping the status from the string.
 * This is done in order to more easily represent the scopes in human-readable formant, and to match better with the system actions.
 */
const v1ToV2ConfigScopeTypeMap: Record<string, string> = {
  search: 'record.search',
  workqueue: 'workqueue',
  'user.create': 'user.create',
  'user.edit': 'user.edit',
  'record.create': 'record.create',
  'record.read': 'record.read',
  'record.declare': 'record.declare',
  'record.notify': 'record.notify',
  'record.register': 'record.register',
  'record.unassign-others': 'record.unassign-others',
  'record.declared.reject': 'record.reject',
  'record.declared.archive': 'record.archive',
  'record.declared.review-duplicates': 'record.review-duplicates',
  'record.registered.print-certified-copies': 'record.print-certified-copies',
  'record.registered.request-correction': 'record.request-correction',
  'record.registered.correct': 'record.correct',
  'record.declared.edit': 'record.edit',
  'record.declared.validate': 'record.custom-action'
}

/**
 * Converts a V1 scope string to a V2 compatible scope string. Used to migrate between 1.9 and 2.0 scopes.
 * @deprecated - This will be removed after migration to V2 scopes is complete. Do not use for new development.
 *
 * NOTE: We are casting intentionally broad with the input and output types to allow for flexibility during migration, without forcing loose types on the rest of the codebase.
 *
 * @param v1Scope e.g. 'record.declared.reject[event=birth|death|tennis-club-membership]',
 * @returns corresponding V2 compatible scope string based on v1 input.
 */
export const legacyScopeToV2Scope = (v1Scope: string): EncodedScope => {
  const configurableV1Scope = parseConfigurableScope(v1Scope)
  const literalV1Scope = parseLiteralScope(v1Scope)

  if (!configurableV1Scope && !literalV1Scope) {
    throw new Error(`Invalid V1 scope: ${v1Scope}`)
  }

  if (literalV1Scope) {
    return encodeScope(literalV1Scope)
  }

  if (configurableV1Scope) {
    const type = v1ToV2ConfigScopeTypeMap[configurableV1Scope.type]

    if (type === undefined) {
      throw new Error(`Unsupported V1 scope type: ${configurableV1Scope.type}`)
    }

    if (configurableV1Scope.type === 'workqueue') {
      return encodeScope({
        type: 'workqueue',
        options: {
          ids: configurableV1Scope.options.id || []
        }
      })
    }

    if (configurableV1Scope.type === 'search') {
      return encodeScope({
        type: type as RecordScopeTypeV2,
        options: {
          event: configurableV1Scope.options.event || [],
          placeOfEvent:
            configurableV1Scope.options.access[0] === 'my-jurisdiction'
              ? 'administrativeArea'
              : 'all'
        }
      })
    }

    if (configurableV1Scope.type === 'record.declared.validate') {
      return encodeScope({
        type: 'record.custom-action',
        options: {
          event: configurableV1Scope.options.event,
          customActionTypes: ['VALIDATE_DECLARATION']
        }
      })
    }

    return encodeScope({
      type: type as RecordScopeTypeV2,
      options: configurableV1Scope.options as RecordScopeV2['options']
    })
  }

  throw new Error(`Unsupported V1 scope type: ${v1Scope}`)
}

/**
 * Helper for porting legacy scopes to new query-string "v2" model.
 *
 * Legacy scopes may include both:
 *   - v1.8 plain scopes, e.g. 'record.reindex'
 *   - v1.9 config scopes, e.g. 'record.read[event=birth|death|tennis-club-membership]'
 *
 * Output will be an array of v2 query string scopes.
 *
 * @param scopes legacy scopes
 * @returns array of v2 compatible scopes, filtering out the old ones not used anymore.
 */
export function migrateLegacyScopesToV2(scopes: string[]): string[] {
  return scopes
    .map((scope) => {
      try {
        return legacyScopeToV2Scope(scope)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Could not migrate scope: ${scope}. Error: ${error}`)
        return null
      }
    })
    .filter((scope): scope is EncodedScope => !!scope)
}
