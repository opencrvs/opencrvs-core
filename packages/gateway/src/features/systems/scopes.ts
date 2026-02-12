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
  EventConfig,
  IAuthHeader,
  joinUrl,
  logger,
  Scope,
  SCOPES,
  stringifyScope
} from '@opencrvs/commons'
import fetch from '@gateway/fetch'
import { COUNTRY_CONFIG_URL, PRODUCTION } from '@gateway/constants'

/**
 * Client-facing system integration types.
 * These are the types shown to users in the admin UI.
 * Gateway converts these to appropriate scopes.
 * Note: REINDEX is hidden from UI - it's managed internally.
 */
export type SystemIntegrationType = 'HEALTH' | 'RECORD_SEARCH'

/**
 * Default scopes for each system integration type.
 * These are the base scopes that each type gets.
 * Note: REINDEX is hidden from UI - it's managed internally.
 */
const DEFAULT_SCOPES_BY_TYPE: Record<SystemIntegrationType, Scope[]> = {
  HEALTH: [SCOPES.NOTIFICATION_API],
  RECORD_SEARCH: [SCOPES.RECORDSEARCH]
}

/**
 * Configurable scopes that need to be expanded with event IDs.
 * For example, HEALTH type gets record.create and record.notify scopes
 * that are expanded for each configured event type.
 */
const CONFIGURABLE_SCOPES_BY_TYPE: Record<
  SystemIntegrationType,
  ConfigurableScopeType[]
> = {
  HEALTH: ['record.create', 'record.notify'],
  RECORD_SEARCH: []
}

/**
 * In-memory cache for event configurations (production only)
 */
let inMemoryEventConfigurations: EventConfig[] | null = null

/**
 * Fetches event configurations from country config service
 */
async function getEventConfigurations(
  authHeader: IAuthHeader
): Promise<EventConfig[]> {
  const url = joinUrl(COUNTRY_CONFIG_URL, '/events')

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch event configurations: ${res.statusText}`)
  }

  const json = await res.json()
  return json as EventConfig[]
}

/**
 * Gets event configurations, using cache in production
 */
export async function getInMemoryEventConfigurations(
  authHeader: IAuthHeader
): Promise<EventConfig[]> {
  if (!PRODUCTION) {
    logger.info(
      `Running in ${process.env.NODE_ENV} mode. Fetching event configurations from API`
    )
    return getEventConfigurations(authHeader)
  }

  if (inMemoryEventConfigurations) {
    logger.info('Returning in-memory event configurations')
    return inMemoryEventConfigurations
  }

  inMemoryEventConfigurations = await getEventConfigurations(authHeader)
  return inMemoryEventConfigurations
}

/**
 * Converts a system integration type to the corresponding scopes.
 * This is now the single source of truth for type→scopes conversion.
 *
 * @param type - The system integration type (e.g., 'HEALTH', 'NATIONAL_ID')
 * @param eventIds - Array of event IDs for configurable scopes
 * @returns Array of scope strings
 */
export function getSystemScopesFromType(
  type: string,
  eventIds: string[]
): string[] {
  // Validate the type
  if (!isValidSystemIntegrationType(type)) {
    throw new Error(`Invalid system integration type: ${type}`)
  }

  const literalScopes = DEFAULT_SCOPES_BY_TYPE[type]
  const configurableScopes = CONFIGURABLE_SCOPES_BY_TYPE[type].map(
    (scope: ConfigurableScopeType) =>
      stringifyScope({
        type: scope as 'record.create' | 'record.notify',
        options: { event: eventIds }
      })
  )

  return [...literalScopes, ...configurableScopes]
}

/**
 * Type guard to check if a string is a valid system integration type.
 */
export function isValidSystemIntegrationType(
  type: string
): type is SystemIntegrationType {
  return type in DEFAULT_SCOPES_BY_TYPE
}
