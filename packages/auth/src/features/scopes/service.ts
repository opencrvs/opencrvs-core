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
      encodeScope({ type: 'performance.read' }),
      encodeScope({ type: 'performance.read-dashboards' }),
      encodeScope({ type: 'organisation.read-locations' })
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
      encodeScope({ type: 'performance.read' }),
      encodeScope({ type: 'performance.read-dashboards' }),
      encodeScope({ type: 'profile.electronic-signature' }),
      encodeScope({ type: 'organisation.read-locations' })
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
      encodeScope({ type: 'organisation.read-locations' }),
      encodeScope({ type: 'performance.read' }),
      encodeScope({ type: 'performance.read-dashboards' }),
      encodeScope({ type: 'performance.vital-statistics-export' })
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
      encodeScope({ type: 'user.create' }),
      encodeScope({ type: 'user.read' }),
      encodeScope({ type: 'user.update' }),
      encodeScope({ type: 'organisation.read-locations' }),
      encodeScope({ type: 'performance.read' }),
      encodeScope({ type: 'performance.read-dashboards' }),
      encodeScope({ type: 'performance.vital-statistics-export' })
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
      encodeScope({ type: 'performance.read' }),
      encodeScope({ type: 'performance.read-dashboards' }),
      encodeScope({ type: 'performance.vital-statistics-export' })
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
