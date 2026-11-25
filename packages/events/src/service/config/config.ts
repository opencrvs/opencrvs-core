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

import { pick } from 'lodash'
import fetch from 'node-fetch'
import { array, object, string } from 'zod'
import {
  ApplicationConfig,
  EventDocument,
  getEventConfigById,
  getEventConfigForRecord,
  getEventConfigsInLookupOrder,
  logger,
  resolveEventConfigInTimeZone,
  Role,
  toPlainDateInTimeZone,
  validateRoles,
  VersionedEventConfig,
  WorkqueueConfig
} from '@opencrvs/commons'
import { withCoreSignature } from '@opencrvs/commons/request-signing'
import { env } from '@events/environment'
import { getCoreSigningKey } from '@events/request-signing'

/** Reads a configuration endpoint of country config, signed as core. */
async function fetchConfig(path: string) {
  const url = new URL(path, env.COUNTRY_CONFIG_URL)
  return fetch(url, withCoreSignature(getCoreSigningKey(), url))
}

/**
 * Configuration is served from countryconfig, which can be deployed
 * independently of the events service (e.g. a Kubernetes rollout that updates
 * countryconfig but not events). A time-boxed cache keeps configuration off the
 * hot path (it is read on nearly every request, including auth middleware)
 * while bounding how stale it can be to `EVENT_CONFIG_CACHE_TTL_MS` — no events
 * restart is required to pick up a config change.
 */
function createTtlConfigCache<T>(label: string, fetcher: () => Promise<T>) {
  let value: T | null = null
  let fetchedAt = 0
  let inFlight: Promise<T> | null = null

  return async function getCached(): Promise<T> {
    // In development always fetch, so config changes are picked up immediately.
    if (!env.isProduction) {
      return fetcher()
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
      inFlight = fetcher()
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

async function getEventConfigurations() {
  const res = await fetchConfig('/config/events')

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

async function fetchApplicationConfig(): Promise<unknown> {
  const res = await fetchConfig('/config/application')

  if (!res.ok) {
    throw new Error(`Failed to fetch application config: ${res.status}`)
  }

  return res.json()
}

/**
 * @returns application configuration, cached in production for up to
 * `EVENT_CONFIG_CACHE_TTL_MS` (always fresh in development). It keeps the
 * fields that core does not know, because a country config may add some for
 * its own client code.
 */
const getInMemoryApplicationConfig = createTtlConfigCache(
  'application configuration',
  async () => ApplicationConfig.loose().parse(await fetchApplicationConfig())
)

/** @returns the application configuration for signed-in users and systems. */
export async function getClientApplicationConfig() {
  return getInMemoryApplicationConfig()
}

/** The application configuration fields the login page shows before sign-in. */
const PUBLIC_APPLICATION_CONFIG_FIELDS = [
  'APPLICATION_NAME',
  'COUNTRY_LOGO',
  'PHONE_NUMBER_PATTERN',
  'USER_NOTIFICATION_DELIVERY_METHOD',
  'INFORMANT_NOTIFICATION_DELIVERY_METHOD'
] as const

/** @returns only the application configuration fields that anyone may read. */
export async function getPublicApplicationConfig() {
  return pick(
    await getInMemoryApplicationConfig(),
    PUBLIC_APPLICATION_CONFIG_FIELDS
  )
}

/** @returns the country's time zone (IANA), in which configuration versions take effect. */
export async function getCountryTimeZone() {
  return (await getInMemoryApplicationConfig()).SYSTEM_IANA_TIMEZONE
}

/** @returns today's date in the country's time zone. */
export async function getCountryToday() {
  return toPlainDateInTimeZone(new Date(), await getCountryTimeZone())
}

/**
 * @returns the configuration of each event, at the version in effect today in the
 * country's time zone. For a record, use `getEventConfigurationForRecord` instead.
 */
export async function getInMemoryEventConfigurations() {
  const [configurations, timeZone] = await Promise.all([
    getInMemoryVersionedEventConfigurations(),
    getCountryTimeZone()
  ])
  return configurations.map((config) =>
    resolveEventConfigInTimeZone(config, timeZone)
  )
}

/**
 * @returns the configuration of every version of every event. The versions of each event
 * are in the order to look up a field in, so the first match is the newest version in effect.
 */
export async function getInMemoryEventConfigurationsInLookupOrder() {
  const [configurations, timeZone] = await Promise.all([
    getInMemoryVersionedEventConfigurations(),
    getCountryTimeZone()
  ])
  const today = toPlainDateInTimeZone(new Date(), timeZone)
  return configurations.flatMap((config) =>
    getEventConfigsInLookupOrder(config, today)
  )
}

export async function getVersionedEventConfigurationById({
  eventType
}: {
  eventType: string
}) {
  return getEventConfigById(
    await getInMemoryVersionedEventConfigurations(),
    eventType
  )
}

/**
 * @returns the configuration of the version `event` is stamped with: every action on
 * a record uses the version it was created under.
 */
export async function getEventConfigurationForRecord({
  event
}: {
  event: Pick<EventDocument, 'type' | 'configVersionId'>
}) {
  return getEventConfigForRecord(
    await getVersionedEventConfigurationById({ eventType: event.type }),
    event
  )
}

async function getWorkqueueConfigurations() {
  const res = await fetchConfig('/config/workqueues')

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

async function getRoles() {
  const res = await fetchConfig('/config/roles')

  if (!res.ok) {
    throw new Error('Failed to fetch roles config')
  }

  const eventConfigurations = await getInMemoryVersionedEventConfigurations()
  const roles = array(Role).parse(await res.json())

  validateRoles(roles, eventConfigurations)

  return roles
}

export const getInMemoryRoles = createTtlConfigCache('roles', getRoles)

/** Certificate templates are opaque to core, apart from their id. */
const CertificateConfig = object({ id: string() }).passthrough()

async function getCertificateConfigurations() {
  const res = await fetchConfig('/certificates')

  if (!res.ok) {
    throw new Error(`Failed to fetch certificates config: ${res.status}`)
  }

  return array(CertificateConfig).parse(await res.json())
}

/**
 * @returns certificate configurations, cached in production for up to
 * `EVENT_CONFIG_CACHE_TTL_MS` (always fresh in development).
 */
export const getInMemoryCertificateConfigurations = createTtlConfigCache(
  'certificate configurations',
  getCertificateConfigurations
)
