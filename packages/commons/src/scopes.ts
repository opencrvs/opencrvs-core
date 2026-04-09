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
import { UUID } from './uuid'
import { getScopes } from './authentication'

export const SCOPES = {
  // Demo user
  DEMO: 'demo',

  // TODO v1.8 legacy scopes
  BYPASSRATELIMIT: 'bypassratelimit',
  REGISTER: 'register',
  CONFIG: 'config',

  // systems / integrations
  WEBHOOK: 'webhook',
  NATIONALID: 'nationalId',
  NOTIFICATION_API: 'notification-api',
  RECORDSEARCH: 'recordsearch',
  RECORD_IMPORT: 'record.import',
  RECORD_EXPORT: 'record.export',
  RECORD_REINDEX: 'record.reindex',
  INTEGRATION_CREATE: 'integration.create',

  // declare
  RECORD_DECLARE_BIRTH: 'record.declare-birth',
  RECORD_DECLARE_BIRTH_MY_JURISDICTION: 'record.declare-birth:my-jurisdiction',
  RECORD_DECLARE_DEATH: 'record.declare-death',
  RECORD_DECLARE_DEATH_MY_JURISDICTION: 'record.declare-death:my-jurisdiction',
  RECORD_DECLARE_MARRIAGE: 'record.declare-marriage',
  RECORD_DECLARE_MARRIAGE_MY_JURISDICTION:
    'record.declare-marriage:my-jurisdiction',
  RECORD_SUBMIT_INCOMPLETE: 'record.declaration-submit-incomplete',

  // @todo: should this record be removed from events v2?
  RECORD_SUBMIT_FOR_REVIEW: 'record.declaration-submit-for-review',
  RECORD_UNASSIGN_OTHERS: 'record.unassign-others',

  // validate
  RECORD_SUBMIT_FOR_APPROVAL: 'record.declaration-submit-for-approval',
  RECORD_SUBMIT_FOR_UPDATES: 'record.declaration-submit-for-updates',
  RECORD_DECLARATION_EDIT: 'record.declaration-edit',
  RECORD_REVIEW_DUPLICATES: 'record.review-duplicates',
  RECORD_DECLARATION_ARCHIVE: 'record.declaration-archive',
  RECORD_DECLARATION_REINSTATE: 'record.declaration-reinstate',

  // register
  RECORD_REGISTER: 'record.register',
  /**
   * This scope is used to **print and **issue certified copies of a record
   * after it has been registered. Previously Registrars had this permission.
   */
  RECORD_PRINT_ISSUE_CERTIFIED_COPIES:
    'record.registration-print&issue-certified-copies',

  // correct
  RECORD_REGISTRATION_REQUEST_CORRECTION:
    'record.registration-request-correction',
  RECORD_REGISTRATION_CORRECT: 'record.registration-correct',
  RECORD_CONFIRM_REGISTRATION: 'record.confirm-registration',
  RECORD_REJECT_REGISTRATION: 'record.reject-registration',

  // search
  SEARCH_BIRTH_MY_JURISDICTION: 'search.birth:my-jurisdiction',
  SEARCH_BIRTH: 'search.birth',
  SEARCH_DEATH_MY_JURISDICTION: 'search.death:my-jurisdiction',
  SEARCH_DEATH: 'search.death',
  SEARCH_MARRIAGE_MY_JURISDICTION: 'search.marriage:my-jurisdiction',
  SEARCH_MARRIAGE: 'search.marriage',

  // audit v1.8
  RECORD_READ: 'record.read',

  // profile
  PROFILE_ELECTRONIC_SIGNATURE: 'profile.electronic-signature',

  // performance
  PERFORMANCE_READ: 'performance.read',
  PERFORMANCE_READ_DASHBOARDS: 'performance.read-dashboards',
  PERFORMANCE_EXPORT_VITAL_STATISTICS: 'performance.vital-statistics-export',

  // organisation
  ORGANISATION_READ_LOCATIONS: 'organisation.read-locations:all',
  ORGANISATION_READ_LOCATIONS_MY_OFFICE:
    'organisation.read-locations:my-office',
  ORGANISATION_READ_LOCATIONS_MY_JURISDICTION:
    'organisation.read-locations:my-jurisdiction',

  // user
  USER_READ: 'user.read:all',
  USER_READ_MY_OFFICE: 'user.read:my-office',
  USER_READ_MY_JURISDICTION: 'user.read:my-jurisdiction',
  USER_READ_ONLY_MY_AUDIT: 'user.read:only-my-audit', //v1.8
  USER_CREATE: 'user.create:all',
  USER_CREATE_MY_JURISDICTION: 'user.create:my-jurisdiction',
  USER_UPDATE: 'user.update:all',
  USER_UPDATE_MY_JURISDICTION: 'user.update:my-jurisdiction',

  // config
  CONFIG_UPDATE_ALL: 'config.update:all',

  // data seeding
  USER_DATA_SEEDING: 'user.data-seeding',

  // attachment
  ATTACHMENT_UPLOAD: 'attachment.upload'
} as const

// Legacy scopes
const LegacyScopes = z.union([
  z.literal(SCOPES.BYPASSRATELIMIT),
  z.literal(SCOPES.REGISTER),
  z.literal(SCOPES.CONFIG)
])

// Systems / integrations
const IntegrationScopes = z.union([
  z.literal(SCOPES.WEBHOOK),
  z.literal(SCOPES.NATIONALID),
  z.literal(SCOPES.NOTIFICATION_API),
  z.literal(SCOPES.RECORDSEARCH),
  z.literal(SCOPES.INTEGRATION_CREATE)
])

// Internal operations
const InternalOperationsScopes = z.union([
  z.literal(SCOPES.RECORD_REINDEX),
  z.literal(SCOPES.RECORD_IMPORT)
])

// Performance
const PerformanceScopes = z.union([
  z.literal(SCOPES.PERFORMANCE_READ),
  z.literal(SCOPES.PERFORMANCE_READ_DASHBOARDS),
  z.literal(SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS)
])

// Organisation
const OrganisationScopes = z.union([
  z.literal(SCOPES.ORGANISATION_READ_LOCATIONS),
  z.literal(SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE),
  z.literal(SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION)
])

// User
/**
 * @deprecated - will be removed in v2.1.
 */
const UserScopes = z.union([
  z.literal(SCOPES.USER_READ),
  z.literal(SCOPES.USER_READ_MY_OFFICE),
  z.literal(SCOPES.USER_READ_MY_JURISDICTION),
  z.literal(SCOPES.USER_READ_ONLY_MY_AUDIT),
  z.literal(SCOPES.USER_CREATE),
  z.literal(SCOPES.USER_CREATE_MY_JURISDICTION),
  z.literal(SCOPES.USER_UPDATE),
  z.literal(SCOPES.USER_UPDATE_MY_JURISDICTION)
])

// Config
/**
 * @deprecated - will be removed in v2.1.
 */
const ConfigScope = z.literal(SCOPES.CONFIG_UPDATE_ALL)

// Data seeding
/**
 * @deprecated - will be removed in v2.1.
 */
const DataSeedingScope = z.literal(SCOPES.USER_DATA_SEEDING)

// Attachment
/**
 * @deprecated - will be removed in v2.1.
 */
const AttachmentScope = z.literal(SCOPES.ATTACHMENT_UPLOAD)

// Combine all
/**
 * @deprecated - will be removed in v2.1.
 */
const LiteralScopes = z.union([
  LegacyScopes,
  IntegrationScopes,
  z.literal(SCOPES.PROFILE_ELECTRONIC_SIGNATURE),
  z.literal(SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES),
  PerformanceScopes,
  OrganisationScopes,
  UserScopes,
  ConfigScope,
  DataSeedingScope,
  InternalOperationsScopes,
  AttachmentScope
])

/**
 * @deprecated - will be removed in v2.1.
 */
export function parseLiteralScope(scope: string) {
  const maybeLiteralScope = LiteralScopes.safeParse(scope)

  if (maybeLiteralScope.success) {
    return {
      type: maybeLiteralScope.data
    }
  }

  return
}

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
  'record.unassign-others',
  'record.custom-action'
])

export type RecordScopeTypeV2 = z.infer<typeof RecordScopeTypeV2>

/** Plain scopes are scopes that dont have any options available. */
const PlainScopeType = z.enum([
  // Misc. system scopes
  'bypassratelimit',
  'record.reindex',
  'user.data-seeding',
  'integration.create',
  'record.import',
  'config.update-all',
  'attachment.upload',
  'profile.electronic-signature',
  'user.read-only-my-audit',

  // Performance dashboard
  'performance.read',
  'performance.read-dashboards',
  'performance.vital-statistics-export',

  // Scopes used exclusively by countryconfig integration token
  'record.confirm-registration',
  'record.reject-registration'
])

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

const AllRecordScopeOptions = scopeOptionsDeclared
  .extend({
    registeredIn: JurisdictionFilter.optional(),
    registeredBy: UserFilter.optional()
  })
  .describe(
    'Options applicable to actions that may take place after REGISTER, with full filtering capabilities.'
  )

const CustomActionScopeOptions = AllRecordScopeOptions.extend({
  customActionTypes: z
    .preprocess(
      (val) => (val === undefined ? undefined : [val].flat()),
      z.array(z.string()).optional()
    )
    .describe('Allowed custom action types')
})

type AllRecordScopeOptions = z.infer<typeof AllRecordScopeOptions>

const AccessLevelOptions = z.object({
  accessLevel: JurisdictionFilter.optional()
})

const WorkqueueOptions = z.object({
  ids: z
    .preprocess(
      (val) => (val === undefined ? undefined : [val].flat()),
      z.array(z.string())
    )
    .describe('Must contain a list of workqueue ids.')
})

const AllScopeOptions = z.object({
  ...AllRecordScopeOptions.shape,
  ...AccessLevelOptions.shape,
  ...WorkqueueOptions.shape
})

type AllScopeOptions = z.infer<typeof AllScopeOptions>
export const ScopeOptionKey = AllScopeOptions.keyof()
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

const ScopeOptionsPrintCertifiedCopies = AllRecordScopeOptions.extend({
  templates: z
    // Ensure input is always an array for consistent parsing, even if a single string is provided by qs.
    .preprocess(
      (val) => (val === undefined ? undefined : [val].flat()),
      z.array(z.string()).optional()
    )
    .describe(
      'Template IDs for certified copies. Controls which certificate templates are returned to the client via the config service. Certificate printing is a client-side operation — this option is not validated when the printCertificate action is submitted.'
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
      options: AllRecordScopeOptions.optional()
    }),
    z.object({
      type: z.literal('record.custom-action'),
      options: CustomActionScopeOptions.optional()
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
  scope: Scope
): scope is Extract<
  Scope,
  { type: z.infer<typeof ScopesWithDeclaredOptions> }
> {
  // If the scope has less, it is found here. Otherwise in other categories.
  return !ScopesWithPlaceEventOptions.options.some((opt) => opt === scope.type)
}

export function scopeUsesFullOptions(
  scope: Scope
): scope is Extract<Scope, { type: z.infer<typeof ScopesWithFullOptions> }> {
  return ScopesWithFullOptions.options.some((opt) => opt === scope.type)
}

export function scopeUsesPrintCertifiedCopiesOptions(
  scope: Scope
): scope is Extract<Scope, { type: 'record.print-certified-copies' }> {
  return scope.type === 'record.print-certified-copies'
}

export function isCustomActionScope(
  scope: Scope
): scope is Extract<Scope, { type: 'record.custom-action' }> {
  return scope.type === 'record.custom-action'
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

const SystemScopeType = z.enum([
  'organisation.read-locations',
  'user.read',
  'user.create',
  'user.edit'
])

export type SystemScopeType = z.infer<typeof SystemScopeType>

/** The primary scope schema which gathers all scope types together. All scopes are discriminated by type and options are determined according to the type. */
export const Scope = z.discriminatedUnion('type', [
  z.object({ type: PlainScopeType }),
  ...RecordScopeV2.options,
  z.object({ type: SystemScopeType, options: AccessLevelOptions.optional() }),
  z.object({ type: z.literal('workqueue'), options: WorkqueueOptions })
])

export type Scope = z.infer<typeof Scope>

export const ScopeType = z.enum([
  ...SystemScopeType.options,
  ...RecordScopeTypeV2.options,
  ...PlainScopeType.options,
  'workqueue'
])
export type ScopeType = z.infer<typeof ScopeType>

const flattenScope = (scope: Scope) => ({
  type: scope.type,
  ...('options' in scope ? scope.options : {})
})

const unflattenScope = (input: Record<string, unknown>) => {
  const { type, ...options } = input
  return { type, options }
}

/**
 * Branded encoded scope string, in query string format.
 *
 */
export const EncodedScope = z.string().brand('EncodedScope')
export type EncodedScope = z.infer<typeof EncodedScope>

/**
 * Encodes a scope object into an EncodedScope branded query string.
 *
 *
 * @param scope - The scope object to encode.
 * @returns The encoded scope as a branded string (`EncodedScope`).
 */
export const encodeScope = (scope: Scope): EncodedScope => {
  const flattened = flattenScope(scope)

  return qs.stringify(flattened, {
    arrayFormat: 'comma',
    allowDots: true,
    addQueryPrefix: false,
    encode: false
  }) as EncodedScope
}

/**
 * Converts a scope object into an encoded query string representation.
 *
 * @TODO scope param could be defined as EncodedScope instead of string.
 *
 * @param scope - The scope object to encode.
 * @returns The encoded scope as a branded string (`EncodedScope`).
 */

export const decodeScope = (query: EncodedScope) => {
  const scope = qs.parse(query, {
    ignoreQueryPrefix: true,
    comma: true,
    allowDots: true
  })

  const unflattenedScope = unflattenScope(scope)
  return Scope.safeParse(unflattenedScope)?.data
}

/** If a certain scope option is not set, we use the default value. */
const DEFAULT_SCOPE_OPTIONS: Partial<AllScopeOptions> = {
  placeOfEvent: JurisdictionFilter.enum.all,
  accessLevel: JurisdictionFilter.enum.all
}

/**
 * Function to get the value of a scope option (aka. scope attribute)
 *
 * @param scope - The scope to get the value of the option from.
 * @param option - The option to get the value of.
 * @returns The value of the scope option. Will return the default value if the option is not set.
 */
export function getScopeOptionValue<T extends ScopeOptionKey>(
  scope: Scope,
  option: T
): AllScopeOptions[T] | undefined {
  const options =
    'options' in scope
      ? (scope.options as Partial<AllScopeOptions> | undefined)
      : undefined

  const value = options?.[option]

  const defaultValue =
    option in DEFAULT_SCOPE_OPTIONS ? DEFAULT_SCOPE_OPTIONS[option] : undefined

  return value ?? defaultValue
}

export function getAcceptedScopesByType({
  acceptedScopes,
  scopes
}: {
  acceptedScopes: ScopeType[]
  scopes: EncodedScope[]
}): Scope[] {
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
    .filter((scope): scope is Scope => scope !== null)
}

/**
 * Checks if the provided scopes or token contain any of the accepted scopes.
 *
 * Overloads:
 * - `hasAnyScope(token, scopes)` → extracts scopes from a token
 * - `hasAnyScope(scopes, scopes)` → checks directly from a scope array
 */

/**
 * Checks if the provided token contains any of the accepted scopes.
 *
 * @param {string} token - The authentication JWT token.
 * @param {ScopeType[]} scopes - An array of scope types to check for.
 * @returns {boolean} True if the token contains at least one of the accepted scopes, false otherwise.
 */
export function hasAnyScope(token: string, scopes: ScopeType[]): boolean
/**
 * Checks if the provided array of scopes contains any of the accepted scopes.
 *
 * @param {EncodedScope[]} userScopes - Array of scopes to check.
 * @param {ScopeType[]} scopes - An array of scope types to check for.
 * @returns {boolean} True if the scope list contains at least one of the accepted scopes.
 */
export function hasAnyScope(
  userScopes: EncodedScope[],
  scopes: ScopeType[]
): boolean
/**
 * Implementation handling both overloads.
 *
 * @param tokenOrScopes - JWT token string or list of scopes.
 * @param scopes - The scope types to check for.
 * @returns True if any of the scopes is present.
 */
export function hasAnyScope(
  tokenOrScopes: string | EncodedScope[],
  scopes: ScopeType[]
): boolean {
  const userScopes = Array.isArray(tokenOrScopes)
    ? tokenOrScopes
    : getScopes(tokenOrScopes)

  const foundScopes = getAcceptedScopesByType({
    acceptedScopes: scopes,
    scopes: userScopes
  })

  return foundScopes.length > 0
}

/**
 * Checks whether a scope exists either inside a JWT token or
 * within a provided list of scopes.
 *
 * Overloads:
 * - `hasScope(token, scope)` → extracts scopes from a token
 * - `hasScope(scopes, scope)` → checks directly from a scope array
 */

/**
 * Checks if the provided token contains the given scope.
 *
 * @param token - The authentication JWT token.
 * @param scope - The scope type to check for.
 * @returns True if the token contains the specified scope.
 */
export function hasScope(token: string, scope: ScopeType): boolean
/**
 * Checks if the provided list of scopes contains the given scope.
 *
 * @param scopes - Array of scopes to check.
 * @param scope - The scope type to check for.
 * @returns True if the scope list contains the specified scope.
 */
export function hasScope(scopes: EncodedScope[], scope: ScopeType): boolean
/**
 * Implementation handling both overloads.
 *
 * @param tokenOrScopes - JWT token string or list of scopes.
 * @param scope - The scope type to check for.
 * @returns True if the scope is present.
 */
export function hasScope(
  tokenOrScopes: string | EncodedScope[],
  scope: ScopeType
): boolean {
  if (Array.isArray(tokenOrScopes)) {
    return (
      getAcceptedScopesByType({
        acceptedScopes: [scope],
        scopes: tokenOrScopes
      }).length > 0
    )
  }

  return hasAnyScope(tokenOrScopes, [scope])
}

/**
 * Checks if the given event type is allowed by the accepted scopes. If no specific event types are defined, it returns true.
 *
 * @param {Scope[]} userScopes - The scopes of the user.
 * @param {string} eventType - The event type to check for permission.
 * @returns {boolean} Returns true if the event type is allowed by the scope.
 */
export function canUserCreateEvent(
  userScopes: EncodedScope[],
  eventType: string
) {
  const scopes = getAcceptedScopesByType({
    acceptedScopes: ['record.create'],
    scopes: userScopes
  })

  return scopes.some((scope) => {
    if (
      !('options' in scope) ||
      !scope.options ||
      !('event' in scope.options)
    ) {
      return true
    }

    return scope.options?.event?.includes(eventType)
  })
}

/**
 * Helper for defining scopes for user roles. Should be used in country config.
 *
 * @param scopes Array of scopes in object format.
 * @returns Array of scopes in string format, encoded for use in JWT tokens.
 */
export function defineScopes(scopes: Scope[]) {
  return scopes.map((scope) => Scope.parse(scope)).map(encodeScope)
}
