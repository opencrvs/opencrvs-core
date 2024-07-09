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

/** All the scopes user can be assigned to */
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

/** All the scopes system/integration can be assigned to */
export const SYSTEM_INTEGRATION_SCOPES = {
  recordsearch: 'recordsearch',
  declare: 'declare',
  webhook: 'webhook',
  nationalId: 'nationalId'
} as const

export const DEFAULT_CORE_ROLE_SCOPES = {
  FIELD_AGENT: ['declare'],
  REGISTRATION_AGENT: ['validate', 'performance', 'certify'],
  LOCAL_REGISTRAR: [
    'register',
    'performance',
    'certify',

    'record.register',
    'record.declaration-review',
    'record.print-issue-certified-copies'
  ],
  LOCAL_SYSTEM_ADMIN: ['sysadmin'],
  NATIONAL_SYSTEM_ADMIN: ['sysadmin', 'natlsysadmin'],
  PERFORMANCE_MANAGEMENT: ['performance'],
  NATIONAL_REGISTRAR: ['register', 'performance', 'certify', 'config', 'teams'],
  SUPER_ADMIN: ['natlsysadmin', 'bypassratelimit', 'sysadmin']
} satisfies Record<string, Scope[]>

// @TODO: What is the point of this, should we use this in `packages/auth/src/features/scopes/service.ts`?
export const DEFAULT_ROLES_DEFINITION = [
  {
    id: 'FIELD_AGENT',
    label: {
      defaultMessage: 'Field Agent',
      description: 'Name for user role Field Agent',
      id: 'userRole.fieldAgent'
    },
    scopes: ['declare']
  },
  {
    id: 'POLICE_OFFICER',
    label: {
      defaultMessage: 'Police Officer',
      description: 'Name for user role Police Officer',
      id: 'userRole.policeOfficer'
    },
    scopes: ['declare']
  },
  {
    id: 'SOCIAL_WORKER',
    label: {
      defaultMessage: 'Social Worker',
      description: 'Name for user role Social Worker',
      id: 'userRole.socialWorker'
    },
    scopes: ['declare']
  },
  {
    id: 'HEALTHCARE_WORKER',
    label: {
      defaultMessage: 'Healthcare Worker',
      description: 'Name for user role Healthcare Worker',
      id: 'userRole.healthcareWorker'
    },
    scopes: ['declare']
  },
  {
    id: 'LOCAL_LEADER',
    label: {
      defaultMessage: 'Local Leader',
      description: 'Name for user role Local Leader',
      id: 'userRole.localLeader'
    },
    scopes: ['declare']
  },
  {
    id: 'REGISTRATION_AGENT',
    label: {
      defaultMessage: 'Registration Agent',
      description: 'Name for user role Registration Agent',
      id: 'userRole.registrationAgent'
    },
    scopes: ['record.register', 'validate', 'performance', 'certify']
  },
  {
    id: 'LOCAL_REGISTRAR',
    label: {
      defaultMessage: 'Local Registrar',
      description: 'Name for user role Local Registrar',
      id: 'userRole.localRegistrar'
    },
    scopes: ['record.register', 'register', 'performance', 'certify']
  },
  {
    id: 'LOCAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'Local System Admin',
      description: 'Name for user role Local System Admin',
      id: 'userRole.localSystemAdmin'
    },
    scopes: ['sysadmin']
  },
  {
    id: 'NATIONAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'National System Admin',
      description: 'Name for user role National System Admin',
      id: 'userRole.nationalSystemAdmin'
    },
    scopes: ['sysadmin', 'natlsysadmin']
  },
  {
    id: 'PERFORMANCE_MANAGER',
    label: {
      defaultMessage: 'Performance Manager',
      description: 'Name for user role Performance Manager',
      id: 'userRole.performanceManager'
    },
    scopes: ['performance']
  },
  {
    id: 'NATIONAL_REGISTRAR',
    label: {
      defaultMessage: 'National Registrar',
      description: 'Name for user role National Registrar',
      id: 'userRole.nationalRegistrar'
    },
    scopes: ['register', 'performance', 'certify', 'config', 'teams']
  }
]

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

export type UserScope = (typeof SCOPES)[keyof typeof SCOPES]
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
