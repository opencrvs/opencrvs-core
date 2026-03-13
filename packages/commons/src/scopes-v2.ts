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
import * as qs from 'qs'
import {
  ConfigurableScopeType,
  parseConfigurableScope,
  parseLiteralScope
} from './scopes'
import { UUID } from './uuid'

/*
 * V2 file will be unified with the scopes during 2.0 development.
 * We separate scope changes to phases in order to not block other development.
 */

export const JurisdictionFilter = z
  .enum(['administrativeArea', 'location', 'all'])
  .describe(
    'Filters based on user jurisdiction relative to their office location in hierarchy.'
  )
export type JurisdictionFilter = z.infer<typeof JurisdictionFilter>

export const UserFilter = z
  .enum(['user'])
  .describe('Filters based on the user. Limits to self.')
export type UserFilter = z.infer<typeof UserFilter>

/**
 * The different types of scopes that can be used to control access to records. Each type has different options that can be used to further filter the records that the scope applies to.
 * When adding new scope types, they should be added to the appropriate section based on the options they require.
 *
 * @see scopeOptionsPlaceEvent @see scopeOptionsDeclared @see scopeOptionsFull
 */
export const RecordScopeTypeV2 = z.enum([
  'record.search',
  'record.create',
  'record.read',
  'record.declare',
  'record.notify',
  'record.edit',
  'record.reject',
  'record.archive',
  'record.review-duplicates',
  'record.register',
  'record.print-certified-copies',
  'record.request-correction',
  'record.correct',
  'record.unassign-others'
])
export type RecordScopeTypeV2 = z.infer<typeof RecordScopeTypeV2>

const scopeByEvent = z
  // Ensure input is always an array for consistent parsing, even if a single string is provided by qs.
  .preprocess(
    (val) => (val === undefined ? undefined : [val].flat()),
    z.array(z.string()).optional()
  )
  .describe('Event type, e.g. birth, death')

const scopeOptionsPlaceEvent = z
  .object({
    event: scopeByEvent,
    placeOfEvent: JurisdictionFilter.optional()
  })
  .describe('Options applicable to all record scopes.')

const scopeOptionsDeclared = scopeOptionsPlaceEvent
  .extend({
    declaredIn: JurisdictionFilter.optional(),
    declaredBy: UserFilter.optional()
  })
  .describe('Options applicable to actions that may take place after DECLARE')

const ScopeOptionsFull = scopeOptionsDeclared
  .extend({
    registeredIn: JurisdictionFilter.optional(),
    registeredBy: UserFilter.optional()
  })
  .describe(
    'Options applicable to actions that may take place after REGISTER, with full filtering capabilities.'
  )

export type ScopeOptionsFull = z.infer<typeof ScopeOptionsFull>
export const ScopeOptionKey = ScopeOptionsFull.keyof()
export type ScopeOptionKey = z.infer<typeof ScopeOptionKey>

const ResolvedScopeOptionsPlaceEvent = z
  .object({
    event: scopeByEvent,
    placeOfEvent: UUID.nullish()
  })
  .describe(
    'Resolved options applicable to all record scopes, with location ID instead of jurisdiction filter.'
  )

const ResolvedScopeOptionsDeclared = ResolvedScopeOptionsPlaceEvent.extend({
  declaredIn: UUID.nullish(),
  declaredBy: z.string().optional()
}).describe(
  'Resolved options applicable to actions that may take place after DECLARE, with location ID and user ID instead of filters.'
)

const ResolvedScopeOptionsFull = ResolvedScopeOptionsDeclared.extend({
  registeredIn: UUID.nullish(),
  registeredBy: z.string().optional()
}).describe(
  'Resolved options applicable to actions that may take place after REGISTER, with full filtering capabilities and location/user IDs instead of filters.'
)

export const ScopesWithPlaceEventOptions = RecordScopeTypeV2.extract([
  'record.create',
  'record.declare',
  'record.notify'
])

export const ScopesWithDeclaredOptions = RecordScopeTypeV2.extract([
  'record.edit',
  'record.reject',
  'record.archive',
  'record.review-duplicates',
  'record.register'
])

export const ScopesWithFullOptions = RecordScopeTypeV2.extract([
  'record.search',
  'record.read',
  'record.request-correction',
  'record.correct',
  'record.unassign-others'
])

const ScopeOptionsPrintCertifiedCopies = ScopeOptionsFull.extend({
  templates: z
    // Ensure input is always an array for consistent parsing, even if a single string is provided by qs.
    .preprocess(
      (val) => (val === undefined ? undefined : [val].flat()),
      z.array(z.string()).optional()
    )
    .describe(
      'Template IDs for certified copies. If not provided, all templates will be used.'
    )
})

export const RecordScopeV2 = z
  .discriminatedUnion('type', [
    z.object({
      type: ScopesWithPlaceEventOptions,
      options: scopeOptionsPlaceEvent.optional()
    }),
    z.object({
      type: ScopesWithDeclaredOptions,
      options: scopeOptionsDeclared.optional()
    }),
    z.object({
      type: ScopesWithFullOptions,
      options: ScopeOptionsFull.optional()
    }),
    z.object({
      type: z.literal('record.print-certified-copies'),
      options: ScopeOptionsPrintCertifiedCopies.optional()
    })
  ])
  .describe(
    "Scopes used to check user's permission to perform actions on a record."
  )

export function scopeUsesDeclaredOptions(
  scope: RecordScopeV2
): scope is Extract<
  RecordScopeV2,
  { type: z.infer<typeof ScopesWithDeclaredOptions> }
> {
  // If the scope has less, it is found here. Otherwise in other categories.
  return !ScopesWithPlaceEventOptions.options.some((opt) => opt === scope.type)
}

export function scopeUsesFullOptions(
  scope: RecordScopeV2
): scope is Extract<
  RecordScopeV2,
  { type: z.infer<typeof ScopesWithFullOptions> }
> {
  return ScopesWithFullOptions.options.some((opt) => opt === scope.type)
}

export function scopeUsesPrintCertifiedCopiesOptions(
  scope: RecordScopeV2
): scope is Extract<RecordScopeV2, { type: 'record.print-certified-copies' }> {
  return scope.type === 'record.print-certified-copies'
}

export const ResolvedRecordScopeV2 = z
  .discriminatedUnion('type', [
    z.object({
      type: ScopesWithPlaceEventOptions,
      options: ResolvedScopeOptionsPlaceEvent.optional()
    }),
    z.object({
      type: ScopesWithDeclaredOptions,
      options: ResolvedScopeOptionsDeclared.optional()
    }),
    z.object({
      type: ScopesWithFullOptions,
      options: ResolvedScopeOptionsFull.optional()
    }),
    z.object({
      type: z.literal('record.print-certified-copies'),
      options: ResolvedScopeOptionsFull.extend({
        templates: z.array(z.string()).optional()
      }).optional()
    })
  ])
  .describe('Resolved scope with location/user IDs instead of filters.')

export type RecordScopeV2 = z.infer<typeof RecordScopeV2>
export type ResolvedRecordScopeV2 = z.infer<typeof ResolvedRecordScopeV2>

const flattenScope = (scope: RecordScopeV2) => ({
  type: scope.type,
  ...scope.options
})

const unflattenScope = (input: Record<string, unknown>) => {
  const { type, ...options } = input
  return { type, options }
}

export const encodeScope = (scope: RecordScopeV2): string => {
  const flattened = flattenScope(scope)

  return qs.stringify(flattened, {
    arrayFormat: 'comma',
    allowDots: true,
    addQueryPrefix: false,
    encode: false
  })
}

export const decodeScope = (query: string) => {
  const scope = qs.parse(query, {
    ignoreQueryPrefix: true,
    comma: true,
    allowDots: true
  })

  const unflattenedScope = unflattenScope(scope)

  return RecordScopeV2.safeParse(unflattenedScope)?.data
}

/** If a certain scope option is not set, we use the default value. */
const DEFAULT_SCOPE_OPTIONS: ScopeOptionsFull = {
  placeOfEvent: JurisdictionFilter.enum.all
}

/**
 * Function to get the value of a scope option (aka. scope attribute)
 *
 * @param scope - The scope to get the value of the option from.
 * @param option - The option to get the value of.
 * @returns The value of the scope option. Will return the default value if the option is not set.
 */
export function getScopeOptionValue<T extends ScopeOptionKey>(
  scope: RecordScopeV2,
  option: T
): ScopeOptionsFull[T] | undefined {
  const options = scope.options as Partial<ScopeOptionsFull> | undefined
  const value = options?.[option]

  const defaultValue =
    option in DEFAULT_SCOPE_OPTIONS ? DEFAULT_SCOPE_OPTIONS[option] : undefined

  return value ?? defaultValue
}

type LegacyScopeType = ConfigurableScopeType

/**
 * Mapping of V1 scope types to V2 scope types.
 *
 * Unifies the naming structure by dropping the status from the string.
 * This is done in order to more easily represent the scopes in human-readable formant, and to match better with the system actions.
 */
const v1ToV2ConfigScopeTypeMap: Record<LegacyScopeType, string> = {
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
  'record.custom-action': 'record.custom-action',
  'record.declared.edit': 'record.edit'
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
export const v1ScopeToV2Scope = (v1Scope: string) => {
  const configurableV1Scope = parseConfigurableScope(v1Scope)
  const literalV1Scope = parseLiteralScope(v1Scope)

  if (!configurableV1Scope && !literalV1Scope) {
    throw new Error(`Invalid V1 scope: ${v1Scope}`)
  }

  if (literalV1Scope) {
    return encodeScope(literalV1Scope as RecordScopeV2) // Literal scopes have same structure in V2, just encode to string.
  }

  if (configurableV1Scope) {
    const type = v1ToV2ConfigScopeTypeMap[configurableV1Scope.type]

    if (type === undefined) {
      throw new Error(`Unsupported V1 scope type: ${configurableV1Scope.type}`)
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

    return encodeScope({
      type: type as RecordScopeTypeV2,
      options: configurableV1Scope.options as RecordScopeV2['options']
    })
  }

  throw new Error(`Unsupported V1 scope type: ${v1Scope}`)
}

export function getAcceptedScopesByType({
  acceptedScopes,
  scopes
}: {
  acceptedScopes: RecordScopeTypeV2[]
  scopes: (LegacyScopeType | string)[]
}): RecordScopeV2[] {
  return scopes
    .map((scope) => {
      const parsedScope = decodeScope(scope)
      return parsedScope &&
        acceptedScopes.some(
          (acceptedScope) => acceptedScope === parsedScope.type
        )
        ? parsedScope
        : null
    })
    .filter((scope): scope is RecordScopeV2 => scope !== null)
}

export function canUserCreateEvent(
  acceptedScopes: RecordScopeV2[],
  eventType: string
) {
  return acceptedScopes.some((scope) => {
    if (scope.options?.event === undefined) {
      return true
    }

    if (scope.options.event.includes(eventType)) {
      return true
    }

    return false
  })
}
