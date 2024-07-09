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
  notificationApi: 'notification-api',
  validatorApi: 'validator-api',
  webhook: 'webhook',
  nationalId: 'nationalId'
} as const

export const DEFAULT_CORE_ROLE_SCOPES = {
  FIELD_AGENT: [SCOPES.declare],
  REGISTRATION_AGENT: [SCOPES.validate, SCOPES.performance, SCOPES.certify],
  LOCAL_REGISTRAR: [SCOPES.register, SCOPES.performance, SCOPES.certify],
  LOCAL_SYSTEM_ADMIN: [SCOPES.systemAdmin],
  NATIONAL_SYSTEM_ADMIN: [SCOPES.systemAdmin, SCOPES.nationalSystemAdmin],
  PERFORMANCE_MANAGEMENT: [SCOPES.performance],
  NATIONAL_REGISTRAR: [
    SCOPES.register,
    SCOPES.performance,
    SCOPES.certify,
    SCOPES.config,
    SCOPES.teams
  ],
  SUPER_ADMIN: [
    SCOPES.nationalSystemAdmin,
    SCOPES.bypassRateLimit,
    SCOPES.systemAdmin
  ]
}

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
  HEALTH: [
    SYSTEM_INTEGRATION_SCOPES.declare,
    SYSTEM_INTEGRATION_SCOPES.notificationApi
  ],
  NATIONAL_ID: [SYSTEM_INTEGRATION_SCOPES.nationalId],
  RECORD_SEARCH: [SYSTEM_INTEGRATION_SCOPES.recordsearch],
  WEBHOOK: [SYSTEM_INTEGRATION_SCOPES.webhook]
}

/*
 * Describes a "legacy" user role such as FIELD_AGENT, REGISTRATION_AGENT, etc.
 * These are roles we are slowly sunsettings in favor of the new, more configurable user roles.
 */

export type SystemIntegrationRole =
  keyof typeof DEFAULT_SYSTEM_INTEGRATION_ROLE_SCOPES

export type UserScope = (typeof SCOPES)[keyof typeof SCOPES]
export type SystemScope =
  (typeof SYSTEM_INTEGRATION_SCOPES)[keyof typeof SYSTEM_INTEGRATION_SCOPES]

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
