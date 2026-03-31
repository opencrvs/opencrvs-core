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
  Role,
  TokenWithBearer,
  WorkqueueConfig
} from '@opencrvs/commons'
import { env } from '@events/environment'
/**
 * During 1.9.0 we support only docker swarm configuration.
 * In docker swarm deployment process updates all the containers.
 * There shouldn't be a situation where countryconfig changes and events do not restart.
 */

let inMemoryEventConfigurations: EventConfig[] | null = null
let inMemoryWorkqueueConfigurations: WorkqueueConfig[] | null = null

export async function getEventConfigurations(token: TokenWithBearer) {
  const res = await fetch(new URL('/config/events', env.COUNTRY_CONFIG_URL), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
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
export async function getInMemoryEventConfigurations(token: TokenWithBearer) {
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
 * @returns in-memory workqueue configurations when running in production-like environment.
 */
export async function getInMemoryWorkqueueConfigurations(
  token: TokenWithBearer
) {
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


export async function getRoles(token: TokenWithBearer) {
  const res = await fetch(new URL('/config/roles', env.COUNTRY_CONFIG_URL), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch roles config')
  }

  return array(Role).parse(await res.json())
}

