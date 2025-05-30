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
import {
  ConfigurableScopeType,
  Scope,
  SCOPES,
  stringifyScope,
  SystemType
} from '@opencrvs/commons'

const DEFAULT_SYSTEM_INTEGRATION_ROLE_SCOPES = {
  HEALTH: [SCOPES.NOTIFICATION_API],
  NATIONAL_ID: [SCOPES.NATIONALID],
  RECORD_SEARCH: [SCOPES.RECORDSEARCH],
  IMPORT: [SCOPES.RECORD_IMPORT],
  WEBHOOK: [SCOPES.WEBHOOK]
} satisfies Record<SystemType, Scope[]>

const DEFAULT_SYSTEM_INTEGRATION_ROLE_CONFIGURABLE_SCOPES = {
  HEALTH: ['record.notify'],
  IMPORT: [],
  NATIONAL_ID: [],
  RECORD_SEARCH: [],
  WEBHOOK: []
} satisfies Record<SystemType, ConfigurableScopeType[]>

export function getSystemIntegrationRoleScopes(
  type: SystemType,
  eventIds: string[]
): string[] {
  const literalScopes = DEFAULT_SYSTEM_INTEGRATION_ROLE_SCOPES[type]

  const configurableScopes =
    DEFAULT_SYSTEM_INTEGRATION_ROLE_CONFIGURABLE_SCOPES[type].map((scope) =>
      stringifyScope({
        type: scope,
        options: { event: eventIds }
      })
    )

  return [...literalScopes, ...configurableScopes]
}
