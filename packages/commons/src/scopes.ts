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

export const SCOPES = {
  // TODO v1.8 legacy scopes
  BYPASSRATELIMIT: 'bypassratelimit',
  REGISTER: 'register',
  DEMO: 'demo',
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
  z.literal(SCOPES.DEMO),
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
const ConfigScope = z.literal(SCOPES.CONFIG_UPDATE_ALL)

// Data seeding
const DataSeedingScope = z.literal(SCOPES.USER_DATA_SEEDING)

// Attachment
const AttachmentScope = z.literal(SCOPES.ATTACHMENT_UPLOAD)

// Combine all
/**
 * @deprecated - will be removed in v2.1.
 */
const LiteralScopes = z.union([
  LegacyScopes,
  IntegrationScopes,
  z.literal(SCOPES.PROFILE_ELECTRONIC_SIGNATURE),
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
const ConfigurableRawScopes = z.discriminatedUnion('type', [
  CreateUserScope,
  EditUserScope,
  WorkqueueScope
])

export type ConfigurableRawScopes = z.infer<typeof ConfigurableRawScopes>
export type ConfigurableScopeType = ConfigurableRawScopes['type']

export type ConfigurableScopes = Exclude<
  ConfigurableRawScopes,
  { type: 'search' }
>

/**
 * @deprecated will be removed in v2.1.
 *
 */
export function findScope<T extends ConfigurableScopeType>(
  scopes: string[],
  scopeType: T
) {
  const parsedScopes = scopes.map(parseConfigurableScope)

  return parsedScopes.find(
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
