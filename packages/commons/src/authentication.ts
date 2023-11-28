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

/** All the scopes user can be assigned to */
export const userScopes = {
  demo: 'demo',
  declare: 'declare',
  register: 'register',
  certify: 'certify',
  performance: 'performance',
  systemAdmin: 'sysadmin',
  validate: 'validate',
  nationalSystemAdmin: 'natlsysadmin',
  /** Bypasses the rate limiting in gateway. Useful for data seeder. */
  bypassRateLimit: 'bypassratelimit',
  teams: 'teams',
  config: 'config'
} as const

export const userRoleScopes = {
  FIELD_AGENT: [userScopes.declare],
  REGISTRATION_AGENT: [
    userScopes.validate,
    userScopes.performance,
    userScopes.certify
  ],
  LOCAL_REGISTRAR: [
    userScopes.register,
    userScopes.performance,
    userScopes.certify
  ],
  LOCAL_SYSTEM_ADMIN: [userScopes.systemAdmin],
  NATIONAL_SYSTEM_ADMIN: [
    userScopes.systemAdmin,
    userScopes.nationalSystemAdmin
  ],
  PERFORMANCE_MANAGEMENT: [userScopes.performance],
  NATIONAL_REGISTRAR: [
    userScopes.register,
    userScopes.performance,
    userScopes.certify,
    userScopes.config,
    userScopes.teams
  ]
}

/** All the scopes system/integration can be assigned to */
export const systemScopes = {
  recordsearch: 'recordsearch',
  declare: 'declare',
  notificationApi: 'notification-api',
  validatorApi: 'validator-api',
  ageVerificationApi: 'age-verification-api',
  webhook: 'webhook',
  nationalId: 'nationalId'
} as const

export const systemRoleScopes = {
  HEALTH: [systemScopes.declare, systemScopes.notificationApi],
  NATIONAL_ID: [systemScopes.nationalId],
  EXTERNAL_VALIDATION: [systemScopes.validatorApi],
  AGE_CHECK: [systemScopes.declare, systemScopes.ageVerificationApi],
  RECORD_SEARCH: [systemScopes.recordsearch],
  WEBHOOK: [systemScopes.webhook]
}

export type UserRole = keyof typeof userRoleScopes
export type UserScope = (typeof userScopes)[keyof typeof userScopes]
export type SystemRole = keyof typeof systemRoleScopes
export type SystemScope = (typeof systemScopes)[keyof typeof systemScopes]
export type Scope = UserScope | SystemScope
