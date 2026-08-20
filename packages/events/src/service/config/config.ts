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
  EventConfig,
  getOrThrow,
  logger,
  Role,
  TokenWithBearer,
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
  fetcher: (token: TokenWithBearer) => Promise<T>,
  afterFetch?: (value: T) => Promise<void>
) {
  let value: T | null = null
  let fetchedAt = 0
  let inFlight: Promise<T> | null = null

  return async function getCached(token: TokenWithBearer): Promise<T> {
    // In development always fetch, so config changes are picked up immediately.
    if (!env.isProduction) {
      const fetched = await fetcher(token)
      await afterFetch?.(fetched)
      return fetched
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
        .then(async (fetched) => {
          // Before the value is served, so search indices are in place by the
          // time the service uses the configuration.
          await afterFetch?.(fetched)
          value = fetched
          fetchedAt = Date.now()
          return fetched
        })
        .catch((error: unknown) => {
          // Bounds retries to one per TTL. Left expired, a failed attempt would
          // turn every subsequent request into another refetch.
          fetchedAt = Date.now()
          throw error
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

/**
 * Countryconfig tags the configuration with an entity tag, so an unchanged
 * configuration costs a 304 instead of retransmitting and reparsing ~150kB on
 * every refetch. Countryconfig versions without the tag answer 200 as before.
 */
let lastFetchedEventConfigurations: {
  etag: string
  configurations: EventConfig[]
} | null = null

export async function getEventConfigurations(token: TokenWithBearer) {
  const res = await fetch(new URL('/config/events', env.COUNTRY_CONFIG_URL), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      ...(lastFetchedEventConfigurations && {
        'If-None-Match': lastFetchedEventConfigurations.etag
      })
    }
  })

  if (res.status === 304 && lastFetchedEventConfigurations) {
    return lastFetchedEventConfigurations.configurations
  }

  if (!res.ok) {
    throw new Error(
      `Failed to fetch events config: ${res.status} ${res.statusText}.`
    )
  }

  const configurations = array(EventConfig).parse(await res.json())
  const etag = res.headers.get('etag')
  lastFetchedEventConfigurations = etag ? { etag, configurations } : null

  return configurations
}

let eventConfigurationsLoadedListener:
  | ((configurations: EventConfig[]) => Promise<void>)
  | null = null

/**
 * Registers the handler run on each fetch of event configurations, to set up
 * search indices for events configured after startup. Registered rather than
 * passed to `createTtlConfigCache` directly: importing indexing here would
 * close a require cycle through the tRPC context.
 */
export function onEventConfigurationsLoaded(
  listener: (configurations: EventConfig[]) => Promise<void>
) {
  eventConfigurationsLoadedListener = listener
}

/**
 * @returns event configurations, cached in production for up to
 * `EVENT_CONFIG_CACHE_TTL_MS` (always fresh in development).
 */
export const getInMemoryEventConfigurations = createTtlConfigCache(
  'event configurations',
  getEventConfigurations,
  async (configurations) => eventConfigurationsLoadedListener?.(configurations)
)

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
