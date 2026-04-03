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

import { env } from '@auth/environment'
import {
  fetchJSON,
  joinUrl,
  logger,
  Roles,
  encodeScope,
  SCOPES
} from '@opencrvs/commons'

export const DEFAULT_ROLES_DEFINITION = [
  {
    id: 'FIELD_AGENT',
    label: {
      defaultMessage: 'Field Agent',
      description: 'Name for user role Field Agent',
      id: 'userRole.fieldAgent'
    },
    scopes: [
      encodeScope({
        type: 'record.create',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.declare',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      })
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
      encodeScope({
        type: 'record.create',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.declare',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE
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
      encodeScope({
        type: 'record.create',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.declare',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.review-duplicates',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE
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
      SCOPES.USER_READ_MY_OFFICE,
      SCOPES.USER_CREATE_MY_JURISDICTION,
      SCOPES.USER_UPDATE_MY_JURISDICTION,
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS
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
      SCOPES.USER_CREATE,
      SCOPES.USER_READ,
      SCOPES.USER_UPDATE,
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS
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
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS
    ]
  }
] satisfies Array<{
  id: string
  label: { defaultMessage: string; description: string; id: string }
  scopes: string[]
}>

export async function getUserRoleScopeMapping() {
  const roles = await fetchJSON<Roles>(
    joinUrl(env.COUNTRY_CONFIG_URL_INTERNAL, '/config/roles')
  )

  logger.info(
    'Country config implements the new /roles response format. Custom scopes apply'
  )

  const defaultRoleMappings = DEFAULT_ROLES_DEFINITION.reduce<
    Record<string, string[]>
  >((acc, { id, scopes }) => {
    acc[id] = scopes
    return acc
  }, {})

  const userRoleMappings = roles.reduce<Record<string, string[]>>(
    (acc, { id, scopes }) => {
      acc[id] = scopes
      return acc
    },
    {}
  )

  return {
    ...defaultRoleMappings,
    ...userRoleMappings
  }
}
