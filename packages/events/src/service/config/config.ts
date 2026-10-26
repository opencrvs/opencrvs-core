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

import fetch from 'node-fetch'
import { array } from 'zod'
import {
  ApplicationConfig,
  EventDocument,
  getEventConfigForRecord,
  getOrThrow,
  logger,
  resolveEventConfigInTimeZone,
  Role,
  TokenWithBearer,
  VersionedEventConfig,
  WorkqueueConfig
} from '@opencrvs/commons'
import { env } from '@events/environment'
/**
 * Configuration is served from countryconfig, which can be deployed
 * independently of the events service (e.g. a Kubernetes rollout that updates
 * countryconfig but not events). A time-boxed cache keeps configuration off the
 * hot path (it is read on nearly every request, including auth middleware)
 * while bounding how stale it can be to `EVENT_CONFIG_CACHE_TTL_MS` — no events
 * restart is required to pick up a config change.
 */
function createTtlConfigCache<T>(
  label: string,
  fetcher: (token: TokenWithBearer) => Promise<T>
) {
  let value: T | null = null
  let fetchedAt = 0
  let inFlight: Promise<T> | null = null

  return async function getCached(token: TokenWithBearer): Promise<T> {
    // In development always fetch, so config changes are picked up immediately.
    if (!env.isProduction) {
      return fetcher(token)
    }

    if (
      value !== null &&
      Date.now() - fetchedAt < env.EVENT_CONFIG_CACHE_TTL_MS
    ) {
      return value
    }

    // Coalesce concurrent refetches into a single request so an expiry doesn't
    // stampede countryconfig from the many call sites.
    if (!inFlight) {
      logger.info(`Refetching ${label} from countryconfig`)
      inFlight = fetcher(token)
        .then((fetched) => {
          value = fetched
          fetchedAt = Date.now()
          return fetched
        })
        .finally(() => {
          inFlight = null
        })
    }

    try {
      return await inFlight
    } catch (error) {
      // Serve the last good value if a refetch fails, so a transient
      // countryconfig outage doesn't break event operations.
      if (value !== null) {
        logger.error(
          `Failed to refetch ${label}; serving previously cached value. ${String(
            error
          )}`
        )
        return value
      }
      throw error
    }
  }
}

async function getEventConfigurations(token: TokenWithBearer) {
  const res = await fetch(new URL('/config/events', env.COUNTRY_CONFIG_URL), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })

  if (!res.ok) {
    throw new Error(
      `Failed to fetch events config: ${res.status} ${res.statusText}.`
    )
  }

  return array(VersionedEventConfig).parse(await res.json())
}

/**
 * @returns event configurations with every version, cached in production for up to
 * `EVENT_CONFIG_CACHE_TTL_MS` (always fresh in development).
 */
export const getInMemoryVersionedEventConfigurations = createTtlConfigCache(
  'event configurations',
  getEventConfigurations
)

export async function getApplicationConfig() {
  const res = await fetch(
    new URL('/config/application', env.COUNTRY_CONFIG_URL),
    { headers: { 'Content-Type': 'application/json' } }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch application config: ${res.status}`)
  }

  return ApplicationConfig.parse(await res.json())
}

/**
 * @returns application configuration, cached in production for up to
 * `EVENT_CONFIG_CACHE_TTL_MS` (always fresh in development).
 */
const getInMemoryApplicationConfig = createTtlConfigCache(
  'application configuration',
  async () => getApplicationConfig()
)

/** @returns the country's time zone (IANA), in which configuration versions take effect. */
export async function getCountryTimeZone(token: TokenWithBearer) {
  return (await getInMemoryApplicationConfig(token)).SYSTEM_IANA_TIMEZONE
}

/**
 * @returns the configuration of each event, at the version in effect today in the
 * country's time zone. For a record, use `getEventConfigurationForRecord` instead.
 */
export async function getInMemoryEventConfigurations(token: TokenWithBearer) {
  const [configurations, timeZone] = await Promise.all([
    getInMemoryVersionedEventConfigurations(token),
    getCountryTimeZone(token)
  ])
  return configurations.map((config) =>
    resolveEventConfigInTimeZone(config, timeZone)
  )
}

async function findEventConfigurationById({
  eventType,
  token
}: {
  eventType: string
  token: TokenWithBearer
}) {
  const configurations = await getInMemoryEventConfigurations(token)
  return configurations.find((config) => config.id === eventType)
}

/** @knipignore */
export async function getEventConfigurationById({
  eventType,
  token
}: {
  eventType: string
  token: TokenWithBearer
}) {
  return getOrThrow(
    await findEventConfigurationById({
      eventType,
      token
    }),
    `No configuration found for event type: ${eventType}`
  )
}

export async function getVersionedEventConfigurationById({
  eventType,
  token
}: {
  eventType: string
  token: TokenWithBearer
}) {
  const configurations = await getInMemoryVersionedEventConfigurations(token)
  return getOrThrow(
    configurations.find((config) => config.id === eventType),
    `No configuration found for event type: ${eventType}`
  )
}

/**
 * @returns the configuration of the version `event` is stamped with: every action on
 * a record uses the version it was created under.
 */
export async function getEventConfigurationForRecord({
  event,
  token
}: {
  event: Pick<EventDocument, 'type' | 'configVersionId'>
  token: TokenWithBearer
}) {
  return getEventConfigForRecord(
    await getVersionedEventConfigurationById({ eventType: event.type, token }),
    event
  )
}

async function getWorkqueueConfigurations(token: TokenWithBearer) {
  const res = await fetch(
    new URL('/config/workqueues', env.COUNTRY_CONFIG_URL),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!res.ok) {
    throw new Error('Failed to fetch workqueue config')
  }

  return array(WorkqueueConfig).parse(await res.json())
}

/**
 * @returns workqueue configurations, cached in production for up to
 * `EVENT_CONFIG_CACHE_TTL_MS` (always fresh in development).
 */
export const getInMemoryWorkqueueConfigurations = createTtlConfigCache(
  'workqueue configurations',
  getWorkqueueConfigurations
)

export async function getRoles() {
  const res = await fetch(new URL('/config/roles', env.COUNTRY_CONFIG_URL), {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch roles config')
  }

  return array(Role).parse(await res.json())
}
