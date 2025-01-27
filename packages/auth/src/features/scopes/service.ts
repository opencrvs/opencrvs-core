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
import { fetchJSON, joinURL, logger, Roles } from '@opencrvs/commons'
import {
  DEFAULT_ROLES_DEFINITION,
  Scope
} from '@opencrvs/commons/authentication'

export async function getUserRoleScopeMapping() {
  const roles = await fetchJSON<Roles>(
    joinURL(env.COUNTRY_CONFIG_URL_INTERNAL, '/roles')
  )

  logger.info(
    'Country config implements the new /roles response format. Custom scopes apply'
  )

  const defaultRoleMappings = DEFAULT_ROLES_DEFINITION.reduce<
    Record<string, Scope[]>
  >((acc, { id, scopes }) => {
    acc[id] = scopes
    return acc
  }, {})

  const userRoleMappings = roles.reduce<Record<string, Scope[]>>(
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
