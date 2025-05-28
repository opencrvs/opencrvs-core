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
  stringifyScope
} from '@opencrvs/commons'

export type SystemIntegrationRole =
  | 'HEALTH'
  | 'NATIONAL_ID'
  | 'RECORD_SEARCH'
  | 'WEBHOOK'

const DEFAULT_SYSTEM_INTEGRATION_ROLE_SCOPES = {
  HEALTH: [SCOPES.NOTIFICATION_API],
  NATIONAL_ID: [SCOPES.NATIONALID],
  RECORD_SEARCH: [SCOPES.RECORDSEARCH],
  WEBHOOK: [SCOPES.WEBHOOK]
} satisfies Record<SystemIntegrationRole, Scope[]>

const DEFAULT_SYSTEM_INTEGRATION_ROLE_CONFIGURABLE_SCOPES = {
  HEALTH: ['record.notify'],
  NATIONAL_ID: [],
  RECORD_SEARCH: [],
  WEBHOOK: []
} satisfies Record<SystemIntegrationRole, ConfigurableScopeType[]>

export function getSystemIntegrationRoleScopes(
  type: SystemIntegrationRole,
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
