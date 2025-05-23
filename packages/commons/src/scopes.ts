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

export const SCOPES = {
  // TODO v1.8 legacy scopes
  NATLSYSADMIN: 'natlsysadmin',
  BYPASSRATELIMIT: 'bypassratelimit',

  DECLARE: 'declare',
  REGISTER: 'register',
  VALIDATE: 'validate',

  DEMO: 'demo',
  CERTIFY: 'certify',
  PERFORMANCE: 'performance',
  SYSADMIN: 'sysadmin',
  TEAMS: 'teams',
  CONFIG: 'config',

  // systems / integrations
  WEBHOOK: 'webhook',
  NATIONALID: 'nationalId',
  NOTIFICATION_API: 'notification-api',
  RECORDSEARCH: 'recordsearch',

  /**
   * @TODO This is a temporary scope to be used for V2 Events custom events declaration
   */
  RECORD_DECLARE: 'record.declare-birth',

  // declare
  RECORD_DECLARE_BIRTH: 'record.declare-birth',
  RECORD_DECLARE_BIRTH_MY_JURISDICTION: 'record.declare-birth:my-jurisdiction',
  RECORD_DECLARE_DEATH: 'record.declare-death',
  RECORD_DECLARE_DEATH_MY_JURISDICTION: 'record.declare-death:my-jurisdiction',
  RECORD_DECLARE_MARRIAGE: 'record.declare-marriage',
  RECORD_DECLARE_MARRIAGE_MY_JURISDICTION:
    'record.declare-marriage:my-jurisdiction',
  RECORD_SUBMIT_INCOMPLETE: 'record.declaration-submit-incomplete',
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

  // certify
  RECORD_EXPORT_RECORDS: 'record.export-records',
  RECORD_DECLARATION_PRINT: 'record.declaration-print',
  RECORD_PRINT_RECORDS_SUPPORTING_DOCUMENTS:
    'record.declaration-print-supporting-documents',
  RECORD_REGISTRATION_PRINT: 'record.registration-print', // v1.8
  /**
   * This scope is used to **print and **issue certified copies of a record
   * after it has been registered. Previously Registrars had this permission.
   */
  RECORD_PRINT_ISSUE_CERTIFIED_COPIES:
    'record.registration-print&issue-certified-copies',
  RECORD_PRINT_CERTIFIED_COPIES: 'record.registration-print-certified-copies', // v1.8
  RECORD_BULK_PRINT_CERTIFIED_COPIES:
    'record.registration-bulk-print-certified-copies', // v1.8
  RECORD_REGISTRATION_VERIFY_CERTIFIED_COPIES:
    'record.registration-verify-certified-copies', // v1.8

  // correct
  RECORD_REGISTRATION_REQUEST_CORRECTION:
    'record.registration-request-correction',
  RECORD_REGISTRATION_CORRECT: 'record.registration-correct',
  RECORD_REGISTRATION_REQUEST_REVOCATION:
    'record.registration-request-revocation', // v1.8
  RECORD_REGISTRATION_REVOKE: 'record.registration-revoke', // v1.8
  RECORD_REGISTRATION_REQUEST_REINSTATEMENT:
    'record.registration-request-reinstatement', // v1.8
  RECORD_REGISTRATION_REINSTATE: 'record.registration-reinstate', // v1.8
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
  RECORD_READ_AUDIT: 'record.read-audit',
  RECORD_READ_COMMENTS: 'record.read-comments',
  RECORD_CREATE_COMMENTS: 'record.create-comments',

  // profile
  PROFILE_UPDATE: 'profile.update', //v1.8
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
  USER_DATA_SEEDING: 'user.data-seeding'
} as const

const LiteralScopes = z.union([
  z.literal(SCOPES.NATLSYSADMIN),
  z.literal(SCOPES.BYPASSRATELIMIT),
  z.literal(SCOPES.DECLARE),
  z.literal(SCOPES.REGISTER),
  z.literal(SCOPES.VALIDATE),
  z.literal(SCOPES.DEMO),
  z.literal(SCOPES.CERTIFY),
  z.literal(SCOPES.PERFORMANCE),
  z.literal(SCOPES.SYSADMIN),
  z.literal(SCOPES.TEAMS),
  z.literal(SCOPES.CONFIG),
  z.literal(SCOPES.WEBHOOK),
  z.literal(SCOPES.NATIONALID),
  z.literal(SCOPES.NOTIFICATION_API),
  z.literal(SCOPES.RECORDSEARCH),
  z.literal(SCOPES.RECORD_DECLARE_BIRTH),
  z.literal(SCOPES.RECORD_DECLARE_BIRTH_MY_JURISDICTION),
  z.literal(SCOPES.RECORD_DECLARE_DEATH),
  z.literal(SCOPES.RECORD_DECLARE_DEATH_MY_JURISDICTION),
  z.literal(SCOPES.RECORD_DECLARE_MARRIAGE),
  z.literal(SCOPES.RECORD_DECLARE_MARRIAGE_MY_JURISDICTION),
  z.literal(SCOPES.RECORD_SUBMIT_INCOMPLETE),
  z.literal(SCOPES.RECORD_SUBMIT_FOR_REVIEW),
  z.literal(SCOPES.RECORD_UNASSIGN_OTHERS),
  z.literal(SCOPES.RECORD_SUBMIT_FOR_APPROVAL),
  z.literal(SCOPES.RECORD_SUBMIT_FOR_UPDATES),
  z.literal(SCOPES.RECORD_DECLARATION_EDIT),
  z.literal(SCOPES.RECORD_REVIEW_DUPLICATES),
  z.literal(SCOPES.RECORD_DECLARATION_ARCHIVE),
  z.literal(SCOPES.RECORD_DECLARATION_REINSTATE),
  z.literal(SCOPES.RECORD_REGISTER),
  z.literal(SCOPES.RECORD_EXPORT_RECORDS),
  z.literal(SCOPES.RECORD_DECLARATION_PRINT),
  z.literal(SCOPES.RECORD_PRINT_RECORDS_SUPPORTING_DOCUMENTS),
  z.literal(SCOPES.RECORD_REGISTRATION_PRINT),
  z.literal(SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES),
  z.literal(SCOPES.RECORD_PRINT_CERTIFIED_COPIES),
  z.literal(SCOPES.RECORD_BULK_PRINT_CERTIFIED_COPIES),
  z.literal(SCOPES.RECORD_REGISTRATION_VERIFY_CERTIFIED_COPIES),
  z.literal(SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION),
  z.literal(SCOPES.RECORD_REGISTRATION_CORRECT),
  z.literal(SCOPES.RECORD_REGISTRATION_REQUEST_REVOCATION),
  z.literal(SCOPES.RECORD_REGISTRATION_REVOKE),
  z.literal(SCOPES.RECORD_REGISTRATION_REQUEST_REINSTATEMENT),
  z.literal(SCOPES.RECORD_REGISTRATION_REINSTATE),
  z.literal(SCOPES.RECORD_CONFIRM_REGISTRATION),
  z.literal(SCOPES.RECORD_REJECT_REGISTRATION),
  z.literal(SCOPES.SEARCH_BIRTH_MY_JURISDICTION),
  z.literal(SCOPES.SEARCH_BIRTH),
  z.literal(SCOPES.SEARCH_DEATH_MY_JURISDICTION),
  z.literal(SCOPES.SEARCH_DEATH),
  z.literal(SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION),
  z.literal(SCOPES.SEARCH_MARRIAGE),
  z.literal(SCOPES.RECORD_READ),
  z.literal(SCOPES.RECORD_READ_AUDIT),
  z.literal(SCOPES.RECORD_READ_COMMENTS),
  z.literal(SCOPES.RECORD_CREATE_COMMENTS),
  z.literal(SCOPES.PROFILE_UPDATE),
  z.literal(SCOPES.PROFILE_ELECTRONIC_SIGNATURE),
  z.literal(SCOPES.PERFORMANCE_READ),
  z.literal(SCOPES.PERFORMANCE_READ_DASHBOARDS),
  z.literal(SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS),
  z.literal(SCOPES.ORGANISATION_READ_LOCATIONS),
  z.literal(SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE),
  z.literal(SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION),
  z.literal(SCOPES.USER_READ),
  z.literal(SCOPES.USER_READ_MY_OFFICE),
  z.literal(SCOPES.USER_READ_MY_JURISDICTION),
  z.literal(SCOPES.USER_READ_ONLY_MY_AUDIT),
  z.literal(SCOPES.USER_CREATE),
  z.literal(SCOPES.USER_CREATE_MY_JURISDICTION),
  z.literal(SCOPES.USER_UPDATE),
  z.literal(SCOPES.USER_UPDATE_MY_JURISDICTION),
  z.literal(SCOPES.CONFIG_UPDATE_ALL),
  z.literal(SCOPES.USER_DATA_SEEDING)
])

const rawConfigurableScopeRegex =
  /^([a-zA-Z\.]+)\[((?:\w+=[\w-]+(?:\|[\w-]+)*)(:?,[\w-]+=[\w-]+(?:\|[\w-]+)*)*)\]$/

const rawConfigurableScope = z.string().regex(rawConfigurableScopeRegex)

const CreateUserScope = z.object({
  type: z.literal('user.create'),
  options: z.object({
    role: z.array(z.string())
  })
})

const EditUserScope = z.object({
  type: z.literal('user.edit'),
  options: z.object({
    role: z.array(z.string())
  })
})

const WorkqueueScope = z.object({
  type: z.literal('workqueue'),
  options: z.object({
    id: z.array(z.string())
  })
})

const ConfigurableScopes = z.discriminatedUnion('type', [
  CreateUserScope,
  EditUserScope,
  WorkqueueScope
])

type ConfigurableScopes = z.infer<typeof ConfigurableScopes>

export function findScope<T extends ConfigurableScopes['type']>(
  scopes: string[],
  scopeType: T
) {
  return scopes
    .map((rawScope) => parseScope(rawScope))
    .find(
      (parsedScope): parsedScope is Extract<ConfigurableScopes, { type: T }> =>
        parsedScope?.type === scopeType
    )
}

export function parseScope(scope: string) {
  const maybeLiteralScope = LiteralScopes.safeParse(scope)
  if (maybeLiteralScope.success) {
    return {
      type: maybeLiteralScope.data
    }
  }
  const maybeConfigurableScope = rawConfigurableScope.safeParse(scope)
  if (maybeConfigurableScope.success) {
    const rawScope = maybeConfigurableScope.data
    const [, type, rawOptions] = rawScope.match(rawConfigurableScopeRegex) ?? []
    const options = rawOptions.split(',').reduce(
      (acc, option) => {
        const [key, value] = option.split('=')
        acc[key] = value.split('|')
        return acc
      },
      {} as Record<string, string[]>
    )
    const parsedScope = {
      type,
      options
    }
    const result = ConfigurableScopes.safeParse(parsedScope)
    if (result.success) {
      return result.data
    }
  }
  return undefined
}

/*
 * @deprecated
 * scopes are configurable so all possible
 * values can't be retrieved anymore
 */
export const scopes: Scope[] = Object.values(SCOPES)

export type ParsedScopes = NonNullable<ReturnType<typeof parseScope>>
export type RawScopes = z.infer<typeof LiteralScopes> | (string & {})

// for backwards compatibility
export type Scope = RawScopes
