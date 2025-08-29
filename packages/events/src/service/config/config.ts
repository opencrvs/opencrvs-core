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
  EventConfig,
  getOrThrow,
  logger,
  WorkqueueConfig
} from '@opencrvs/commons'
import { Bundle, SavedLocation } from '@opencrvs/commons/types'
import { env } from '@events/environment'
import { Location } from '../locations/locations'

/**
 * During 1.9.0 we support only docker swarm configuration.
 * In docker swarm deployment process updates all the containers.
 * There shouldn't be a situation where countryconfig changes and events do not restart.
 */

let inMemoryEventConfigurations: EventConfig[] | null = null
let inMemoryWorkqueueConfigurations: WorkqueueConfig[] | null = null

async function getEventConfigurations(token: string) {
  const res = await fetch(new URL('/events', env.COUNTRY_CONFIG_URL), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch events config')
  }

  return array(EventConfig).parse(await res.json())
}

/**
 * @returns in-memory event configurations when running in production-like environment.
 */
export async function getInMemoryEventConfigurations(token: string) {
  if (!env.isProduction) {
    logger.info(
      `Running in ${process.env.NODE_ENV} mode. Fetching event configurations from API`
    )
    // In development, we should always fetch the latest configurations
    return getEventConfigurations(token)
  }

  if (inMemoryEventConfigurations) {
    logger.info('Returning in-memory event configurations')
    return inMemoryEventConfigurations
  }

  inMemoryEventConfigurations = await getEventConfigurations(token)
  return inMemoryEventConfigurations
}

async function findEventConfigurationById({
  token,
  eventType
}: {
  token: string
  eventType: string
}) {
  const configurations = await getInMemoryEventConfigurations(token)
  return configurations.find((config) => config.id === eventType)
}

export async function getEventConfigurationById({
  token,
  eventType
}: {
  token: string
  eventType: string
}) {
  return getOrThrow(
    await findEventConfigurationById({
      token,
      eventType
    }),
    `No configuration found for event type: ${eventType}`
  )
}

async function getWorkqueueConfigurations(token: string) {
  const res = await fetch(new URL('/workqueue', env.COUNTRY_CONFIG_URL), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch workqueue config')
  }

  return array(WorkqueueConfig).parse(await res.json())
}

/**
 * @returns in-memory workqueue configurations when running in production-like environment.
 */
export async function getIMemoryWorkqueueConfigurations(token: string) {
  if (!env.isProduction) {
    logger.info(
      `Running in ${process.env.NODE_ENV} mode. Fetching workqueue configurations from API`
    )
    // In production, we should always fetch the latest configurations
    return getWorkqueueConfigurations(token)
  }

  if (inMemoryWorkqueueConfigurations) {
    logger.info('Returning in-memory workqueue configurations')
    return inMemoryWorkqueueConfigurations
  }

  inMemoryWorkqueueConfigurations = await getWorkqueueConfigurations(token)
  return inMemoryWorkqueueConfigurations
}

function parsePartOf(partOf: string | undefined): string | null {
  if (!partOf) {
    return null
  }
  return partOf === 'Location/0' ? null : partOf.split('/')[1]
}

export async function getLocations() {
  const types = ['ADMIN_STRUCTURE', 'CRVS_OFFICE', 'HEALTH_FACILITY']

  const requests = types.map(async (type) => {
    const url = new URL('/locations', env.CONFIG_URL)
    url.searchParams.set('type', type)
    url.searchParams.set('_count', '0')

    return fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })

  const responses = await Promise.all(requests)

  for (const res of responses) {
    if (!res.ok) {
      throw new Error('Failed to fetch locations')
    }
  }

  const results = await Promise.all(
    responses.map(async (res) => res.json() as Promise<Bundle<SavedLocation>>)
  )
  const locations = results
    .flatMap((result) => result.entry.map(({ resource }) => resource))
    .map((entry) => {
      return {
        id: entry.id,
        name: entry.name,
        parentId: parsePartOf(entry.partOf?.reference),
        validUntil: entry.status === 'inactive' ? new Date() : null
      }
    })

  return array(Location).parse(locations)
}
