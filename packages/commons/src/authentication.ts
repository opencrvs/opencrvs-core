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

import { IAuthHeader } from './http'
import * as decode from 'jwt-decode'

import { Scope } from './scopes'
export { scopes, Scope } from './scopes'

/** All the scopes system/integration can be assigned to */
export const SYSTEM_INTEGRATION_SCOPES = {
  recordsearch: 'recordsearch',
  declare: 'declare',
  webhook: 'webhook',
  nationalId: 'nationalId'
} as const

export const SUPER_ADMIN_SCOPES = [
  'natlsysadmin',
  'bypassratelimit',
  'sysadmin'
] satisfies Scope[]

export const DEFAULT_ROLES_DEFINITION = [
  {
    id: 'FIELD_AGENT',
    label: {
      defaultMessage: 'Field Agent',
      description: 'Name for user role Field Agent',
      id: 'userRole.fieldAgent'
    },
    scopes: [
      // old scope for bw compability
      'declare',

      // new scopes
      'record.declare-birth',
      'record.declare-death',
      'record.declare-marriage',
      'record.submit-incomplete',
      'record.submit-for-review',
      'search.birth',
      'search.death',
      'search.marriage',
      'record.read',
      'record.read-audit',
      'record.read-comments'
    ]
  },
  {
    id: 'REGISTRATION_AGENT',
    label: {
      defaultMessage: 'Registration Agent',
      description: 'Name for user role Registration Agent',
      id: 'userRole.registrationAgent'
    },
    scopes: [
      'validate',
      'performance',
      'certify',

      'record.declare-birth',
      'record.declare-death',
      'record.declare-marriage',
      'record.declaration-review',
      'record.submit-for-approval',
      'record.submit-for-updates',
      'record.declaration-archive',
      'record.declaration-reinstate',
      'record.registration-request-correction',
      'record.print-records',
      'record.print-records-supporting-documents',
      'record.export-records',
      'record.print-issue-certified-copies',
      'record.registration-verify-certified-copies',
      'record.create-comments',
      'performance.read',
      'performance.read-dashboards',
      'organisation.read',
      'organisation.read-locations:my-office',
      'search.birth',
      'search.death',
      'search.marriage',
      'record.read',
      'record.read-audit',
      'record.read-comments'
    ]
  },
  {
    id: 'LOCAL_REGISTRAR',
    label: {
      defaultMessage: 'Local Registrar',
      description: 'Name for user role Local Registrar',
      id: 'userRole.localRegistrar'
    },
    scopes: [
      'register',
      'performance',
      'certify',

      'record.declare-birth',
      'record.declare-death',
      'record.declare-marriage',
      'record.declaration-review',
      'record.submit-for-updates',
      'record.review-duplicates',
      'record.declaration-archive',
      'record.declaration-reinstate',
      'record.register',
      'record.registration-correct',
      'record.print-records',
      'record.print-records-supporting-documents',
      'record.export-records',
      'record.print-issue-certified-copies',
      'record.registration-verify-certified-copies',
      'record.create-comments',
      'performance.read',
      'performance.read-dashboards',
      'organisation.read',
      'organisation.read-locations:my-office',
      'search.birth',
      'search.death',
      'search.marriage',
      'record.read',
      'record.read-audit',
      'record.read-comments'
    ]
  },
  {
    id: 'LOCAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'Local System Admin',
      description: 'Name for user role Local System Admin',
      id: 'userRole.localSystemAdmin'
    },
    scopes: [
      'sysadmin',

      'user.read:my-office',
      'user.create:my-jurisdiction',
      'user.update:my-office',
      'organisation.read',
      'organisation.read-locations',
      // 'organisation.read-users' ?
      'performance.read',
      'performance.read-dashboards',
      'performance.export-vital-statistics'
    ]
  },
  {
    id: 'NATIONAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'National System Admin',
      description: 'Name for user role National System Admin',
      id: 'userRole.nationalSystemAdmin'
    },
    scopes: [
      'sysadmin',
      'natlsysadmin',

      'user.create',
      'user.read:all',
      'user.update',
      'organisation.read',
      'organisation.read-locations',
      // 'organisation.read-users' ?
      'performance.read',
      'performance.read-dashboards',
      'performance.export-vital-statistics'
    ]
  },
  {
    id: 'PERFORMANCE_MANAGER',
    label: {
      defaultMessage: 'Performance Manager',
      description: 'Name for user role Performance Manager',
      id: 'userRole.performanceManager'
    },
    scopes: [
      'performance',
      'performance.read',
      'performance.read-dashboards',
      'performance.export-vital-statistics'
    ]
  }
] satisfies Array<{
  id: string
  label: { defaultMessage: string; description: string; id: string }
  scopes: Scope[]
}>

export const DEFAULT_SYSTEM_INTEGRATION_ROLE_SCOPES = {
  HEALTH: ['declare', 'notification-api'],
  NATIONAL_ID: ['nationalId'],
  RECORD_SEARCH: ['recordsearch'],
  WEBHOOK: ['webhook']
} satisfies Record<string, Scope[]>

/*
 * Describes a "legacy" user role such as FIELD_AGENT, REGISTRATION_AGENT, etc.
 * These are roles we are slowly sunsettings in favor of the new, more configurable user roles.
 */

export const SCOPES = {
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

/** All the scopes user can be assigned to – old & new */
export type UserScope =
  | (typeof SCOPES)[keyof typeof SCOPES]
  | 'profile.electronic-signature'

export type SystemScope =
  (typeof DEFAULT_SYSTEM_INTEGRATION_ROLE_SCOPES)[keyof typeof DEFAULT_SYSTEM_INTEGRATION_ROLE_SCOPES][number]

export interface ITokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: Scope[]
}

export function hasScope(authHeader: IAuthHeader, scope: Scope) {
  if (!authHeader || !authHeader.Authorization) {
    return false
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  return (tokenPayload.scope && tokenPayload.scope.indexOf(scope) > -1) || false
}

export function inScope(authHeader: IAuthHeader, scopes: Scope[]) {
  const matchedScope = scopes.find((scope) => hasScope(authHeader, scope))
  return !!matchedScope
}

export const getTokenPayload = (token: string): ITokenPayload => {
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    throw new Error(
      `getTokenPayload: Error occurred during token decode : ${err}`
    )
  }
  return decoded
}
