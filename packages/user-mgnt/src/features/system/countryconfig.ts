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
import { env } from '@user-mgnt/environment'
import { EventConfig, joinUrl, logger } from '@opencrvs/commons'
import fetch from 'node-fetch'

/**
 * During 1.9.0 we support only docker swarm configuration.
 * In docker swarm deployment process updates all the containers.
 * There shouldn't be a situation where countryconfig changes and events do not restart.
 */

let inMemoryEventConfigurations: EventConfig[] | null = null

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

async function getEventConfigurations(authorization: string) {
  const url = joinUrl(env.COUNTRY_CONFIG_URL, '/events')

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization
    }
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch event configurations: ${res.statusText}`)
  }

  const json = await res.json()
  return json as EventConfig[]
}
